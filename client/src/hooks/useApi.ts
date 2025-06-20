import { getApiUrl } from "@/utils/api";
import useSWR from "swr";

const fetcher = async (url: string) => {
	const response = await fetch(getApiUrl(url), {
		credentials: "include",
	});
	if (!response.ok) {
		throw new Error("An error occurred while fetching the data.");
	}
	return response.json();
};

export function useRestaurants<T>() {
	return useSWR<T>("/restaurants", fetcher);
}

export function useRestaurant<T>(id: string) {
	return useSWR<T>(id ? `/restaurants/${id}` : null, fetcher);
}

export function useOrders<T>(customerId?: string) {
	return useSWR<T>(
		customerId ? `/customers/${customerId}/orders` : null,
		fetcher
	);
}

export function useRestaurantOrders<T>(restaurantId?: string) {
	return useSWR<T>(
		restaurantId ? `/restaurants/${restaurantId}/orders` : null,
		fetcher
	);
}
