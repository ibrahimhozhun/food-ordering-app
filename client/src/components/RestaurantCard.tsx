"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Heart } from "lucide-react";
import { mutate } from "swr";
import { getApiUrl } from "@/utils/api";
// import Image from "next/image";

interface RestaurantCardProps {
	id: string;
	name: string;
	avg_wait_time?: number;
	image?: string;
}

export default function RestaurantCard({
	id,
	name,
	avg_wait_time,
}: // image,
RestaurantCardProps) {
	const { user } = useAuth(); // Access user from AuthContext

	// Check if the restaurant is liked by the current user
	const isLiked = user?.liked_restaurants?.some(
		(restaurant) => restaurant.id === id
	);

	const handleLike = async (e: React.MouseEvent) => {
		e.preventDefault(); // Prevent navigating when clicking the button
		e.stopPropagation(); // Stop the event from bubbling up to the parent Link component

		if (!user) {
			// Handle case where user is not logged in
			alert("Please log in to like restaurants.");
			return;
		}

		// --- Optimistic UI Update ---
		// To make the UI feel instant, we'll immediately update the local state
		// before the API call even finishes.

		// 1. Calculate the 'optimistic' state of the liked restaurants list.
		const optimisticLikedRestaurants = isLiked
			? (user?.liked_restaurants || []).filter((r) => r.id !== id)
			: [
					...(user?.liked_restaurants || []),
					{ id, restaurant_name: name },
			  ];

		// 2. Update the local SWR cache with this optimistic data.
		// The `false` flag tells SWR not to revalidate (i.e., not to refetch from the API) yet.
		mutate(
			getApiUrl("/auth/me"),
			{ ...user, liked_restaurants: optimisticLikedRestaurants },
			false
		);

		// 3. Now, send the actual API request.
		try {
			const response = await fetch(
				getApiUrl(`/customers/me/liked-restaurants`),
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ restaurant_id: id }),
				}
			);

			if (!response.ok) throw new Error("Failed to like restaurant.");

			// 4. If the API call is successful, revalidate the data from the server
			// to ensure our UI has the canonical, freshest data.
			mutate(getApiUrl("/auth/me"));
		} catch (error) {
			console.error(error);
			// 5. If the API call fails, we must roll back the optimistic update
			// by revalidating the data, which fetches the original state from the server.
			mutate(getApiUrl("/auth/me"));
		}
	};

	return (
		<Link href={`/restaurant/${id}`}>
			<div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer p-4 h-full flex flex-col justify-between">
				<button
					onClick={handleLike}
					className="absolute top-2 right-2 p-2 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm"
					aria-label={
						isLiked ? "Unlike restaurant" : "Like restaurant"
					}
				>
					<Heart
						className={`w-6 h-6 ${
							isLiked
								? "text-red-500 fill-current"
								: "text-gray-500"
						}`}
					/>
				</button>
				{/* Image implementation will be added later
				{image && (
					<div className="relative h-48 mb-4">
						<Image
							src={image}
							alt={name}
							fill
							className="object-cover rounded-t-lg"
						/>
					</div>
				)}
				*/}
				<div>
					<h3 className="text-xl font-semibold text-[var(--parliament-blue)] dark:text-slate-100">
						{name}
					</h3>
					{avg_wait_time && (
						<p className="text-gray-600 dark:text-gray-400 mt-2">
							Average wait time: {avg_wait_time} minutes
						</p>
					)}
				</div>
			</div>
		</Link>
	);
}
