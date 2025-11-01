"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppwrite } from "@/context/AppwriteContext";
import Link from "next/link";

export default function LoginPage() {
	const router = useRouter();
	const { login, isLoading, error } = useAppwrite();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [localError, setLocalError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLocalError(null);

		if (!email || !password) {
			setLocalError("Please fill in all fields");
			return;
		}

		try {
			await login(email, password);
			router.push("/dashboard");
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Login failed";
			setLocalError(errorMessage);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center px-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-white mb-2">context0</h1>
					<p className="text-gray-400">Decentralized Context Management for AI Agents</p>
				</div>

				{/* Login Card */}
				<div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl shadow-xl p-8">
					<h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>

					{/* Error Message */}
					{(localError || error) && (
						<div className="mb-6 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
							<p className="text-red-400 text-sm">{localError || error?.message}</p>
						</div>
					)}

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Email Field */}
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
								Email Address
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
								disabled={isLoading}
							/>
						</div>

						{/* Password Field */}
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
								disabled={isLoading}
							/>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isLoading}
							className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
						>
							{isLoading ? "Signing in..." : "Sign In"}
						</button>
					</form>

					{/* Divider */}
					<div className="my-6 flex items-center">
						<div className="flex-1 border-t border-gray-700"></div>
						<span className="px-3 text-gray-500 text-sm">or</span>
						<div className="flex-1 border-t border-gray-700"></div>
					</div>

			{/* Sign Up Link */}
			<p className="text-center text-gray-400">
				Don&apos;t have an account?{" "}
				<Link
					href="/auth/signup"
					className="text-blue-400 hover:text-blue-300 font-semibold transition"
				>
					Sign Up
				</Link>
			</p>
		</div>				{/* Footer with Home Button */}
				<div className="text-center mt-8 text-gray-500 text-sm space-y-4">
					<p>By signing in, you agree to our Terms of Service</p>
					<div>
						<Link
							href="/"
							className="inline-block px-4 py-2 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition text-sm"
						>
							← Back to Home
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
