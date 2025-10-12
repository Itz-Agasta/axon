/**
 * Type definitions for Hono context
 */

import type { Context } from 'hono';
import type { Models } from 'node-appwrite';

/**
 * User data stored in context after authentication
 */
export interface AppUser extends Models.User<Models.Preferences> {
	$id: string;
	email: string;
	name: string;
}

/**
 * Extended Hono context with user and session data
 */
export type HonoContext = Context<{
	Variables: {
		user: AppUser | null;
		sessionToken: string | null;
	};
}>;
