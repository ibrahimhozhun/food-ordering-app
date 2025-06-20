"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, ComponentType } from "react";

type Role = "customer" | "restaurant";

interface WithAuthProps {
	requiredRole?: Role;
	redirectTo?: string;
}

export function withAuth<P extends object>(
	WrappedComponent: ComponentType<P>,
	{ requiredRole, redirectTo = "/signin" }: WithAuthProps = {}
) {
	return function WithAuthComponent(props: P) {
		const { user, isLoading } = useAuth();
		const router = useRouter();
		const [isVerified, setIsVerified] = useState(false);

		useEffect(() => {
			if (isLoading) {
				return; // Wait until loading is finished
			}

			if (!user) {
				// Not authenticated, redirect to the sign-in page
				router.replace(redirectTo);
				return; // Stop execution
			}

			// At this point, user is authenticated. Now, check the role.
			const userRole = user.restaurant_name ? "restaurant" : "customer";

			if (requiredRole && userRole !== requiredRole) {
				// User has the wrong role. Redirect them appropriately.
				const redirectUrl =
					userRole === "restaurant" ? "/restaurant/dashboard" : "/";
				router.replace(redirectUrl);
				return; // Stop execution
			}

			// If we reach here, the user is authenticated and has the correct role.
			setIsVerified(true);
		}, [user, isLoading, router]);

		// While loading or verifying, show a loading indicator or nothing.
		// This prevents the flicker of the protected page.
		if (!isVerified) {
			return null; // Or return a loading spinner component
		}

		// If verification is successful, render the component.
		return <WrappedComponent {...props} />;
	};
}
