/**
 * Eizen Vector Database Schemas
 * Type definitions for vector operations
 */

import type { VectorMetadata } from './common.js';

/**
 * Vector embedding type (array of numbers)
 */
export type VectorEmbedding = number[];

/**
 * Vector insertion request
 */
export interface InsertVector {
	vector: VectorEmbedding;
	metadata?: VectorMetadata;
}

/**
 * Vector search request
 */
export interface SearchVector {
	query: VectorEmbedding;
	k: number;
	filters?: VectorMetadata;
}

/**
 * Search result from Eizen
 */
export interface EizenSearchResult {
	id: number;
	distance: number;
	metadata?: VectorMetadata;
}

/**
 * Insert result from Eizen
 */
export interface EizenInsertResult {
	success: boolean;
	vectorId: number;
	message: string;
}
