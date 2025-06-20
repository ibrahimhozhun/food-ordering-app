"use client";

import useSWR from "swr";
import { authenticatedFetcher } from "@/context/AuthContext";
import { getApiUrl } from "@/utils/api";

interface RestaurantPublic {
	id: string;
	restaurant_name: string;
}

interface RestaurantNameProps {
	restaurantId: string;
}

export default function RestaurantName({ restaurantId }: RestaurantNameProps) {
	const { data: restaurant, error } = useSWR<RestaurantPublic>(
		restaurantId ? getApiUrl(`/restaurants/${restaurantId}`) : null,
		authenticatedFetcher
	);

	if (error) return <span className="text-red-500">Unknown Restaurant</span>;
	if (!restaurant) return <span>...</span>;

	return <span>{restaurant.restaurant_name}</span>;
}
