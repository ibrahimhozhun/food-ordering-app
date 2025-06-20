"use client";

import { useAuth } from "@/context/AuthContext";
import { withAuth } from "@/components/withAuth";
import Link from "next/link";
import RestaurantName from "@/components/RestaurantName";

// This page will use the `user` object from AuthContext,
// which already contains the list of orders.

function MyOrdersPage() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return <div className="text-center p-8">Loading your orders...</div>;
	}

	if (!user || !user.orders || user.orders.length === 0) {
		return (
			<main className="container mx-auto px-4 py-8 text-center">
				<h1 className="text-3xl font-bold mb-8">My Orders</h1>
				<p>{"You haven't placed any orders yet."}</p>
			</main>
		);
	}

	return (
		<main className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">My Orders</h1>
			<div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
				<div className="space-y-4">
					{user.orders
						.sort(
							(a, b) =>
								new Date(b.created_at).getTime() -
								new Date(a.created_at).getTime()
						)
						.map((order) => (
							<div
								key={order.id}
								className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg gap-4"
							>
								<div className="flex-grow">
									<p className="font-semibold">
										<RestaurantName
											restaurantId={order.restaurant_id}
										/>
									</p>
									<p className="text-gray-600 dark:text-gray-300">
										{order.food.title}
									</p>
									<p className="text-sm text-gray-500">
										Ordered on:{" "}
										{new Date(
											order.created_at
										).toLocaleString()}
									</p>
								</div>
								<div className="flex items-center gap-4">
									<span
										className={`font-mono px-3 py-1 rounded-full text-sm font-semibold ${
											order.status === "delivered"
												? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
												: order.status === "cancelled"
												? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
												: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
										}`}
									>
										{order.status}
									</span>
									<Link
										href={`/order/${order.id}`}
										className="bg-emerald-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-emerald-700 transition-colors"
									>
										Track
									</Link>
								</div>
							</div>
						))}
				</div>
			</div>
		</main>
	);
}

export default withAuth(MyOrdersPage, { requiredRole: "customer" });
