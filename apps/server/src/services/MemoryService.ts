/**
 * Memory Service
 * High-level service for semantic memory storage and retrieval
 */

import { logger } from '../config/winston.js';
import type { SearchFilters, VectorMetadata } from '../schemas/common.js';
import type { CreateMemory, SearchMemory } from '../schemas/memory.js';
import type { EizenService } from './EizenService.js';
import { embeddingService } from './EmbeddingService.js';

export interface MemoryResult {
	id: number;
	content?: string;
	metadata?: VectorMetadata;
	distance?: number;
}

export interface CreateMemoryResult {
	success: boolean;
	memoryId: number;
	message: string;
}

export interface MemoryStats {
	totalMemories: number;
	embeddingService: 'xenova' | 'unavailable';
	isInitialized: boolean;
}

/**
 * Service for semantic memory operations
 * Converts text to embeddings and manages vector storage
 */
export class MemoryService {
	private eizenService: EizenService;

	constructor(eizenService: EizenService) {
		this.eizenService = eizenService;
	}

	/**
	 * Create a new memory from text content
	 */
	async createMemory(data: CreateMemory): Promise<CreateMemoryResult> {
		try {
			logger.info(`Creating memory from ${data.content.length} characters of content`);

			// Step 1: Convert text to embeddings
			const embeddings = await this.textToEmbeddings(data.content);

			// Step 2: Enhance metadata with content
			const enhancedMetadata: VectorMetadata = {
				...data.metadata,
				content: data.content,
			};

			// Step 3: Store in Eizen
			const result = await this.eizenService.insertVector({
				vector: embeddings,
				metadata: enhancedMetadata,
			});

			logger.info(`✅ Memory created successfully with ID: ${result.vectorId}`);

			return {
				success: true,
				memoryId: result.vectorId,
				message: `Memory created from ${data.content.length} characters of content`,
			};
		} catch (error) {
			logger.error('Failed to create memory:', error);
			throw new Error(
				`Failed to create memory: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Search memories using natural language query
	 */
	async searchMemories(data: SearchMemory): Promise<MemoryResult[]> {
		try {
			logger.info(`Searching memories with query: "${data.query}"`);

			// Step 1: Convert query to embeddings
			const queryEmbeddings = await this.textToEmbeddings(data.query);

			// Step 2: Search in Eizen
			const searchResults = await this.eizenService.searchVectors({
				query: queryEmbeddings,
				k: data.k || 10,
			});

			// Step 3: Transform results
			const memories: MemoryResult[] = searchResults.map((result) => ({
				id: result.id,
				content: (result.metadata?.content as string) || undefined,
				metadata: result.metadata,
				distance: result.distance,
			}));

			// Step 4: Apply filters
			const filteredMemories = this.applyFilters(memories, data.filters);

			logger.info(`✅ Found ${filteredMemories.length} relevant memories`);

			return filteredMemories;
		} catch (error) {
			logger.error('Failed to search memories:', error);
			throw new Error(
				`Failed to search memories: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Get a specific memory by ID
	 */
	async getMemory(memoryId: number): Promise<MemoryResult | null> {
		try {
			logger.info(`Retrieving memory with ID: ${memoryId}`);

			const vector = await this.eizenService.getVector(memoryId);

			if (!vector) {
				return null;
			}

			return {
				id: memoryId,
				content: (vector.metadata?.content as string) || undefined,
				metadata: vector.metadata,
			};
		} catch (error) {
			logger.error(`Failed to retrieve memory ${memoryId}:`, error);
			throw new Error(
				`Failed to retrieve memory: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Get memory statistics
	 */
	async getStats(): Promise<MemoryStats> {
		try {
			const eizenStats = await this.eizenService.getStats();
			const embeddingInfo = embeddingService.getInfo();

			return {
				totalMemories: eizenStats.totalVectors,
				embeddingService: embeddingInfo.isInitialized ? 'xenova' : 'unavailable',
				isInitialized: eizenStats.isInitialized && embeddingInfo.isInitialized,
			};
		} catch (error) {
			logger.error('Failed to get memory stats:', error);
			return {
				totalMemories: 0,
				embeddingService: 'unavailable',
				isInitialized: false,
			};
		}
	}

	/**
	 * Convert text to embeddings (private helper)
	 */
	private async textToEmbeddings(text: string): Promise<number[]> {
		try {
			logger.debug('Converting text to embeddings using Xenova/transformers');

			const result = await embeddingService.textToEmbeddings(text);
			return result.embeddings;
		} catch (error) {
			logger.error('Failed to generate embeddings:', error);
			throw new Error(
				`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Apply metadata filters to search results (private helper)
	 */
	private applyFilters(memories: MemoryResult[], filters?: SearchFilters): MemoryResult[] {
		if (!filters) {
			return memories;
		}

		return memories.filter((memory) => {
			if (!memory.metadata) return true;

			// Filter by tags
			if (filters.tags && Array.isArray(filters.tags)) {
				const memoryTags = (memory.metadata.tags as string[]) || [];
				const hasRequiredTags = filters.tags.some((tag: string) => memoryTags.includes(tag));
				if (!hasRequiredTags) return false;
			}

			// Filter by minimum importance
			if (filters.importance_min !== undefined && filters.importance_min !== null) {
				const importance = (memory.metadata.importance as number) || 0;
				if (importance < filters.importance_min) return false;
			}

			// Filter by maximum importance
			if (filters.importance_max !== undefined && filters.importance_max !== null) {
				const importance = (memory.metadata.importance as number) || 0;
				if (importance > filters.importance_max) return false;
			}

			// Filter by client
			if (filters.client) {
				const client = (memory.metadata.client as string) || '';
				if (!client.includes(filters.client)) return false;
			}

			// Filter by date range
			if (filters.date_from || filters.date_to) {
				const timestamp =
					(memory.metadata.timestamp as string) || (memory.metadata.createdAt as string);
				if (timestamp) {
					const memoryDate = new Date(timestamp);
					if (filters.date_from && memoryDate < new Date(filters.date_from)) return false;
					if (filters.date_to && memoryDate > new Date(filters.date_to)) return false;
				}
			}

			return true;
		});
	}
}
