"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import FoodItemFormModal from "./FoodItemFormModal";
import { Trash2, PlusCircle, Pencil } from "lucide-react";
import { FoodItem } from "@/app/restaurant/dashboard/page";

interface MenuManagementModalProps {
	isOpen: boolean;
	onClose: () => void;
	menu: FoodItem[];
	onSaveItem: (itemData: Omit<FoodItem, "id">, id?: string) => void;
	onDeleteItem: (id: string) => void;
}

export default function MenuManagementModal({
	isOpen,
	onClose,
	menu,
	onSaveItem,
	onDeleteItem,
}: MenuManagementModalProps) {
	const [isFormModalOpen, setFormModalOpen] = useState(false);
	const [itemToEdit, setItemToEdit] = useState<FoodItem | null>(null);

	const handleOpenFormModal = (item: FoodItem | null = null) => {
		setItemToEdit(item);
		setFormModalOpen(true);
	};

	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose} title="Manage Your Menu">
				<div className="space-y-4">
					<button
						onClick={() => handleOpenFormModal()}
						className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
					>
						<PlusCircle className="w-5 h-5" />
						Add New Item
					</button>

					<div className="space-y-3 max-h-80 overflow-y-auto pr-2">
						{menu?.map((item) => (
							<div
								key={item.id}
								className="bg-gray-100 dark:bg-slate-700 p-3 rounded-lg flex justify-between items-center"
							>
								<div>
									<h4 className="font-semibold text-gray-900 dark:text-slate-100">
										{item.title}
									</h4>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										${item.price.toFixed(2)}
									</p>
								</div>
								<div className="flex items-center gap-3">
									<button
										onClick={() =>
											handleOpenFormModal(item)
										}
										className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
									>
										<Pencil className="w-4 h-4" />
									</button>
									<button
										onClick={() => onDeleteItem(item.id)}
										className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>
						))}
						{!menu?.length && (
							<p className="text-center text-gray-500 dark:text-gray-400 py-4">
								Your menu is empty. Add your first item!
							</p>
						)}
					</div>
				</div>
			</Modal>

			<FoodItemFormModal
				isOpen={isFormModalOpen}
				onClose={() => setFormModalOpen(false)}
				onSave={onSaveItem}
				itemToEdit={itemToEdit}
			/>
		</>
	);
}
