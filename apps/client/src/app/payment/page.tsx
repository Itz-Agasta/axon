"use client";

import { Suspense, useEffect } from "react";
import { Web3Payment } from "@/components/layout/payment";
import WagmiWrapper from "@/context/WagmiWrapper";
import { useAppwrite } from "@/context/AppwriteContext";
import { useRouter } from "next/navigation";

function PaymentContent() {
	return (
		<WagmiWrapper>
			<Web3Payment />
		</WagmiWrapper>
	);
}

export default function PaymentsPage() {
	const { isAuthenticated, isLoading } = useAppwrite();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth/login");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center">
				<div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="min-h-screen bg-black text-white">
			<Suspense
				fallback={
					<div className="flex items-center justify-center min-h-screen">
						<div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
					</div>
				}
			>
				<PaymentContent />
			</Suspense>
		</div>
	);
}
