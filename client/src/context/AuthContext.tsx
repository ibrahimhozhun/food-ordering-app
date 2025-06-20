"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import useSWR, { SWRConfig, mutate as globalMutate, mutate } from "swr";
import { getApiUrl } from "@/utils/api";

/**
 * The User interface defines the shape of the user object that is available
 * throughout the application. It includes details for both customers and restaurants,
 * with optional fields to accommodate both user roles.
 */
interface User {
	id: string;
	username: string;
	email: string;
	// Restaurant-specific fields
	restaurant_name?: string;
	avg_wait_time?: number;
	menu?: Array<{
		id: string;
		title: string;
		image: string;
		price: number;
	}>;
	// Customer-specific fields
	liked_restaurants?: Array<{
		id: string;
		restaurant_name: string;
	}>;
	// Shared fields
	orders?: Array<{
		id: string;
		status: string;
		created_at: string;
		restaurant_id: string;
		food: {
			title: string;
		};
	}>;
}

type UserRole = "customer" | "restaurant";

interface SignUpData {
	username: string;
	email: string;
	password: string;
	restaurant_name?: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	signIn: (email: string, password: string, role: UserRole) => Promise<void>;
	signUp: (data: SignUpData, role: UserRole) => Promise<void>;
	signOut: () => Promise<void>;
}

/**
 * A custom fetcher function for SWR that automatically includes credentials
 * (like cookies) in the request. This is essential for authenticated API calls.
 * It also handles basic error checking.
 */
export const authenticatedFetcher = async (url: string) => {
	const response = await fetch(url, {
		credentials: "include", // Important for sending cookies
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (response.status === 401) {
		// This can be used to automatically trigger a sign-out or refresh token logic
		throw new Error("Authentication expired");
	}

	if (!response.ok) {
		throw new Error("An error occurred while fetching the data.");
	}

	return response.json();
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * The AuthProvider component is the core of the authentication system.
 * It uses SWR to fetch and cache the current user's data from the `/auth/me` endpoint.
 * This data is then made available to all child components through the AuthContext.
 * It also provides `signIn`, `signUp`, and `signOut` methods.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const router = useRouter();

	// SWR hook to continuously fetch user data.
	// The key `http://localhost:8000/auth/me` is used to cache the data.
	// Any component can re-trigger this fetch by calling `mutate(...)`.
	const { data: user, error } = useSWR<User | null>(
		getApiUrl("/auth/me"),
		authenticatedFetcher
	);

	// isLoading is true only on the initial load before `user` or `error` is defined.
	const isLoading = !error && user === undefined;

	const signIn = async (email: string, password: string, role: UserRole) => {
		try {
			const response = await fetch(
				getApiUrl(`/auth/signin/${role.toUpperCase()}`),
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email, password }),
				}
			);

			if (!response.ok) {
				throw new Error("Invalid credentials");
			}

			// The backend sets an HttpOnly cookie. We don't need to handle the response body.
			// Instead, we trigger a revalidation of the /auth/me endpoint,
			// which will re-fetch the user's data and update the global state.
			await mutate(getApiUrl("/auth/me"));
			router.push(role === "restaurant" ? "/restaurant/dashboard" : "/");
		} catch (error) {
			console.error("Sign in failed:", error);
			throw error;
		}
	};

	const signUp = async (data: SignUpData, role: UserRole) => {
		try {
			const response = await fetch(
				getApiUrl(`/auth/signup/${role.toUpperCase()}`),
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				}
			);

			if (!response.ok) {
				throw new Error("Sign up failed");
			}

			// The backend sets an HttpOnly cookie. The response body is not needed.
			// Triggering a revalidation of /auth/me will fetch the new user's data.
			await mutate(getApiUrl("/auth/me"));
			router.push(role === "restaurant" ? "/restaurant/dashboard" : "/");
		} catch (error) {
			console.error("Sign up failed:", error);
			throw error;
		}
	};

	const signOut = async () => {
		try {
			await fetch(getApiUrl("/auth/signout"), {
				method: "POST",
				credentials: "include",
			});
			// Immediately clear the local user data without a re-fetch,
			// and then redirect to the sign-in page.
			globalMutate(getApiUrl("/auth/me"), null, false);
			router.push("/signin");
		} catch (error) {
			console.error("Sign out failed:", error);
			throw error;
		}
	};

	return (
		<SWRConfig
			value={{
				fetcher: authenticatedFetcher,
				shouldRetryOnError: false, // Prevents SWR from retrying on 4xx/5xx errors
			}}
		>
			<AuthContext.Provider
				value={{
					user: user || null,
					isLoading,
					signIn,
					signUp,
					signOut,
				}}
			>
				{children}
			</AuthContext.Provider>
		</SWRConfig>
	);
}

/**
 * Custom hook to easily access the authentication context (user, methods, etc.).
 * Throws an error if used outside of an `AuthProvider` to prevent runtime issues.
 */
export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
