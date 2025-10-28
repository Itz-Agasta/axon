/**
 * Appwrite SDK Configuration
 * Client-side configuration for Appwrite services
 */

import { Client, Databases, Storage, Messaging } from 'appwrite';

// Validate required environment variables
const requiredEnvVars = [
	'NEXT_PUBLIC_APPWRITE_ENDPOINT',
	'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
] as const;

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		console.warn(`Missing environment variable: ${envVar}`);
	}
}

/**
 * Appwrite Client - Initialized once and reused
 */
export const appwriteClient = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'http://localhost:80/v1')
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

/**
 * Service Instances
 * Pre-configured services ready to use throughout the application
 */
export const databases = new Databases(appwriteClient);
export const storage = new Storage(appwriteClient);
export const messaging = new Messaging(appwriteClient);

/**
 * Database Configuration
 */
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

/**
 * Collection IDs
 * Must match the collection IDs in your Appwrite project
 */
export const COLLECTIONS = {
	SUBSCRIPTIONS: 'subscriptions',
	INSTANCES: 'instances',
	API_KEYS: 'api_keys',
	MEMORIES_METADATA: 'memories_metadata',
} as const;

/**
 * Storage Bucket IDs
 * Must match the bucket IDs in your Appwrite project
 */
export const BUCKETS = {
	USER_AVATARS: 'user_avatars',
	CONTRACT_BACKUPS: 'contract_backups',
} as const;
