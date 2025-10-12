/**
 * Global Error Handler
 * Catches and formats all errors for consistent API responses
 */

import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { logger } from '../config/winston.js';

export interface ErrorResponse {
	success: false;
	error: string;
	details?: unknown;
	timestamp: string;
}

/**
 * Global error handler for Hono
 */
export function errorHandler(err: Error, c: Context) {
	logger.error('Error occurred:', {
		error: err.message,
		stack: err.stack,
		path: c.req.path,
		method: c.req.method,
	});

	// Handle HTTP exceptions (from Hono)
	if (err instanceof HTTPException) {
		return c.json<ErrorResponse>(
			{
				success: false,
				error: err.message,
				timestamp: new Date().toISOString(),
			},
			err.status
		);
	}

	// Handle Zod validation errors
	if (err instanceof ZodError) {
		return c.json<ErrorResponse>(
			{
				success: false,
				error: 'Validation failed',
				details: err.issues,
				timestamp: new Date().toISOString(),
			},
			400
		);
	}

	// Handle generic errors
	return c.json<ErrorResponse>(
		{
			success: false,
			error: err.message || 'Internal server error',
			timestamp: new Date().toISOString(),
		},
		500
	);
}
