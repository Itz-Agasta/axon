/**
 * Axon API Server
 * Decentralized AI Memory Platform powered by Appwrite
 *
 * @author Axon Team
 * @license MIT
 * @copyright 2025 Axon. All rights reserved.
 */

import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger as honoLogger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
// Config
import { logger } from './config/winston.js';
import { initializeArweave } from './config/arweave.js';
// Services
import { embeddingService } from './services/EmbeddingService.js';
import { AppwriteService } from './services/AppwriteService.js';
// Middlewares
import { errorHandler } from './middlewares/errorHandler.js';
// Routes
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import memoryRoutes from './routes/memories.js';
import instanceRoutes from './routes/instances.js';

// Initialize app
const app = new Hono();

// Global middlewares
app.use('*', honoLogger());
app.use('*', prettyJSON());
app.use(
	'*',
	cors({
		origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
		credentials: true,
		allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization'],
	})
);

// Root endpoint
app.get('/', (c) => {
	return c.json({
		name: 'Axon API',
		description: 'Decentralized AI Memory Platform powered by Appwrite',
		version: '2.0.0',
		powered_by: 'Appwrite',
		features: [
			'Appwrite Auth - User authentication & sessions',
			'Appwrite Databases - Subscriptions, instances, memories',
			'Appwrite Storage - File management',
			'Appwrite Messaging - Email notifications',
			'Appwrite Functions - Background processing',
			'Appwrite Realtime - Live updates',
			'Blockchain Storage - Arweave + Warp contracts',
			'Vector Search - EizenDB (HNSW algorithm)',
		],
		documentation: '/health',
		github: 'https://github.com/Itz-Agasta/context0',
	});
});

// Public routes
app.route('/auth', authRoutes);
app.route('/health', healthRoutes);

// Protected routes (require authentication)
app.route('/memories', memoryRoutes);
app.route('/instances', instanceRoutes);
// TODO: Add subscription routes
// TODO: Add deploy routes

// Global error handler
app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return errorHandler(err, c);
	}

	logger.error('Unhandled error:', {
		error: err.message,
		stack: err.stack,
		path: c.req.path,
		method: c.req.method,
	});

	return c.json(
		{
			success: false,
			error: 'Internal server error',
			timestamp: new Date().toISOString(),
		},
		500
	);
});

// 404 handler
app.notFound((c) => {
	return c.json(
		{
			success: false,
			error: 'Not found',
			path: c.req.path,
			timestamp: new Date().toISOString(),
		},
		404
	);
});

// Start server
const port = Number.parseInt(process.env.PORT || '3000', 10);

/**
 * Initialize all services with detailed logging
 */
async function initializeServices() {
	logger.info('Initializing Axon API...');

	// 1. Verify Appwrite connection
	logger.info('Verifying Appwrite connection...');
	try {
		await AppwriteService.verifyConnection();
		logger.info('Appwrite connection established');
	} catch (error) {
		logger.error('Appwrite connection failed:', error);
		throw error;
	}

	// 2. Initialize Arweave configuration
	logger.info('⛓️  Initializing Arweave configuration...');
	try {
		await initializeArweave();
		logger.info('Arweave configuration initialized');
	} catch (error) {
		logger.warn('Arweave initialization failed:', error);
		logger.warn('Continuing with production Arweave configuration...');
	}

	// 3. Initialize AI embedding service
	logger.info('Initializing AI embedding service...');
	try {
		await embeddingService.ensureInitialized();
		logger.info('AI embedding service ready');
	} catch (error) {
		logger.error('AI embedding service failed:', error);
		throw error;
	}

	// 4. Initialize vector database service
	logger.info('Initializing vector database service...');
	try {
		// EizenService is initialized per-contract, no global initialization needed
		logger.info('Vector database service ready (per-contract initialization)');
	} catch (error) {
		logger.error('Vector database service failed:', error);
		throw error;
	}

	// 5. Verify database collections
	logger.info('Verifying database collections...');
	try {
		await AppwriteService.verifyCollections();
		logger.info('Database collections verified');
	} catch (error) {
		logger.warn('Database verification failed:', error);
		logger.warn('Collections may need to be created manually');
	}

	logger.info('Axon API is ready to handle user requests');
}

// Initialize services and start server
async function startServer() {
	try {
		await initializeServices();

		logger.info('Starting HTTP server...');

		logger.info(`Axon API server running on port ${port}`);
		logger.info(`Documentation: http://localhost:${port}/health`);
		logger.info(`Health check: http://localhost:${port}/health`);

		// Start the server
		Bun.serve({
			port,
			fetch: app.fetch,
		});

		logger.info(`Server started successfully on http://localhost:${port}`);
	} catch (error) {
		logger.error('Failed to start server:', error);
		process.exit(1);
	}
}

// Start the server
startServer();
