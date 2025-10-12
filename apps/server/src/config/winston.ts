/**
 * Winston Logger Configuration
 * Structured logging for production applications
 */

import winston from 'winston';

const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.errors({ stack: true }),
	winston.format.splat(),
	winston.format.json()
);

const consoleFormat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp({ format: 'HH:mm:ss' }),
	winston.format.printf(({ timestamp, level, message, ...meta }) => {
		const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
		return `${timestamp} [${level}]: ${message} ${metaStr}`;
	})
);

export const logger = winston.createLogger({
	level: logLevel,
	format: logFormat,
	transports: [
		// Console output for development
		new winston.transports.Console({
			format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
		}),
		// File output for production
		...(process.env.NODE_ENV === 'production'
			? [
					new winston.transports.File({
						filename: 'logs/error.log',
						level: 'error',
						maxsize: 5242880, // 5MB
						maxFiles: 5,
					}),
					new winston.transports.File({
						filename: 'logs/combined.log',
						maxsize: 5242880, // 5MB
						maxFiles: 5,
					}),
				]
			: []),
	],
	exceptionHandlers: process.env.NODE_ENV === 'production' ? [new winston.transports.File({ filename: 'logs/exceptions.log' })] : [new winston.transports.Console()],
	rejectionHandlers: process.env.NODE_ENV === 'production' ? [new winston.transports.File({ filename: 'logs/rejections.log' })] : [new winston.transports.Console()],
});

export default logger;
