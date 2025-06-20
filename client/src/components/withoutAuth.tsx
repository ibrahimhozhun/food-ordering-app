"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ComponentType } from "react";

export function withoutAuth<P extends object>(
	WrappedComponent: ComponentType<P>
) {
	return function WithoutAuthComponent(props: P) {
		const { user, isLoading } = useAuth();
		const router = useRouter();

		useEffect(() => {
			if (!isLoading && user) {
				// User is authenticated, redirect to home
				const redirectPath = user.restaurant_name
					? "/restaurant/dashboard"
					: "/";
				router.replace(redirectPath);
			}
		}, [user, isLoading, router]);

		// Show nothing while loading
		if (isLoading) {
			return null;
		}

		// If we don't have a user, render the component
		if (!user) {
			return <WrappedComponent {...props} />;
		}

		// Otherwise, render nothing while redirecting
		return null;
	};
}
