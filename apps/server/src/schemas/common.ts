/**
 * Common Schemas
 * Shared validation schemas across the application
 */

import { z } from 'zod';

// Basic validations
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const arweaveTransactionIdSchema = z.string().length(43);
export const apiKeySchema = z.string();

// Memory metadata schema
export const memoryMetadataSchema = z
	.object({
		context: z.string().optional(),
		importance: z.number().int().min(1).max(10).optional(),
		tags: z.array(z.string()).optional(),
		timestamp: z.string().datetime().optional(),
		client: z.string().optional().default('unknown'),
		sessionId: z.string().optional(),
		content: z.string().optional(),
	})
	.passthrough();

// Search filters
export const searchFiltersSchema = z
	.object({
		tags: z.array(z.string()).optional(),
		importance_min: z.number().int().min(1).max(10).optional(),
		importance_max: z.number().int().min(1).max(10).optional(),
		date_from: z.string().datetime().optional(),
		date_to: z.string().datetime().optional(),
		context: z.string().optional(),
		client: z.string().optional(),
	})
	.passthrough();

// Vector metadata interface (for Eizen)
export interface VectorMetadata {
	content?: string;
	context?: string;
	importance?: number;
	tags?: string[];
	timestamp?: string;
	client?: string;
	sessionId?: string;
	userId?: string;
	createdAt?: string;
	[key: string]: unknown;
}

// Export types
export type UUID = z.infer<typeof uuidSchema>;
export type Email = z.infer<typeof emailSchema>;
export type ArweaveTransactionId = z.infer<typeof arweaveTransactionIdSchema>;
export type ApiKey = z.infer<typeof apiKeySchema>;
export type MemoryMetadata = z.infer<typeof memoryMetadataSchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;
