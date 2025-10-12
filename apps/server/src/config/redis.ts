/**
 * Redis Configuration for Warp Contracts Cache
 * Provides resilient Redis connection with automatic reconnection
 */

import { Redis } from 'ioredis';
import { logger } from './winston.js';

export async function initializeRedis(): Promise<Redis | undefined> {
	const nodeEnv = process.env.NODE_ENV || 'development';

	let redisConfig: {
		host: string;
		port: number;
		password?: string;
	};

	if (nodeEnv === 'development') {
		// Development: Use local Redis
		const localRedisHost = process.env.REDIS_HOST || 'localhost';
		const localRedisPort = Number.parseInt(process.env.REDIS_PORT || '6379', 10);

		redisConfig = {
			host: localRedisHost,
			port: localRedisPort,
		};

		logger.info(
			`Development: Connecting to local Redis at ${redisConfig.host}:${redisConfig.port}...`
		);
	} else {
		// Production: Use configured Redis
		const redisHost = process.env.REDIS_HOST;
		const redisPort = process.env.REDIS_PORT;
		const redisPassword = process.env.REDIS_PASSWORD;

		if (!redisHost || !redisPort) {
			logger.info('No Redis configuration provided, proceeding without Redis cache');
			return;
		}

		redisConfig = {
			host: redisHost,
			port: Number.parseInt(redisPort, 10),
			password: redisPassword,
		};

		logger.info(`Production: Connecting to Redis at ${redisConfig.host}:${redisConfig.port}...`);
	}

	let redis: Redis | undefined;

	try {
		const connectionOptions = {
			host: redisConfig.host,
			port: redisConfig.port,
			password: redisConfig.password,
			connectTimeout: 10_000,
			commandTimeout: 5000,
			lazyConnect: false,
			maxRetriesPerRequest: nodeEnv === 'development' ? 1 : 2,
			enableAutoPipelining: true,
			enableReadyCheck: true,
			family: 4, // IPv4
		};

		if (!redisConfig.password) {
			delete connectionOptions.password;
		}

		redis = new Redis(connectionOptions);

		let hasLoggedDisconnection = false;

		redis.on('ready', () => {
			const envLabel = nodeEnv === 'development' ? '🔧 Local' : '🚀 Production';
			logger.info(`✅ ${envLabel} Redis connected successfully`);
			hasLoggedDisconnection = false;
		});

		redis.on('error', (err) => {
			if (!hasLoggedDisconnection) {
				logger.warn(`⚠️ Redis error: ${err.message}`);
				hasLoggedDisconnection = true;
			}
		});

		redis.on('close', () => {
			if (!hasLoggedDisconnection) {
				logger.warn('⚠️ Redis connection closed');
				hasLoggedDisconnection = true;
			}
		});

		// Test connection
		await redis.ping();
		logger.info('✅ Redis connection verified');

		return redis;
	} catch (error) {
		logger.warn(
			`⚠️ Could not connect to Redis: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
		logger.warn('Continuing without Redis cache (will use LevelDB fallback)');
		return;
	}
}
