"use client";

import React, { useState } from "react";
import { Home, Settings, LogOut } from "lucide-react";
import { useAppwrite } from "@/context/AppwriteContext";
import { useRouter } from "next/navigation";

interface NavItem {
	id: string;
	label: string;
	icon: React.ReactNode;
	href?: string;
}

interface DashboardNavbarProps {
	position?: "left" | "right";
	items?: NavItem[];
}

const defaultItems: NavItem[] = [
	{ id: "home", label: "", icon: <Home size={20} /> },
];

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({
	position = "left",
	items = defaultItems,
}) => {
	const [activeItem, setActiveItem] = useState("home");
	const { user, logout } = useAppwrite();
	const router = useRouter();

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};

	const positionClasses = position === "left" ? "left-0" : "right-0";

	return (
		<nav
			className={`fixed top-1/2 -translate-y-1/2 ${positionClasses} w-16 bg-black/90 backdrop-blur-lg rounded-full shadow-2xl border-r border-gray-800 flex flex-col items-center py-6 z-50`}
			style={{ height: "auto" }}
		>
			{/* Navigation Items */}
			<div className="flex flex-col space-y-6 w-full items-center">
				{items.map((item) => (
					<button
						key={item.id}
						onClick={() => setActiveItem(item.id)}
						className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 group hover:scale-105 ${
							activeItem === item.id
								? "bg-white text-black shadow-lg shadow-white/25"
								: "text-white hover:bg-gray-900 hover:text-gray-300"
						}`}
					>
						<span
							className={`transition-transform duration-200 ${
								activeItem === item.id ? "scale-110" : "group-hover:scale-110"
							}`}
						>
							{item.icon}
						</span>
					</button>
				))}

				{/* User Avatar */}
				<div className="w-12 h-12 flex items-center justify-center">
					<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-80 transition" title="User Avatar">
						{(user?.name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
					</div>
				</div>

				{/* Logout Button */}
				<button
					onClick={handleLogout}
					className="w-12 h-12 flex items-center justify-center rounded-full text-white hover:bg-red-900/20 transition-all duration-200 group hover:scale-105"
					title="Logout"
				>
					<LogOut size={20} />
				</button>
			</div>
		</nav>
	);
};

export default DashboardNavbar;
