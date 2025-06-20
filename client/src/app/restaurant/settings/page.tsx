"use client";

import { useAuth } from "@/context/AuthContext";
import { withAuth } from "@/components/withAuth";
import MenuManagementModal from "@/components/MenuManagementModal";
import useSWR, { mutate } from "swr";
import { authenticatedFetcher } from "@/context/AuthContext";
import { useState } from "react";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { getApiUrl } from "@/utils/api";

// Define FoodItem type here
export interface FoodItem {
	id: string;
	title: string;
	price: number;
	image: string;
}

interface RestaurantData {
	id: string;
	restaurant_name: string;
	avg_wait_time: number;
	menu: FoodItem[];
}

/**
 * A dedicated page for restaurant users to manage their settings,
 * including their menu and general information like average wait time.
 */
function RestaurantSettingsPage() {
	const { user } = useAuth();
	const [isModalOpen, setModalOpen] = useState(false);
	// State to manage the input for average wait time.
	// It's initialized to `undefined` and then populated from the fetched data.
	const [waitTime, setWaitTime] = useState<number | undefined>(undefined);

	const swrKey = user ? getApiUrl("/restaurants/me") : null;

	// Fetch the restaurant's data. We use the `onSuccess` callback
	// to initialize the `waitTime` state once the data is loaded.
	const { data, error, isLoading } = useSWR<RestaurantData>(
		swrKey,
		authenticatedFetcher,
		{
			onSuccess: (data) => {
				// Only set the waitTime from fetched data on the initial load.
				// This prevents overwriting the user's input if the data revalidates.
				if (waitTime === undefined) {
					setWaitTime(data.avg_wait_time);
				}
			},
		}
	);

	/**
	 * Handles both creating a new menu item and updating an existing one.
	 * The logic is controlled by the presence of an `id`.
	 */
	const handleSaveItem = async (
		itemData: Omit<FoodItem, "id">,
		id?: string
	) => {
		const url = id
			? getApiUrl(`/restaurants/me/menu/${id}`)
			: getApiUrl(`/restaurants/me/menu`);
		const method = id ? "PATCH" : "POST";

		try {
			const response = await fetch(url, {
				method: method,
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(itemData),
			});

			if (!response.ok) {
				throw new Error("Failed to save menu item");
			}
			// Revalidate the SWR cache to show the updated menu.
			mutate(getApiUrl("/restaurants/me"));
			setModalOpen(false); // Close modal on success
		} catch (error) {
			console.error("Error saving item:", error);
			alert("Failed to save item.");
		}
	};

	/**
	 * Deletes a menu item by its ID.
	 */
	const handleDeleteItem = async (id: string) => {
		try {
			const response = await fetch(
				getApiUrl(`/restaurants/me/menu/${id}`),
				{
					method: "DELETE",
					credentials: "include",
				}
			);
			if (!response.ok) {
				throw new Error("Failed to delete menu item.");
			}
			// Revalidate the SWR cache to reflect the deletion.
			mutate(getApiUrl("/restaurants/me"));
		} catch (error) {
			console.error("Error deleting item:", error);
			alert("Failed to delete item.");
		}
	};

	/**
	 * Saves the updated average wait time.
	 * Includes an optimistic UI update for a smoother user experience.
	 */
	const handleSaveWaitTime = async () => {
		// Prevent API call if the value hasn't changed.
		if (waitTime === undefined || waitTime === data?.avg_wait_time) return;

		// Optimistically update the UI.
		const optimisticData = { ...data, avg_wait_time: waitTime };
		mutate(swrKey, optimisticData, false);

		try {
			await fetch(getApiUrl(`/restaurants/me`), {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ avg_wait_time: waitTime }),
			});
			// Revalidate the data to confirm the change.
			mutate(swrKey);
		} catch (error) {
			console.error("Error updating wait time:", error);
			mutate(swrKey); // Revert on error
			alert("Failed to update wait time.");
		}
	};

	if (isLoading) {
		return <div className="text-center p-8">Loading settings...</div>;
	}

	if (error) {
		return (
			<div className="text-center p-8 text-red-500">
				Failed to load restaurant data.
			</div>
		);
	}

	const menu = data?.menu || [];

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold dark:text-slate-100">
					Restaurant Settings
				</h1>
				<Link
					href="/restaurant/dashboard"
					className="text-emerald-600 hover:underline dark:text-emerald-400"
				>
					Back to Dashboard
				</Link>
			</div>

			<div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
				<h2 className="text-2xl font-semibold mb-4 dark:text-slate-100">
					Menu Management
				</h2>
				<button
					onClick={() => setModalOpen(true)}
					className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
				>
					Edit Menu
					<Pencil className="w-4 h-4" />
				</button>
			</div>

			<MenuManagementModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				menu={menu}
				onSaveItem={handleSaveItem}
				onDeleteItem={handleDeleteItem}
			/>

			<div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
				<h2 className="text-2xl font-semibold mb-4 dark:text-slate-100">
					General Settings
				</h2>
				<div className="flex items-center gap-4">
					<label
						htmlFor="wait-time"
						className="font-medium dark:text-slate-100"
					>
						Average Wait Time (minutes):
					</label>
					<input
						id="wait-time"
						type="number"
						value={waitTime ?? ""}
						onChange={(e) => setWaitTime(Number(e.target.value))}
						className="p-2 border rounded-md w-24 bg-white dark:bg-slate-700 dark:text-white"
					/>
					<button
						onClick={handleSaveWaitTime}
						disabled={waitTime === data?.avg_wait_time}
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
					>
						Save
					</button>
				</div>
			</div>
		</main>
	);
}

export default withAuth(RestaurantSettingsPage, { requiredRole: "restaurant" });
