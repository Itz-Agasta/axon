/**
 * Appwrite SDK Configuration
 * Central configuration for all Appwrite services
 */

import { Client, Databases, Users, Storage, Messaging, Account } from 'node-appwrite';

// Validate required environment variables
const requiredEnvVars = [
	'APPWRITE_ENDPOINT',
	'APPWRITE_PROJECT_ID',
	'APPWRITE_API_KEY',
	'APPWRITE_DATABASE_ID',
] as const;

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		throw new Error(`Missing required environment variable: ${envVar}`);
	}
}

/**
 * Server Client - Used for backend operations with API key
 * This client has elevated permissions for admin operations
 */
export const appwriteClient = new Client()
	.setEndpoint(process.env.APPWRITE_ENDPOINT!)
	.setProject(process.env.APPWRITE_PROJECT_ID!)
	.setKey(process.env.APPWRITE_API_KEY!);

/**
 * Service Instances
 * Pre-configured services ready to use throughout the application
 */
export const databases = new Databases(appwriteClient);
export const users = new Users(appwriteClient);
export const storage = new Storage(appwriteClient);
export const messaging = new Messaging(appwriteClient);

/**
 * Database Configuration
 */
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;

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

/**
 * Create a client with user session
 * Used for user-specific operations
 */
export function createSessionClient(sessionToken: string): Client {
	return new Client()
		.setEndpoint(process.env.APPWRITE_ENDPOINT!)
		.setProject(process.env.APPWRITE_PROJECT_ID!)
		.setSession(sessionToken);
}

/**
 * Get Account service for a specific session
 */
export function getAccountForSession(sessionToken: string): Account {
	const client = createSessionClient(sessionToken);
	return new Account(client);
}
