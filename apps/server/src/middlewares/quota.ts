/**
 * Quota Middleware
 * Checks user subscription quota before processing requests
 */

import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { AppwriteService } from '../services/AppwriteService.js';
import { logger } from '../config/winston.js';

/**
 * Middleware to check if user has quota remaining
 * Must be used after authMiddleware
 */
export async function quotaMiddleware(c: Context, next: Next) {
	const userId = c.get('userId') as string;

	if (!userId) {
		throw new HTTPException(401, { message: 'Authentication required' });
	}

	try {
		const subscription = await AppwriteService.getUserSubscription(userId);

		if (!subscription) {
			throw new HTTPException(403, { message: 'No active subscription found' });
		}

		if (!subscription.isActive) {
			throw new HTTPException(403, { message: 'Subscription is inactive' });
		}

		if (subscription.quotaUsed >= subscription.quotaLimit) {
			throw new HTTPException(429, {
				message: `Quota exceeded. Used ${subscription.quotaUsed}/${subscription.quotaLimit}`,
			});
		}

		// Attach subscription to context for routes to use
		c.set('subscription', subscription);

		logger.debug(
			`Quota check passed for user ${userId}: ${subscription.quotaUsed}/${subscription.quotaLimit}`
		);

		await next();
	} catch (error) {
		if (error instanceof HTTPException) {
			throw error;
		}

		logger.error('Quota check failed:', error);
		throw new HTTPException(500, { message: 'Failed to check quota' });
	}
}
