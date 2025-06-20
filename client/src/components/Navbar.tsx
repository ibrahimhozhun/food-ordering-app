"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Home, LogOut, History } from "lucide-react";

export default function Navbar() {
	const { user, signOut } = useAuth();
	const isRestaurant = !!user?.restaurant_name;

	if (!user) return null;

	return (
		<div className="px-4 py-2 relative">
			{/* Background gradient layer */}
			<div className="absolute top-3 bottom-3 rounded-lg left-1 right-1 mx-4 bg-gradient-to-l from-emerald-400 to-emerald-500 dark:from-emerald-700 dark:to-emerald-800" />
			{/* Frosted glass navbar */}
			<nav className="relative bg-black/20 shadow-lg shadow-teal-500/60 backdrop-filter backdrop-blur-sm rounded-lg">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						{/* Left side - Conditional Link */}
						{isRestaurant ? (
							<Link
								href="/restaurant/history"
								className="text-emerald-950 dark:text-emerald-100 hover:scale-110 transition-all duration-600 dark:hover:text-slate-400 dark:hover:text-shadow-lg rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2"
							>
								<History className="w-5 h-5" />
								<span className="hidden sm:inline">
									Order History
								</span>
							</Link>
						) : (
							<>
								<Link
									href="/"
									className="text-emerald-950 dark:text-emerald-100 hover:scale-110 transition-all duration-600 dark:hover:text-slate-400 dark:hover:text-shadow-lg rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2"
								>
									<Home className="w-5 h-5" />
									<span className="hidden sm:inline">
										Restaurants
									</span>
								</Link>
								<Link
									href="/my-orders"
									className="text-emerald-950 dark:text-emerald-100 hover:scale-110 transition-all duration-600 dark:hover:text-slate-400 dark:hover:text-shadow-lg rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2"
								>
									<History className="w-5 h-5" />
									<span className="hidden sm:inline">
										My Orders
									</span>
								</Link>
							</>
						)}

						{/* Right side - User info and sign out */}
						<div className="flex items-center space-x-4">
							<span className="text-emerald-950 dark:text-emerald-100">
								{user.username}
								{isRestaurant && (
									<Link href="/restaurant/dashboard">
										<span className="text-emerald-600 dark:text-emerald-200 hover:underline">
											({user.restaurant_name})
										</span>
									</Link>
								)}
							</span>
							<button
								onClick={signOut}
								className="p-2 text-emerald-950 dark:text-emerald-100 hover:text-red-500/80 hover:scale-110 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-emerald-800 transition-all duration-200"
								title="Sign out"
							>
								<LogOut className="h-5 w-5" />
							</button>
						</div>
					</div>
				</div>
			</nav>
		</div>
	);
}
