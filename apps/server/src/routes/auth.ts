/**
 * Authentication Routes
 * Handles user signup, login, logout using Appwrite Auth
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { setCookie } from 'hono/cookie';
import { Client, Account, ID } from 'node-appwrite';
import { signupSchema, loginSchema } from '../schemas/auth.js';
import { AppwriteService } from '../services/AppwriteService.js';
import { appwriteClient } from '../config/appwrite.js';
import { successResponse, errorResponse } from '../utils/responses.js';
import { logger } from '../config/winston.js';
import { authMiddleware, type AuthenticatedUser } from '../middlewares/auth.js';

type Variables = {
	user: AuthenticatedUser;
	userId: string;
	sessionToken: string;
};

const auth = new Hono<{ Variables: Variables }>();

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID!;

/**
 * POST /auth/signup
 * Create new user account with Appwrite Auth
 */
auth.post('/signup', zValidator('json', signupSchema), async (c) => {
	const { email, password, name } = c.req.valid('json');

	try {
		// Use admin client for server-side session creation
		const account = new Account(appwriteClient);

		logger.info(`Creating account for: ${email}`);
		
		// Create account
		const user = await account.create(ID.unique(), email, password, name);

		logger.info(`Account created successfully: ${user.email} (${user.$id})`);

		// Don't create session during signup - user should login separately
		// Create default subscription in Appwrite Databases
		try {
			await AppwriteService.createSubscription({
				userId: user.$id,
				plan: 'basic',
				quotaLimit: 1000,
			});
			logger.info(`Created default subscription for user: ${user.email}`);
		} catch (subError) {
			logger.warn(`Failed to create subscription for user ${user.email}:`, subError);
			// Continue anyway - user can create subscription later
		}

		return c.json(
			successResponse({
				user: {
					id: user.$id,
					email: user.email,
					name: user.name,
					emailVerification: user.emailVerification,
				},
				message: 'Account created successfully. Please login.',
			}),
			201
		);
	} catch (error) {
		logger.error('Signup failed:', error);
		return c.json(errorResponse(error instanceof Error ? error.message : 'Signup failed'), 400);
	}
});

/**
 * POST /auth/login
 * Login with email and password
 */
auth.post('/login', zValidator('json', loginSchema), async (c) => {
	const { email, password } = c.req.valid('json');

	try {
		// Use admin client for server-side session creation
		const account = new Account(appwriteClient);

		logger.info(`Attempting login for: ${email}`);
		
		// Create session
		const session = await account.createEmailPasswordSession(email, password);

		logger.info(`Login successful for: ${email}, session: ${session.$id}`);

		// Set session cookie instead of returning token
		setCookie(c, 'a_session_68eab819000cbd39007a', session.secret, {
			httpOnly: true,
			secure: false, // Set to false for development (localhost)
			sameSite: 'lax',
			maxAge: Math.floor((new Date(session.expire).getTime() - Date.now()) / 1000), // Convert to seconds
			path: '/',
		});

		return c.json(
			successResponse({
				message: 'Login successful',
				user: {
					id: session.userId,
					email: email,
				},
			})
		);
	} catch (error) {
		logger.error('Login failed:', error);
		return c.json(errorResponse('Invalid email or password'), 401);
	}
});

/**
 * POST /auth/logout
 * Logout current session
 */
auth.post('/logout', authMiddleware, async (c) => {
	const sessionToken = c.get('sessionToken') as string;

	try {
		const client = new Client()
			.setEndpoint(APPWRITE_ENDPOINT)
			.setProject(APPWRITE_PROJECT_ID)
			.setSession(sessionToken);
		const account = new Account(client);

		await account.deleteSession('current');

		logger.info('User logged out');

		return c.json(successResponse({ message: 'Logged out successfully' }));
	} catch (error) {
		logger.error('Logout failed:', error);
		return c.json(errorResponse('Logout failed'), 400);
	}
});

/**
 * GET /auth/me
 * Get current authenticated user
 */
auth.get('/me', authMiddleware, async (c) => {
	const user = c.get('user');

	try {
		// Get user's subscription
		const subscription = await AppwriteService.getUserSubscription(user.$id);

		// Get user's instances
		const instances = await AppwriteService.getUserInstances(user.$id);

		return c.json(
			successResponse({
				user,
				subscription: subscription
					? {
							plan: subscription.plan,
							quotaLimit: subscription.quotaLimit,
							quotaUsed: subscription.quotaUsed,
							quotaRemaining: subscription.quotaLimit - subscription.quotaUsed,
							isActive: subscription.isActive,
							renewsAt: subscription.renewsAt,
						}
					: null,
				instances: {
					total: instances.total,
					active: instances.documents.filter((i) => i.status === 'active').length,
				},
			})
		);
	} catch (error) {
		logger.error('Failed to get user info:', error);
		return c.json(errorResponse('Failed to retrieve user information'), 500);
	}
});

/**
 * POST /auth/verify-email
 * Send email verification
 */
auth.post('/verify-email', authMiddleware, async (c) => {
	const sessionToken = c.get('sessionToken') as string;

	try {
		const client = new Client()
			.setEndpoint(APPWRITE_ENDPOINT)
			.setProject(APPWRITE_PROJECT_ID)
			.setSession(sessionToken);
		const account = new Account(client);

		// Generate verification URL
		const verification = await account.createVerification(
			`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify`
		);

		logger.info('Email verification sent');

		return c.json(
			successResponse({
				message: 'Verification email sent',
				expires: verification.$createdAt,
			})
		);
	} catch (error) {
		logger.error('Failed to send verification email:', error);
		return c.json(errorResponse('Failed to send verification email'), 500);
	}
});

export default auth;
