/**
 * API Wrapper for Appwrite Backend
 * Provides convenient methods to interact with the backend API
 */

import { appwriteClient } from './appwrite';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

interface ApiResponse {
	[key: string]: unknown;
}

/**
 * Helper function to make authenticated API calls
 */
async function makeRequest<T = ApiResponse>(
	method: 'GET' | 'POST' | 'PUT' | 'DELETE',
	endpoint: string,
	data?: Record<string, unknown>,
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;

	// Get the current session token from Appwrite
	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		// Try to get the session from Appwrite client
		const session = await appwriteClient.headers;
		if (session['X-Appwrite-Session']) {
			headers.Authorization = `Bearer ${session['X-Appwrite-Session']}`;
		}

		const options: RequestInit = {
			method,
			headers,
		};

		if (data) {
			options.body = JSON.stringify(data);
		}

		const response = await fetch(url, options);

		if (!response.ok) {
			throw new Error(`API Error: ${response.statusText}`);
		}

		return await response.json() as T;
	} catch (error) {
		console.error(`API request failed (${method} ${endpoint}):`, error);
		throw error;
	}
}

/**
 * Test the API connection
 */
export async function test(): Promise<unknown> {
	return makeRequest('GET', '/test');
}

/**
 * Get user's subscription from Appwrite database
 */
export async function getUserSubscription(userId: string) {
	try {
		const { databases, DATABASE_ID, COLLECTIONS } = await import('./appwrite');
		const result = await databases.listDocuments(
			DATABASE_ID,
			COLLECTIONS.SUBSCRIPTIONS,
			[`userId == "${userId}"`],
		);
		return result.documents[0] || null;
	} catch (error) {
		console.error('Failed to get user subscription:', error);
		throw error;
	}
}

/**
 * Deploy Arweave contract
 */
export async function deployArweaveContract(userId: string) {
	interface DeployResponse {
		contractId?: string;
		contractHashFingerprint?: string;
		[key: string]: unknown;
	}
	return makeRequest<DeployResponse>('POST', '/deploy', { userId });
}

/**
 * Handle payment webhook
 */
export async function hitPaymentWebhook(
	txHash: string,
	subscriptionPlan: string,
	quotaLimit: number,
) {
	return makeRequest('POST', '/webhook/payments/web3', {
		txHash,
		subscriptionPlan,
		quotaLimit,
	});
}

/**
 * Get user's instances from Appwrite database
 */
export async function getInstances(userId: string) {
	try {
		const { databases, DATABASE_ID, COLLECTIONS } = await import('./appwrite');
		const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.INSTANCES, [
			`userId == "${userId}"`,
		]);
		return result.documents.map((doc) => ({
			id: doc.$id,
			name: doc.contractId || 'Instance',
			createdAt: doc.$createdAt,
			lastUsedAt: doc.lastUsedAt,
			contractId: doc.contractId,
			status: doc.status,
		}));
	} catch (error) {
		console.error('Failed to get instances:', error);
		throw error;
	}
}

/**
 * Create a new instance
 */
export async function createInstance(userId: string, contractId: string) {
	try {
		const { databases, DATABASE_ID, COLLECTIONS } = await import('./appwrite');
		const { ID } = await import('appwrite');
		const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.INSTANCES, ID.unique(), {
			userId,
			contractId,
			status: 'active',
			deployedAt: new Date().toISOString(),
		});
		return {
			id: doc.$id,
			name: doc.contractId || 'Instance',
			createdAt: doc.$createdAt,
			lastUsedAt: doc.lastUsedAt,
			contractId: doc.contractId,
			status: doc.status,
		};
	} catch (error) {
		console.error('Failed to create instance:', error);
		throw error;
	}
}

/**
 * Get memory count for a contract
 */
export async function getUserMemoryCount(contractId: string): Promise<number> {
	try {
		return makeRequest('GET', `/admin/memories/count/${contractId}`);
	} catch (error) {
		console.error('Failed to get memory count:', error);
		throw error;
	}
}
