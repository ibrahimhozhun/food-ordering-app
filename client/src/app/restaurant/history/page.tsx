"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { withAuth } from "@/components/withAuth";
import { useAuth } from "@/context/AuthContext";
import { authenticatedFetcher } from "@/context/AuthContext";
import CustomerName from "@/components/CustomerName";
import { getApiUrl } from "@/utils/api";

// Interfaces to match the data structure
interface Order {
	id: string;
	status: string;
	customer_id: string;
	created_at: string;
	food: {
		title: string;
	};
}

interface RestaurantData {
	orders: Order[];
}

/**
 * Displays a historical list of all 'delivered' or 'cancelled' orders for the restaurant.
 */
function OrderHistoryPage() {
	const { user } = useAuth();

	// Fetch the restaurant's data, which includes a complete list of all orders.
	const { data, error, isLoading } = useSWR<RestaurantData>(
		user ? getApiUrl("/restaurants/me") : null,
		authenticatedFetcher
	);

	// useMemo will cache the filtered and sorted list of historical orders.
	// The list is only recomputed if the source `data.orders` array changes.
	const historicalOrders = useMemo(() => {
		if (!data?.orders) return [];
		return data.orders
			.filter(
				(order) =>
					// Only include orders that are considered final.
					order.status === "delivered" || order.status === "cancelled"
			)
			.sort(
				(a, b) =>
					// Sort by most recent first.
					new Date(b.created_at).getTime() -
					new Date(a.created_at).getTime()
			);
	}, [data?.orders]);

	if (isLoading) {
		return <div className="text-center p-8">Loading order history...</div>;
	}

	if (error) {
		return (
			<div className="text-center p-8 text-red-500">
				Failed to load order history.
			</div>
		);
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8 dark:text-slate-100">
				Order History
			</h1>
			<div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
				<div className="space-y-4">
					{historicalOrders.length > 0 ? (
						historicalOrders.map((order) => (
							<div
								key={order.id}
								className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
							>
								<div className="flex-grow">
									<p className="font-semibold dark:text-slate-100">
										Order for:{" "}
										<CustomerName
											customerId={order.customer_id}
										/>
										<span className="text-gray-500 font-normal ml-2 dark:text-gray-400">
											- {order.food.title}
										</span>
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Ordered on:{" "}
										{new Date(
											order.created_at
										).toLocaleString()}
									</p>
								</div>
								<span
									className={`font-mono px-3 py-1 rounded-full text-sm font-semibold ${
										order.status === "delivered"
											? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
											: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
									}`}
								>
									{order.status}
								</span>
							</div>
						))
					) : (
						<p className="dark:text-slate-100">
							No historical orders found.
						</p>
					)}
				</div>
			</div>
		</main>
	);
}

export default withAuth(OrderHistoryPage, { requiredRole: "restaurant" });
