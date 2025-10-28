"use client";

import { Subscriptions } from "@/components/layout/Subscriptions";
import Navbar from "@/components/ui/Navbar";
import { useAppwrite } from "@/context/AppwriteContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GetStartedPage() {
	const { isAuthenticated, isLoading } = useAppwrite();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth/login");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="w-full h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
				<div className="text-gray-400">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="w-full h-full">
			<Navbar />
			<div className="my-40">
				<Subscriptions />
			</div>
		</div>
	);
}
