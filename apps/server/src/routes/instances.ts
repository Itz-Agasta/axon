/**
 * Instances Routes
 * API endpoints for managing user instances and contracts
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import { authMiddleware } from '../middlewares/auth.js';
import { AppwriteService } from '../services/AppwriteService.js';
import { EizenService } from '../services/EizenService.js';
import { errorResponse, successResponse } from '../utils/responses.js';
import { logger } from '../config/winston.js';
import type { AppUser } from '../types.js';

const app = new Hono();

// Apply auth middleware to all routes
app.use('/*', authMiddleware);

/**
 * GET /instances
 * Get all instances for the authenticated user
 */
app.get('/', async (c: Context) => {
	try {
		const user = c.get('user') as AppUser | null;
		
		if (!user) {
			return c.json(errorResponse('Authentication failed', 'User not found'), 401);
		}

		const instances = await AppwriteService.listUserInstances(user.$id);

		return c.json(successResponse(instances, 'Instances retrieved successfully'));
	} catch (error) {
		logger.error('Error fetching instances:', error);
		return c.json(
			errorResponse(
				'Failed to fetch instances',
				error instanceof Error ? error.message : 'Unknown error'
			),
			500
		);
	}
});

/**
 * POST /instances/create
 * Create a new instance (deploy new contract) for the authenticated user
 */
app.post('/create', async (c: Context) => {
	try {
		const user = c.get('user') as AppUser | null;
		
		if (!user) {
			return c.json(errorResponse('Authentication failed', 'User not found'), 401);
		}

		logger.info(`Creating new instance for user: ${user.$id}`);

		// Deploy new Arweave contract
		const deployResult = await EizenService.deployNewContract();

		// Store instance in Appwrite
		const instance = await AppwriteService.createInstance({
			userId: user.$id,
			contractId: deployResult.contractId,
			walletAddress: deployResult.walletAddress,
			isActive: true,
		});

		logger.info(`✅ Instance created successfully: ${instance.$id}`);

		return c.json(
			successResponse(
				{
					...instance,
					contractId: deployResult.contractId,
					walletAddress: deployResult.walletAddress,
				},
				'Instance created successfully'
			),
			201
		);
	} catch (error) {
		logger.error('Error creating instance:', error);
		return c.json(
			errorResponse(
				'Failed to create instance',
				error instanceof Error ? error.message : 'Unknown error'
			),
			500
		);
	}
});

/**
 * GET /instances/:id
 * Get a specific instance by ID
 */
app.get('/:id', async (c: Context) => {
	try {
		const user = c.get('user') as AppUser | null;
		
		if (!user) {
			return c.json(errorResponse('Authentication failed', 'User not found'), 401);
		}

		const instanceId = c.req.param('id');

		const instance = await AppwriteService.getInstance(instanceId);

		if (!instance) {
			return c.json(
				errorResponse('Instance not found', `No instance found with ID: ${instanceId}`),
				404
			);
		}

		// Verify ownership
		if (instance.userId !== user.$id) {
			return c.json(
				errorResponse('Access denied', 'You do not have permission to access this instance'),
				403
			);
		}

		return c.json(successResponse(instance, 'Instance retrieved successfully'));
	} catch (error) {
		logger.error('Error fetching instance:', error);
		return c.json(
			errorResponse(
				'Failed to fetch instance',
				error instanceof Error ? error.message : 'Unknown error'
			),
			500
		);
	}
});

/**
 * DELETE /instances/:id
 * Delete an instance
 */
app.delete('/:id', async (c: Context) => {
	try {
		const user = c.get('user') as AppUser | null;
		
		if (!user) {
			return c.json(errorResponse('Authentication failed', 'User not found'), 401);
		}

		const instanceId = c.req.param('id');

		const instance = await AppwriteService.getInstance(instanceId);

		if (!instance) {
			return c.json(
				errorResponse('Instance not found', `No instance found with ID: ${instanceId}`),
				404
			);
		}

		// Verify ownership
		if (instance.userId !== user.$id) {
			return c.json(
				errorResponse('Access denied', 'You do not have permission to delete this instance'),
				403
			);
		}

		await AppwriteService.deleteInstance(instanceId);

		logger.info(`✅ Instance deleted successfully: ${instanceId}`);

		return c.json(successResponse({ instanceId }, 'Instance deleted successfully'));
	} catch (error) {
		logger.error('Error deleting instance:', error);
		return c.json(
			errorResponse(
				'Failed to delete instance',
				error instanceof Error ? error.message : 'Unknown error'
			),
			500
		);
	}
});

export default app;
