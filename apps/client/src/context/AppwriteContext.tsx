'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Account, type Models } from 'appwrite';
import { appwriteClient } from '@/lib/appwrite';

interface AppwriteContextType {
	user: Models.User<Models.Preferences> | null;
	isLoading: boolean;
	error: Error | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	signup: (email: string, password: string, name: string) => Promise<void>;
	isAuthenticated: boolean;
}

const AppwriteContext = createContext<AppwriteContextType | undefined>(undefined);

/**
 * AppwriteProvider - Provides Appwrite authentication context to the app
 */
export function AppwriteProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [account, setAccount] = useState<Account | null>(null);

	/**
	 * Initialize Account service and check if user is already authenticated on mount
	 */
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const accountService = new Account(appwriteClient);
				setAccount(accountService);

				const currentUser = await accountService.get();
				setUser(currentUser);
			} catch (err) {
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	const login = async (email: string, password: string) => {
		if (!account) return;
		setIsLoading(true);
		setError(null);
		try {
			await account.createEmailPasswordSession(email, password);
			const currentUser = await account.get();
			setUser(currentUser);
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Login failed');
			setError(error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		if (!account) return;
		setIsLoading(true);
		setError(null);
		try {
			await account.deleteSession('current');
			setUser(null);
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Logout failed');
			setError(error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signup = async (email: string, password: string, name: string) => {
		if (!account) return;
		setIsLoading(true);
		setError(null);
		try {
			const { ID } = await import('appwrite');
			await account.create(ID.unique(), email, password, name);
			await account.createEmailPasswordSession(email, password);
			const currentUser = await account.get();
			setUser(currentUser);
		} catch (err) {
			const error = err instanceof Error ? err : new Error('Signup failed');
			setError(error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AppwriteContext.Provider
			value={{
				user,
				isLoading,
				error,
				login,
				logout,
				signup,
				isAuthenticated: !!user,
			}}
		>
			{children}
		</AppwriteContext.Provider>
	);
}

/**
 * Hook to use Appwrite context
 */
export function useAppwrite() {
	const context = useContext(AppwriteContext);
	if (context === undefined) {
		throw new Error('useAppwrite must be used within an AppwriteProvider');
	}
	return context;
}
