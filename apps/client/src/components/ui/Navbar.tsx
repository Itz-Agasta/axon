"use client";
import { useAppwrite } from "@/context/AppwriteContext";
import { useState } from "react";
import { Button } from "./button";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import logo from "../../../public/icons/context0_logo_cropped.jpeg";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
	const { isAuthenticated, user, logout } = useAppwrite();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [visible, setVisible] = useState(true);
	const { scrollY } = useScroll();
	const router = useRouter();

	useMotionValueEvent(scrollY, "change", (current) => {
		if (typeof current === "number") {
			const direction = current - scrollY.getPrevious()!;
			if (scrollY.get() < 50) {
				setVisible(true);
			} else {
				setVisible(direction < 0);
			}
		}
	});

	const handleLogout = async () => {
		await logout();
		router.push("/");
		setIsMobileMenuOpen(false);
	};

	return (
		<motion.div
			animate={{
				y: visible ? 0 : -100,
				opacity: visible ? 1 : 0,
			}}
			transition={{
				duration: 0.2,
			}}
			className="fixed top-0 inset-x-0 z-50 w-full"
		>
			<div className="absolute inset-0 bg-black border-b border-white/10" />

			<nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo and Brand */}
					<div className="flex items-center space-x-3">
						<img
							src={logo.src}
							alt="context0 Logo"
							className="h-10 w-10 rounded-lg"
						/>
						<span className="text-xl font-bold text-white tracking-tight">
							context0
						</span>
					</div>

					{/* User Authentication */}
					<div className="flex items-center space-x-4">
						{isAuthenticated ? (
							<>
								<span className="text-sm text-gray-300 hidden sm:inline">
									{user?.name || user?.email}
								</span>
								<button
									onClick={handleLogout}
									className="p-2 text-black bg-white rounded-lg text-sm font-bold hover:bg-gray-200 transition"
								>
									Logout
								</button>
							</>
						) : (
							<Link href="/auth/login">
								<Button
									variant="default"
									className="p-2 text-black bg-white rounded-lg text-sm font-bold"
								>
									Sign In
								</Button>
							</Link>
						)}

						{/* Mobile Menu Button */}
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
						>
							{isMobileMenuOpen ? (
								<IconX className="h-5 w-5 text-white" />
							) : (
								<IconMenu2 className="h-5 w-5 text-white" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="md:hidden mt-4 pb-4"
					>
						<div className="bg-black/30 backdrop-blur-md rounded-lg border border-white/10 p-4 space-y-3">
							{!isAuthenticated && (
								<Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
									<Button
										variant="default"
										className="w-full p-2 text-black bg-white rounded-2xl"
									>
										Sign In
									</Button>
								</Link>
							)}
							{isAuthenticated && (
								<button
									onClick={handleLogout}
									className="w-full p-2 text-black bg-white rounded-2xl font-bold hover:bg-gray-200 transition"
								>
									Logout
								</button>
							)}
						</div>
					</motion.div>
				)}
			</nav>
		</motion.div>
	);
}