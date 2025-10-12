/**
 * Zod Schemas for Memory Operations
 */

import { z } from 'zod';
import { memoryMetadataSchema, searchFiltersSchema } from './common.js';

// Create memory schema
export const createMemorySchema = z.object({
	content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
	metadata: memoryMetadataSchema.optional(),
});

export type CreateMemory = z.infer<typeof createMemorySchema>;
export type CreateMemoryInput = z.infer<typeof createMemorySchema>;

// Search memory schema
export const searchMemorySchema = z.object({
	query: z.string().min(1, 'Query is required'),
	k: z.number().min(1).max(100).default(10),
	filters: searchFiltersSchema.optional(),
});

export type SearchMemory = z.infer<typeof searchMemorySchema>;
export type SearchMemoryInput = z.infer<typeof searchMemorySchema>;

// List memories schema
export const listMemoriesSchema = z.object({
	limit: z.number().min(1).max(100).default(25),
	offset: z.number().min(0).default(0),
});

export type ListMemoriesInput = z.infer<typeof listMemoriesSchema>;
