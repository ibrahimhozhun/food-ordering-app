"use client";

import { useParams } from "next/navigation";
import { withAuth } from "@/components/withAuth";
import { PackageCheck, ChefHat, Lollipop, CheckCircle2 } from "lucide-react";
import useSWR from "swr";
import { authenticatedFetcher } from "@/context/AuthContext";
import { getApiUrl } from "@/utils/api";

// Define the possible order statuses
type OrderStatus =
	| "pending"
	| "preparing"
	| "ready"
	| "delivered"
	| "cancelled";

interface Order {
	id: string;
	status: OrderStatus;
	// Add other order properties if needed
}

const statusDetails = {
	pending: {
		text: "Order Placed",
		icon: <PackageCheck className="w-12 h-12 text-gray-500" />,
		color: "text-gray-500",
	},
	preparing: {
		text: "In the Kitchen",
		icon: <ChefHat className="w-12 h-12 text-yellow-500" />,
		color: "text-yellow-500",
	},
	ready: {
		text: "Ready for Pickup",
		icon: <Lollipop className="w-12 h-12 text-emerald-500" />,
		color: "text-emerald-500",
	},
	delivered: {
		text: "Order Delivered",
		icon: <CheckCircle2 className="w-12 h-12 text-blue-500" />,
		color: "text-blue-500",
	},
	cancelled: {
		text: "Order Cancelled",
		icon: <CheckCircle2 className="w-12 h-12 text-red-500" />,
		color: "text-red-500",
	},
};

function OrderTrackingPage() {
	const params = useParams();
	const orderId = params.id as string;

	// Use SWR to fetch and poll the order status.
	// It will refetch every 5 seconds.
	const {
		data: order,
		error,
		isLoading,
	} = useSWR<Order>(
		orderId ? getApiUrl(`/orders/${orderId}`) : null,
		authenticatedFetcher,
		{
			refreshInterval: 5000, // 5 seconds
		}
	);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				Loading order status...
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center h-screen text-red-500">
				Failed to load order details. You may not have permission to
				view this order.
			</div>
		);
	}

	const currentStatus =
		statusDetails[order?.status || "pending"] || statusDetails.pending;

	return (
		<main className="container mx-auto px-4 py-12">
			<div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
				<h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100 mb-2">
					Tracking Your Order
				</h1>
				<p className="text-gray-500 dark:text-gray-400 mb-8">
					Order ID: {orderId}
				</p>

				<div className="flex flex-col items-center justify-center my-12">
					<div
						className={`mb-4 transition-transform duration-500 transform scale-125`}
					>
						{currentStatus.icon}
					</div>
					<p
						className={`text-2xl font-semibold transition-colors duration-500 ${currentStatus.color}`}
					>
						{currentStatus.text}
					</p>
				</div>

				<p className="text-sm text-gray-500 dark:text-gray-400 mt-12">
					This page updates automatically.
				</p>
			</div>
		</main>
	);
}

// Any authenticated user who has an order should be able to see this page.
export default withAuth(OrderTrackingPage);
