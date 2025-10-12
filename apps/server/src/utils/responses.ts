/**
 * Standard API Response Helpers
 */

export interface SuccessResponse<T = unknown> {
	success: true;
	data: T;
	message?: string;
	timestamp: string;
}

export interface ErrorResponse {
	success: false;
	error: string;
	details?: unknown;
	timestamp: string;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Create success response
 */
export function successResponse<T>(data: T, message?: string): SuccessResponse<T> {
	return {
		success: true,
		data,
		...(message && { message }),
		timestamp: new Date().toISOString(),
	};
}

/**
 * Create error response
 */
export function errorResponse(error: string, details?: unknown): ErrorResponse {
	return {
		success: false,
		error,
		details,
		timestamp: new Date().toISOString(),
	};
}
