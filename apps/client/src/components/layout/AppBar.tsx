"use client";

import { useAppwrite } from "@/context/AppwriteContext";
import { cn } from "@/lib/utils";
import logo from "../../../public/icons/context0_logo_cropped.jpeg";
import { useRouter } from "next/navigation";

export default function AppBar() {
	const { user, logout } = useAppwrite();
	const router = useRouter();

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b-gray-950 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
			<div className="container flex h-14 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
				{/* Left side - Logo and Title */}
				<div className="flex items-center space-x-2">
					<a
						href="#"
						className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
					>
						<img
							src={logo.src}
							alt="logo"
							width={50}
							height={50}
							className="rounded-md"
						/>
						<span className=" text-white font-[bold] text-lg">Context0</span>
					</a>
				</div>

				{/* Right side - User Menu */}
				<div className="ml-auto flex items-center space-x-4">
					{user && (
						<>
							<span className="text-sm text-gray-300">{user.name || user.email}</span>
							<div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
								{(user.name?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()}
							</div>
						</>
					)}
					<button
						onClick={handleLogout}
						className="text-sm text-gray-400 hover:text-gray-200 transition"
					>
						Logout
					</button>
				</div>
			</div>
		</header>
	);
}
