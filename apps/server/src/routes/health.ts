/**
 * Health Check Routes
 * System health and status endpoints
 */

import { Hono } from 'hono';
import { successResponse } from '../utils/responses.js';
import { databases, DATABASE_ID } from '../config/appwrite.js';

const health = new Hono();

/**
 * GET /health
 * Basic health check
 */
health.get('/', (c) => {
	return c.json(
		successResponse({
			status: 'healthy',
			timestamp: new Date().toISOString(),
			service: 'Axon API',
			version: '2.0.0',
		})
	);
});

/**
 * GET /health/detailed
 * Detailed health check with dependencies
 */
health.get('/detailed', async (c) => {
	const checks = {
		api: 'healthy',
		appwrite: 'unknown',
		timestamp: new Date().toISOString(),
	};

	// Check Appwrite connection
	try {
		await databases.listCollections(DATABASE_ID);
		checks.appwrite = 'healthy';
	} catch {
		checks.appwrite = 'unhealthy';
	}

	const allHealthy = Object.values(checks).every((v) => v === 'healthy' || typeof v === 'string');

	return c.json(successResponse(checks), allHealthy ? 200 : 503);
});

export default health;
