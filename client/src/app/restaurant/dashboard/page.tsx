"use client";

import { useAuth } from "@/context/AuthContext";
import { withAuth } from "@/components/withAuth";
import useSWR, { mutate } from "swr";
import { authenticatedFetcher } from "@/context/AuthContext";
import { useState, useMemo } from "react";
import CustomerName from "@/components/CustomerName";
import { ChevronDown, Settings } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/utils/api";

// Define FoodItem type here
export interface FoodItem {
	id: string;
	title: string;
	price: number;
	image: string;
}

// Basic Order type
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
	id: string;
	restaurant_name: string;
	avg_wait_time: number;
	menu: FoodItem[];
	orders: Order[];
}

/**
 * The main dashboard for restaurant users.
 * This page displays a list of active orders, allowing the restaurant to manage their status.
 * It also provides a navigation link to the settings page.
 */
function RestaurantDashboard() {
	const { user } = useAuth();
	// This state keeps track of orders that have been marked 'delivered'
	// to apply a smooth removal animation from the UI.
	const [removingOrderIds, setRemovingOrderIds] = useState<string[]>([]);

	const swrKey = user ? getApiUrl("/restaurants/me") : null;

	// Fetch all restaurant data, which includes the list of orders.
	const { data, error, isLoading } = useSWR<RestaurantData>(
		swrKey,
		authenticatedFetcher
	);

	// useMemo is used to prevent re-calculating the active orders on every render.
	// The list is re-calculated only when the source `data.orders` or `removingOrderIds` changes.
	const activeOrders = useMemo(() => {
		if (!data?.orders) return [];
		return data.orders
			.filter(
				(order) =>
					// Active orders are those that are not yet delivered or cancelled.
					order.status === "pending" ||
					order.status === "preparing" ||
					order.status === "ready" ||
					// We also include 'delivered' orders that are still in the 'removing' state
					// to give them a moment before they disappear from the UI.
					(order.status === "delivered" &&
						removingOrderIds.includes(order.id))
			)
			.sort(
				(a, b) =>
					// Sort by most recent first.
					new Date(b.created_at).getTime() -
					new Date(a.created_at).getTime()
			);
	}, [data?.orders, removingOrderIds]);

	const handleStatusChange = async (orderId: string, newStatus: string) => {
		// Optimistically update the order status in the UI.
		const optimisticData = {
			...data,
			orders:
				data?.orders.map((order) =>
					order.id === orderId
						? { ...order, status: newStatus }
						: order
				) || [],
		};

		// Immediately update the UI with the new status without re-fetching.
		mutate(swrKey, optimisticData, false);

		// If an order is marked as 'delivered', add it to the `removingOrderIds` list.
		// This will keep it visible for a short duration before it's filtered out.
		if (newStatus === "delivered") {
			setRemovingOrderIds((prev) => [...prev, orderId]);
		}

		try {
			await fetch(getApiUrl(`/orders/${orderId}/status`), {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ status: newStatus }),
			});

			// If the order was delivered, set a timeout to remove it from the UI after 2 seconds.
			// This provides a smoother user experience than having it disappear instantly.
			if (newStatus === "delivered") {
				setTimeout(() => {
					// Create the final list of orders, excluding the one that was just delivered.
					const finalData = {
						...data,
						orders:
							data?.orders.filter(
								(order) => order.id !== orderId
							) || [],
					};
					// Update the SWR cache with the final data.
					mutate(swrKey, finalData, false);
					// Also remove the order ID from the `removingOrderIds` state.
					setRemovingOrderIds((prev) =>
						prev.filter((id) => id !== orderId)
					);
				}, 2000);
			} else {
				// For other status changes, just re-fetch to confirm
				mutate(swrKey);
			}
		} catch (error) {
			console.error("Error updating status:", error);
			// Rollback on error
			mutate(swrKey);
			setRemovingOrderIds((prev) => prev.filter((id) => id !== orderId));
			alert("Failed to update status.");
		}
	};

	if (isLoading) {
		return <div className="text-center p-8">Loading dashboard...</div>;
	}

	if (error) {
		return (
			<div className="text-center p-8 text-red-500">
				Failed to load restaurant data.
			</div>
		);
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold dark:text-slate-100">
					Dashboard
				</h1>
				<Link
					href="/restaurant/settings"
					className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
				>
					Settings
					<Settings className="w-4 h-4" />
				</Link>
			</div>

			<div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
				<h2 className="text-2xl font-semibold mb-4 dark:text-slate-100">
					Active Orders
				</h2>
				<div className="space-y-4">
					{activeOrders.length > 0 ? (
						activeOrders.map((order) => (
							<div
								key={order.id}
								className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg"
							>
								<div>
									<p className="font-semibold dark:text-slate-100">
										Order for:{" "}
										<CustomerName
											customerId={order.customer_id}
										/>
										<span className="text-gray-500 font-normal ml-2 dark:text-gray-400">
											- {order.food.title}
										</span>
									</p>
									<p className="dark:text-slate-100">
										Status:{" "}
										<span className="font-mono bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded">
											{order.status}
										</span>
									</p>
								</div>
								<div className="relative">
									<select
										value={order.status}
										onChange={(e) =>
											handleStatusChange(
												order.id,
												e.target.value
											)
										}
										className="appearance-none w-full p-2 pl-4 pr-8 rounded-md bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
									>
										<option value="pending">Pending</option>
										<option value="preparing">
											Preparing
										</option>
										<option value="ready">
											Ready for Pickup
										</option>
										<option value="delivered">
											Delivered
										</option>
										<option value="cancelled">
											Cancel
										</option>
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
										<ChevronDown className="w-4 h-4" />
									</div>
								</div>
							</div>
						))
					) : (
						<p className="dark:text-slate-100">
							No active orders right now.
						</p>
					)}
				</div>
			</div>
		</main>
	);
}

export default withAuth(RestaurantDashboard, { requiredRole: "restaurant" });
