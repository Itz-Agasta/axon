/**
 * Memory Routes
 * API endpoints for semantic memory storage and retrieval
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createMemorySchema, searchMemorySchema } from '../schemas/memory.js';
import { EizenService } from '../services/EizenService.js';
import { MemoryService } from '../services/MemoryService.js';
import { AppwriteService } from '../services/AppwriteService.js';
import { authMiddleware } from '../middlewares/auth.js';
import { quotaMiddleware } from '../middlewares/quota.js';
import { errorResponse, successResponse } from '../utils/responses.js';
import { logger } from '../config/winston.js';
import type { AppUser } from '../types.js';

const app = new Hono<{
	Variables: {
		user: AppUser | null;
		sessionToken: string | null;
	};
}>();

// Apply auth middleware to all routes
app.use('/*', authMiddleware);

/**
 * Get MemoryService for the authenticated user
 */
async function getUserMemoryService(c: Context): Promise<MemoryService | null> {
	const user = c.get('user') as AppUser | null;
	
	if (!user) {
		logger.error('No user found in context');
		return null;
	}

	try {
		// Get user's active instance from Appwrite
		const instances = await AppwriteService.listUserInstances(user.$id);
		
		if (instances.length === 0) {
			logger.error(`No instances found for user: ${user.$id}`);
			return null;
		}

		// Use the first active instance
		const instance = instances.find(i => i.isActive) || instances[0];
		if (!instance) {
			logger.error('No valid instance found');
			return null;
		}
		const contractId = instance.contractId;
		
		if (!contractId) {
			logger.error('No contract ID available in instance');
			return null;
		}

		logger.info(`Using contract ID: ${contractId} for user: ${user.$id}`);
		
		const eizenService = await EizenService.forContract(contractId);
		return new MemoryService(eizenService);
	} catch (error) {
		logger.error('Failed to get user memory service:', error);
		return null;
	}
}

/**
 * POST /memories/insert
 * Create a new memory from text content
 */
app.post(
	'/insert',
	quotaMiddleware,
	zValidator('json', createMemorySchema),
	async (c) => {
		try {
			const user = c.get('user') as AppUser | null;
			
			if (!user) {
				return c.json(errorResponse('Authentication failed', 'User not found'), 401);
			}

			const memoryService = await getUserMemoryService(c);
			
			if (!memoryService) {
				return c.json(
					errorResponse('Memory service not available', 'Unable to initialize memory service'),
					500
				);
			}

			const body = c.req.valid('json');
			const result = await memoryService.createMemory(body);

			// Update quota usage in Appwrite
			try {
				const subscription = await AppwriteService.getUserSubscription(user.$id);
				if (subscription) {
					await AppwriteService.incrementQuota(subscription.$id);
					logger.info(`✅ Quota updated for user: ${user.$id}`);
				}
			} catch (quotaError) {
				logger.error('Failed to update quota:', quotaError);
				// Don't fail the request since memory was created successfully
			}

			return c.json(successResponse(result, 'Memory created successfully'), 201);
		} catch (error) {
			logger.error('Memory creation error:', error);
			return c.json(
				errorResponse(
					'Failed to create memory',
					error instanceof Error ? error.message : 'Unknown error'
				),
				500
			);
		}
	}
);

/**
 * GET /memories/search
 * Search for memories using query parameters
 */
app.get('/search', async (c) => {
	try {
		const query = c.req.query('query');
		const k = c.req.query('k');
		const filters = c.req.query('filters');

		if (!query) {
			return c.json(
				errorResponse('Invalid query parameter', 'Query parameter is required and must be a string'),
				400
			);
		}

		const searchRequest = {
			query,
			k: k ? Number.parseInt(k, 10) : 10,
			filters: filters ? JSON.parse(filters) : undefined,
		};

		// Validate with schema
		const validatedRequest = searchMemorySchema.parse(searchRequest);

		const memoryService = await getUserMemoryService(c);
		
		if (!memoryService) {
			return c.json(
				errorResponse('Memory service not available', 'Unable to initialize memory service'),
				500
			);
		}

		const results = await memoryService.searchMemories(validatedRequest);

		return c.json(successResponse(results, `Found ${results.length} relevant memories`));
	} catch (error) {
		logger.error('Memory search error:', error);

		if (error instanceof SyntaxError) {
			return c.json(
				errorResponse('Invalid filters parameter', 'Filters must be valid JSON'),
				400
			);
		}

		return c.json(
			errorResponse(
				'Failed to search memories',
				error instanceof Error ? error.message : 'Unknown error'
			),
			500
		);
	}
});

/**
 * POST /memories/search
 * Search for memories with request body
 */
app.post(
	'/search',
	zValidator('json', searchMemorySchema),
	async (c) => {
		try {
			const memoryService = await getUserMemoryService(c);
			
			if (!memoryService) {
				return c.json(
					errorResponse('Memory service not available', 'Unable to initialize memory service'),
					500
				);
			}

			const body = c.req.valid('json');
			const results = await memoryService.searchMemories(body);

			return c.json(successResponse(results, `Found ${results.length} relevant memories`));
		} catch (error) {
			logger.error('Memory search error:', error);
			return c.json(
				errorResponse(
					'Failed to search memories',
					error instanceof Error ? error.message : 'Unknown error'
				),
				500
			);
		}
	}
);

/**
 * GET /memories/:id
 * Get a specific memory by ID
 */
app.get('/:id', async (c) => {
	try {
		const memoryService = await getUserMemoryService(c);
		
		if (!memoryService) {
			return c.json(
				errorResponse('Memory service not available', 'Unable to initialize memory service'),
				500
			);
		}

		const memoryId = Number.parseInt(c.req.param('id'), 10);

		if (Number.isNaN(memoryId)) {
			return c.json(
				errorResponse('Invalid memory ID', 'Memory ID must be a number'),
				400
			);
		}

		const memory = await memoryService.getMemory(memoryId);

		if (!memory) {
			return c.json(
				errorResponse('Memory not found', `No memory found with ID: ${memoryId}`),
				404
			);
		}

		return c.json(successResponse(memory, 'Memory retrieved successfully'));
	} catch (error) {
		logger.error('Memory get error:', error);
		return c.json(
			errorResponse(
				'Failed to retrieve memory',
				error instanceof Error ? error.message : 'Unknown error'
			),
			500
		);
	}
});

/**
 * GET /memories
 * Get memory statistics
 */
app.get('/', async (c) => {
	try {
		const memoryService = await getUserMemoryService(c);
		
		if (!memoryService) {
			return c.json(
				errorResponse('Memory service not available', 'Unable to initialize memory service'),
				500
			);
		}

		const stats = await memoryService.getStats();

		return c.json(successResponse(stats, 'Memory statistics retrieved'));
	} catch (error) {
		logger.error('Memory stats error:', error);
		return c.json(
			errorResponse(
				'Failed to get memory statistics',
				error instanceof Error ? error.message : 'Unknown error'
			),
			500
		);
	}
});

export default app;
