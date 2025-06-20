"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { FoodItem } from "@/app/restaurant/dashboard/page";
import Image from "next/image";

// The props our form modal will accept
interface FoodItemFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (itemData: Omit<FoodItem, "id">, id?: string) => void;
	itemToEdit?: FoodItem | null;
}

export default function FoodItemFormModal({
	isOpen,
	onClose,
	onSave,
	itemToEdit,
}: FoodItemFormModalProps) {
	const [title, setTitle] = useState("");
	const [image, setImage] = useState("");
	const [price, setPrice] = useState("");
	const [error, setError] = useState<string | null>(null);

	// When the modal opens, pre-fill the form if we're editing an item
	useEffect(() => {
		if (isOpen && itemToEdit) {
			setTitle(itemToEdit.title);
			setImage(itemToEdit.image);
			setPrice(itemToEdit.price.toString());
		} else {
			// Reset form when opening for a new item
			setTitle("");
			setImage("");
			setPrice("");
			setError(null);
		}
	}, [isOpen, itemToEdit]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!title || !price || !image) {
			setError("Title, image URL, and price are required.");
			return;
		}

		// Simple URL validation
		try {
			new URL(image);
		} catch {
			setError("Please enter a valid image URL.");
			return;
		}

		const itemData = {
			title,
			image,
			price: parseFloat(price),
		};

		onSave(itemData, itemToEdit?.id);
		onClose();
	};

	// Determine modal title based on whether we are editing or adding
	const modalTitle = itemToEdit ? "Edit Menu Item" : "Add a New Menu Item";

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label
						htmlFor="title"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Item Title
					</label>
					<input
						type="text"
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
						required
					/>
				</div>
				<div>
					<label
						htmlFor="image"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Image URL
					</label>
					<input
						type="text"
						id="image"
						value={image}
						onChange={(e) => setImage(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
						placeholder="https://example.com/image.png"
						required
					/>
				</div>

				{/* Image Preview Section */}
				{image && (
					<div className="mt-4">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Image Preview
						</label>
						<div className="relative w-full h-48 mt-1 border border-gray-200 dark:border-slate-600 rounded-md overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-slate-700">
							<Image
								src={image}
								alt="Image preview"
								layout="fill"
								objectFit="contain"
								onError={() => {
									// This doesn't set an error on the form, just prevents a broken image icon.
									// The actual validation happens on submit.
									console.warn(
										"Invalid image URL for preview."
									);
								}}
							/>
						</div>
					</div>
				)}

				<div>
					<label
						htmlFor="price"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Price
					</label>
					<input
						type="number"
						id="price"
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						step="0.01"
						className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
						required
					/>
				</div>

				{error && <p className="text-sm text-red-500">{error}</p>}

				<div className="pt-4 flex justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
					>
						Save Item
					</button>
				</div>
			</form>
		</Modal>
	);
}
