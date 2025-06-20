"use client";

import RestaurantCard from "@/components/RestaurantCard";
import { useApp } from "@/context/AppContext";
import { useEffect } from "react";
import { withAuth } from "@/components/withAuth";
import { getApiUrl } from "@/utils/api";

async function getRestaurants() {
	const response = await fetch(getApiUrl("/restaurants"), {
		cache: "no-store",
	});
	if (!response.ok) {
		throw new Error("Failed to fetch restaurants");
	}
	const data = await response.json();
	return data;
}

function Home() {
	const { setRestaurants, restaurants } = useApp();

	useEffect(() => {
		const fetchData = async () => {
			const data = await getRestaurants();
			setRestaurants(data);
		};

		if (!restaurants) {
			fetchData();
		}
	}, [setRestaurants, restaurants]);

	if (!restaurants) {
		return <div>Loading...</div>;
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold text-center text-[var(--parliament-blue)] dark:text-slate-100 mb-8">
				Restaurants
			</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{restaurants.map((restaurant) => (
					<RestaurantCard
						key={restaurant.id}
						id={restaurant.id}
						name={restaurant.restaurant_name}
						avg_wait_time={restaurant.avg_wait_time}
						image={restaurant.image}
					/>
				))}
			</div>
		</main>
	);
}

// Protect the home page for customer users only
export default withAuth(Home, { requiredRole: "customer" });
