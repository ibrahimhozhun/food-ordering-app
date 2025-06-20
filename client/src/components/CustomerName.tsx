"use client";

import useSWR from "swr";
import { authenticatedFetcher } from "@/context/AuthContext";
import { getApiUrl } from "@/utils/api";

interface CustomerPublic {
	id: string;
	username: string;
}

interface CustomerNameProps {
	customerId: string;
}

export default function CustomerName({ customerId }: CustomerNameProps) {
	const {
		data: customer,
		error,
		isLoading,
	} = useSWR<CustomerPublic>(
		customerId ? getApiUrl(`/customers/${customerId}`) : null,
		authenticatedFetcher
	);

	if (error) return <span className="text-red-500">Unknown</span>;
	if (isLoading) return <span>Loading...</span>;
	if (!customer) return <span>Loading...</span>;

	return <span>{customer.username}</span>;
}
