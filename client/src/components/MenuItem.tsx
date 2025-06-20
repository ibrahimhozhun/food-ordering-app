"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";

interface MenuItemProps {
	id: string;
	title: string;
	price: number;
	image: string;
	onAddToOrder: (itemId: string) => void;
}

export default function MenuItem({
	id,
	title,
	price,
	image,
	onAddToOrder,
}: MenuItemProps) {
	const handleOrderClick = () => {
		onAddToOrder(id);
	};

	return (
		<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col transform hover:scale-105 transition-transform duration-300 ease-in-out">
			<div className="relative w-full aspect-square">
				<Image
					src={image}
					alt={title}
					layout="fill"
					objectFit="cover"
					className="bg-gray-200 dark:bg-slate-700"
				/>
			</div>
			<div className="p-3 flex flex-col flex-grow">
				<div className="flex justify-between items-start gap-2">
					<h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex-grow">
						{title}
					</h3>
					<div className="flex items-center gap-2">
						<button
							onClick={handleOrderClick}
							className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
						>
							<ShoppingCart className="w-5 h-5" />
						</button>
					</div>
				</div>
				<p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
					${price.toFixed(2)}
				</p>
			</div>
		</div>
	);
}
