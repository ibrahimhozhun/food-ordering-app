"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import { authenticatedFetcher } from "@/context/AuthContext";
import MenuItem from "@/components/MenuItem";
import { getApiUrl } from "@/utils/api";

// Define the type for a food item right here, as it's used in this component.
interface FoodItem {
	id: string;
	title: string;
	image: string;
	price: number;
}

function RestaurantDetailPage() {
	const params = useParams();
	const router = useRouter();
	const restaurantId = params.id as string;
	const { user } = useAuth();
	const {
		data: restaurant,
		error,
		isLoading,
	} = useSWR(
		restaurantId ? getApiUrl(`/restaurants/${restaurantId}`) : null,
		authenticatedFetcher
	);

	const handleAddToOrder = async (foodId: string) => {
		if (!user) {
			alert("Please sign in to place an order.");
			router.push("/signin");
			return;
		}

		try {
			const response = await fetch(getApiUrl("/orders/new-order"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					customer_id: user.id,
					restaurant_id: restaurantId,
					food_id: foodId,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.detail || "Failed to create order");
			}

			const newOrder = await response.json();

			// Navigate to the order tracking page
			router.push(`/order/${newOrder.id}`);
		} catch (e: unknown) {
			const error = e as Error;
			console.error("Error creating order:", error);
			alert(`Error: ${error.message}`);
		}
	};

	if (isLoading) return <div className="text-center p-8">Loading...</div>;
	if (error)
		return (
			<div className="text-center p-8 text-red-500">
				Failed to load restaurant details.
			</div>
		);
	if (!restaurant) return null;

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
				<div className="p-6">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
						{restaurant.restaurant_name}
					</h1>
					<p className="text-gray-600 dark:text-gray-400 mt-2">
						Welcome! Here&apos;s our menu.
					</p>
				</div>

				<div className="p-6">
					<h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-200 mb-4">
						Menu
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
						{restaurant.menu.map((item: FoodItem) => (
							<MenuItem
								key={item.id}
								{...item}
								onAddToOrder={() => handleAddToOrder(item.id)}
							/>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}

export default RestaurantDetailPage;
