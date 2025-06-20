"use client";

import { motion } from "framer-motion";

type Role = "customer" | "restaurant";

interface RoleSelectorProps {
	selectedRole: Role;
	onRoleChange: (role: Role) => void;
}

export default function RoleSelector({
	selectedRole,
	onRoleChange,
}: RoleSelectorProps) {
	return (
		<div className="relative w-full h-16 mb-6 rounded-lg bg-gray-100 dark:bg-slate-800">
			{/* Floating Highlight */}
			<motion.div
				className="absolute inset-1 w-1/2 rounded-lg bg-emerald-500"
				style={{
					boxShadow: "0 4px 14px rgba(34, 197, 94, 0.25)",
				}}
				initial={false}
				animate={{
					x: selectedRole === "customer" ? "0%" : "95%",
				}}
				transition={{
					x: { type: "spring", stiffness: 300, damping: 30 },
				}}
			/>

			{/* Role Buttons */}
			<div className="relative flex w-full h-full">
				<button
					className={`flex-1 flex items-center justify-center transition-colors duration-200 ${
						selectedRole === "customer"
							? "text-white font-medium"
							: "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
					}`}
					onClick={() => onRoleChange("customer")}
				>
					<span className="z-10 text-sm">Customer</span>
				</button>
				<button
					className={`flex-1 flex items-center justify-center transition-colors duration-200 ${
						selectedRole === "restaurant"
							? "text-white font-medium"
							: "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
					}`}
					onClick={() => onRoleChange("restaurant")}
				>
					<span className="z-10 text-sm">Restaurant</span>
				</button>
			</div>
		</div>
	);
}
