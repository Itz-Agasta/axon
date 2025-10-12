/**
 * Appwrite Service
 * Wrapper for all Appwrite Database operations
 */

import { ID, type Models, Query } from 'node-appwrite';
import { COLLECTIONS, DATABASE_ID, databases } from '../config/appwrite.js';
import { logger } from '../config/winston.js';

// Type definitions for our collections
export interface Subscription extends Models.Document {
	userId: string;
	plan: 'basic' | 'pro' | 'enterprise';
	quotaLimit: number;
	quotaUsed: number;
	isActive: boolean;
	renewsAt: string;
	stripeCustomerId?: string;
	stripeSubscriptionId?: string;
}

export interface Instance extends Models.Document {
	userId: string;
	contractId: string;
	contractHash?: string;
	walletAddress?: string;
	status?: 'active' | 'suspended' | 'deleted';
	memoryCount?: number;
	lastUsedAt?: string;
	deployedAt?: string;
	isActive?: boolean;
}

export interface ApiKey extends Models.Document {
	userId: string;
	keyHash: string;
	keyPrefix: string;
	instanceId: string;
	name: string;
	status: 'active' | 'revoked';
	lastUsedAt?: string;
	expiresAt?: string;
}

export interface MemoryMetadata extends Models.Document {
	userId: string;
	instanceId: string;
	content: string;
	context: string;
	importance: number;
	tags: string[];
	vectorId: string;
}

export class AppwriteService {
	// ==================== SUBSCRIPTIONS ====================

	/**
	 * Get user's subscription
	 */
	static async getUserSubscription(userId: string): Promise<Subscription | null> {
		try {
			const result = await databases.listDocuments<Subscription>(
				DATABASE_ID,
				COLLECTIONS.SUBSCRIPTIONS,
				[Query.equal('userId', userId), Query.limit(1)]
			);

			return result.documents[0] || null;
		} catch (error) {
			logger.error('Failed to get user subscription:', error);
			throw error;
		}
	}

	/**
	 * Create new subscription
	 */
	static async createSubscription(data: {
		userId: string;
		plan: 'basic' | 'pro' | 'enterprise';
		quotaLimit: number;
	}): Promise<Subscription> {
		try {
			const renewsAt = new Date();
			renewsAt.setMonth(renewsAt.getMonth() + 1);

			return await databases.createDocument<Subscription>(
				DATABASE_ID,
				COLLECTIONS.SUBSCRIPTIONS,
				ID.unique(),
				{
					...data,
					quotaUsed: 0,
					isActive: true,
					renewsAt: renewsAt.toISOString(),
				}
			);
		} catch (error) {
			logger.error('Failed to create subscription:', error);
			throw error;
		}
	}

	/**
	 * Update subscription quota usage
	 */
	static async updateQuota(subscriptionId: string, quotaUsed: number): Promise<Subscription> {
		try {
			return await databases.updateDocument<Subscription>(
				DATABASE_ID,
				COLLECTIONS.SUBSCRIPTIONS,
				subscriptionId,
				{ quotaUsed }
			);
		} catch (error) {
			logger.error('Failed to update quota:', error);
			throw error;
		}
	}

	/**
	 * Increment quota by 1 (atomic operation)
	 */
	static async incrementQuota(subscriptionId: string): Promise<Subscription> {
		try {
			const subscription = await databases.getDocument<Subscription>(
				DATABASE_ID,
				COLLECTIONS.SUBSCRIPTIONS,
				subscriptionId
			);

			return await AppwriteService.updateQuota(subscriptionId, subscription.quotaUsed + 1);
		} catch (error) {
			logger.error('Failed to increment quota:', error);
			throw error;
		}
	}

	// ==================== INSTANCES ====================

	/**
	 * Get all instances for a user
	 */
	static async getUserInstances(userId: string): Promise<Models.DocumentList<Instance>> {
		try {
			return await databases.listDocuments<Instance>(DATABASE_ID, COLLECTIONS.INSTANCES, [
				Query.equal('userId', userId),
				Query.orderDesc('$createdAt'),
			]);
		} catch (error) {
			logger.error('Failed to get user instances:', error);
			throw error;
		}
	}

	/**
	 * List all instances for a user (returns documents array directly)
	 */
	static async listUserInstances(userId: string): Promise<Instance[]> {
		try {
			const result = await databases.listDocuments<Instance>(DATABASE_ID, COLLECTIONS.INSTANCES, [
				Query.equal('userId', userId),
				Query.orderDesc('$createdAt'),
			]);
			return result.documents;
		} catch (error) {
			logger.error('Failed to list user instances:', error);
			throw error;
		}
	}

	/**
	 * Get single instance by ID
	 */
	static async getInstance(instanceId: string): Promise<Instance> {
		try {
			return await databases.getDocument<Instance>(DATABASE_ID, COLLECTIONS.INSTANCES, instanceId);
		} catch (error) {
			logger.error('Failed to get instance:', error);
			throw error;
		}
	}

	/**
	 * Create new instance
	 */
	static async createInstance(data: {
		userId: string;
		contractId: string;
		contractHash?: string;
		isActive?: boolean;
	}): Promise<Instance> {
		try {
			return await databases.createDocument<Instance>(
				DATABASE_ID,
				COLLECTIONS.INSTANCES,
				ID.unique(),
				{
					userId: data.userId,
					contractId: data.contractId,
					contractHash: data.contractHash,
					status: 'active',
				}
			);
		} catch (error) {
			logger.error('Failed to create instance:', error);
			throw error;
		}
	}

	/**
	 * Update instance memory count
	 */
	static async updateInstanceMemoryCount(
		instanceId: string,
		memoryCount: number
	): Promise<Instance> {
		try {
			return await databases.updateDocument<Instance>(
				DATABASE_ID,
				COLLECTIONS.INSTANCES,
				instanceId,
				{
					memoryCount,
					lastUsedAt: new Date().toISOString(),
				}
			);
		} catch (error) {
			logger.error('Failed to update instance memory count:', error);
			throw error;
		}
	}

	/**
	 * Update instance last used time
	 */
	static async updateInstanceLastUsed(instanceId: string): Promise<Instance> {
		try {
			return await databases.updateDocument<Instance>(
				DATABASE_ID,
				COLLECTIONS.INSTANCES,
				instanceId,
				{
					lastUsedAt: new Date().toISOString(),
				}
			);
		} catch (error) {
			logger.error('Failed to update instance last used:', error);
			throw error;
		}
	}

	/**
	 * Delete instance
	 */
	static async deleteInstance(instanceId: string): Promise<void> {
		try {
			await databases.deleteDocument(DATABASE_ID, COLLECTIONS.INSTANCES, instanceId);
			logger.info(`Instance deleted: ${instanceId}`);
		} catch (error) {
			logger.error('Failed to delete instance:', error);
			throw error;
		}
	}

	// ==================== API KEYS ====================

	/**
	 * Get user's API keys
	 */
	static async getUserApiKeys(userId: string): Promise<Models.DocumentList<ApiKey>> {
		try {
			return await databases.listDocuments<ApiKey>(DATABASE_ID, COLLECTIONS.API_KEYS, [
				Query.equal('userId', userId),
				Query.orderDesc('$createdAt'),
			]);
		} catch (error) {
			logger.error('Failed to get user API keys:', error);
			throw error;
		}
	}

	/**
	 * Create API key
	 */
	static async createApiKey(data: {
		userId: string;
		instanceId: string;
		keyHash: string;
		keyPrefix: string;
		name: string;
	}): Promise<ApiKey> {
		try {
			return await databases.createDocument<ApiKey>(
				DATABASE_ID,
				COLLECTIONS.API_KEYS,
				ID.unique(),
				{
					...data,
					status: 'active',
				}
			);
		} catch (error) {
			logger.error('Failed to create API key:', error);
			throw error;
		}
	}

	/**
	 * Validate API key by hash
	 */
	static async validateApiKey(keyHash: string): Promise<ApiKey | null> {
		try {
			const result = await databases.listDocuments<ApiKey>(DATABASE_ID, COLLECTIONS.API_KEYS, [
				Query.equal('keyHash', keyHash),
				Query.equal('status', 'active'),
				Query.limit(1),
			]);

			const key = result.documents[0] || null;

			// Update last used time if key found
			if (key) {
				await databases.updateDocument(DATABASE_ID, COLLECTIONS.API_KEYS, key.$id, {
					lastUsedAt: new Date().toISOString(),
				});
			}

			return key;
		} catch (error) {
			logger.error('Failed to validate API key:', error);
			throw error;
		}
	}

	/**
	 * Revoke API key
	 */
	static async revokeApiKey(keyId: string): Promise<ApiKey> {
		try {
			return await databases.updateDocument<ApiKey>(DATABASE_ID, COLLECTIONS.API_KEYS, keyId, {
				status: 'revoked',
			});
		} catch (error) {
			logger.error('Failed to revoke API key:', error);
			throw error;
		}
	}

	// ==================== MEMORIES METADATA ====================

	/**
	 * Create memory metadata
	 */
	static async createMemoryMetadata(data: {
		userId: string;
		instanceId: string;
		content: string;
		context: string;
		importance: number;
		tags: string[];
		vectorId: string;
	}): Promise<MemoryMetadata> {
		try {
			return await databases.createDocument<MemoryMetadata>(
				DATABASE_ID,
				COLLECTIONS.MEMORIES_METADATA,
				ID.unique(),
				data
			);
		} catch (error) {
			logger.error('Failed to create memory metadata:', error);
			throw error;
		}
	}

	/**
	 * Get user's memories metadata
	 */
	static async getUserMemories(
		userId: string,
		limit = 25,
		offset = 0
	): Promise<Models.DocumentList<MemoryMetadata>> {
		try {
			return await databases.listDocuments<MemoryMetadata>(
				DATABASE_ID,
				COLLECTIONS.MEMORIES_METADATA,
				[
					Query.equal('userId', userId),
					Query.limit(limit),
					Query.offset(offset),
					Query.orderDesc('$createdAt'),
				]
			);
		} catch (error) {
			logger.error('Failed to get user memories:', error);
			throw error;
		}
	}

	/**
	 * Get memory metadata by ID
	 */
	static async getMemoryMetadata(memoryId: string): Promise<MemoryMetadata> {
		try {
			return await databases.getDocument<MemoryMetadata>(
				DATABASE_ID,
				COLLECTIONS.MEMORIES_METADATA,
				memoryId
			);
		} catch (error) {
			logger.error('Failed to get memory metadata:', error);
			throw error;
		}
	}

	/**
	 * Delete memory metadata
	 */
	static async deleteMemoryMetadata(memoryId: string): Promise<void> {
		try {
			await databases.deleteDocument(DATABASE_ID, COLLECTIONS.MEMORIES_METADATA, memoryId);
		} catch (error) {
			logger.error('Failed to delete memory metadata:', error);
			throw error;
		}
	}

	/**
	 * Search memories by tags
	 */
	static async searchMemoriesByTags(
		userId: string,
		tags: string[],
		limit = 25
	): Promise<Models.DocumentList<MemoryMetadata>> {
		try {
			return await databases.listDocuments<MemoryMetadata>(
				DATABASE_ID,
				COLLECTIONS.MEMORIES_METADATA,
				[
					Query.equal('userId', userId),
					Query.contains('tags', tags),
					Query.limit(limit),
					Query.orderDesc('$createdAt'),
				]
			);
		} catch (error) {
			logger.error('Failed to search memories by tags:', error);
			throw error;
		}
	}

	/**
	 * Verify Appwrite connection
	 */
	static async verifyConnection(): Promise<void> {
		try {
			// Try to list collections to verify connection
			await databases.listCollections(DATABASE_ID);
		} catch (error) {
			logger.error('Appwrite connection verification failed:', error);
			throw new Error('Cannot connect to Appwrite. Check your credentials and endpoint.');
		}
	}

	/**
	 * Verify required collections exist
	 */
	static async verifyCollections(): Promise<void> {
		const requiredCollections = [
			'subscriptions',
			'instances',
			'api_keys',
			'memories_metadata'
		];

		try {
			const collections = await databases.listCollections(DATABASE_ID);
			const existingCollections = collections.collections.map(c => c.name);

			const missingCollections = requiredCollections.filter(
				collection => !existingCollections.includes(collection)
			);

			if (missingCollections.length > 0) {
				logger.warn(`Missing collections: ${missingCollections.join(', ')}`);
				logger.warn('Run: bun run scripts/setup-appwrite-collections.ts');
				throw new Error(`Missing required collections: ${missingCollections.join(', ')}`);
			}

			logger.info(`Found ${existingCollections.length} collections: ${existingCollections.join(', ')}`);
		} catch (error) {
			logger.error('Collection verification failed:', error);
			throw error;
		}
	}
}
