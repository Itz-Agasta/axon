"use client";

import AppSideBar from "@/components/layout/AppSideBar";
import { useAppwrite } from "@/context/AppwriteContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Playground() {
	const { isAuthenticated, isLoading } = useAppwrite();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth/login");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
				<div className="text-gray-400">Loading...</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<main className="min-h-screen bg-zinc-950">
			<AppSideBar />
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-2xl font-bold mb-4 text-white">
					Context.<span></span>
				</h1>
				<p className="text-white">
					This is a simple playground page. You can add your content here.
				</p>
			</div>
		</main>
	);
}
