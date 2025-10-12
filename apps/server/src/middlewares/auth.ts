/**
 * Authentication Middleware
 * Validates Appwrite session tokens
 */

import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getCookie } from 'hono/cookie';
import { getAccountForSession } from '../config/appwrite.js';
import { logger } from '../config/winston.js';

export interface AuthenticatedUser {
	$id: string;
	email: string;
	name: string;
	emailVerification: boolean;
}

/**
 * Middleware to validate Appwrite session and attach user to context
 */
export async function authMiddleware(c: Context, next: Next) {
	// Get session from cookie instead of Authorization header
	const sessionCookie = getCookie(c, 'a_session_68eab819000cbd39007a'); // PROJECT_ID from .env
	
	if (!sessionCookie) {
		throw new HTTPException(401, { message: 'No session cookie provided' });
	}

	try {
		const account = getAccountForSession(sessionCookie);
		const user = await account.get();

		// Attach user data to context
		c.set('user', {
			$id: user.$id,
			email: user.email,
			name: user.name,
			emailVerification: user.emailVerification,
		} as AuthenticatedUser);
		c.set('userId', user.$id);
		c.set('sessionToken', sessionCookie);

		logger.debug(`User authenticated: ${user.email}`);

		await next();
	} catch (error) {
		logger.warn('Authentication failed:', error instanceof Error ? error.message : 'Unknown');
		throw new HTTPException(401, { message: 'Invalid or expired session token' });
	}
}

/**
 * Optional auth middleware - doesn't throw if no session
 * Attaches user if session is present
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
	const authHeader = c.req.header('Authorization');
	const sessionToken = authHeader?.replace('Bearer ', '');

	if (sessionToken) {
		try {
			const account = getAccountForSession(sessionToken);
			const user = await account.get();

			c.set('user', {
				$id: user.$id,
				email: user.email,
				name: user.name,
				emailVerification: user.emailVerification,
			} as AuthenticatedUser);
			c.set('userId', user.$id);
			c.set('sessionToken', sessionToken);
		} catch (error) {
			// Silently fail - user is optional
			logger.debug('Optional auth failed:', error instanceof Error ? error.message : 'Unknown');
		}
	}

	await next();
}
