"use client";

import { createContext, useContext, ReactNode, useState } from "react";

interface MenuItem {
	id: string;
	title: string;
	image?: string;
	price: number;
}

interface Restaurant {
	id: string;
	restaurant_name: string;
	avg_wait_time?: number;
	image?: string;
	menu: MenuItem[];
}

interface User {
	id: string;
	name: string;
	role: "customer" | "restaurant";
}

interface OrderItem {
	id: string;
	quantity: number;
	menuItem: MenuItem;
}

interface Order {
	id: string;
	status: string;
	items: OrderItem[];
}

interface AppContextType {
	user: User | null;
	currentOrder: Order | null;
	restaurants: Restaurant[] | null;
	setUser: (user: User | null) => void;
	setCurrentOrder: (order: Order | null) => void;
	setRestaurants: (restaurants: Restaurant[] | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
	const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);

	return (
		<AppContext.Provider
			value={{
				user,
				currentOrder,
				restaurants,
				setUser,
				setCurrentOrder,
				setRestaurants,
			}}
		>
			{children}
		</AppContext.Provider>
	);
}

export function useApp() {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error("useApp must be used within an AppProvider");
	}
	return context;
}
