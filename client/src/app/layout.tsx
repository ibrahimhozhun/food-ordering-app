// "use client";

import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Restaurant App",
	description: "A restaurant management application",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${inter.className} bg-gray-50 dark:bg-slate-900`}>
				<AuthProvider>
					<AppProvider>
						<Navbar />
						{children}
					</AppProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
