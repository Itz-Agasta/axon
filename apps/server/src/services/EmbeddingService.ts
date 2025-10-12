/**
 * Embedding Service
 * Converts text to vector embeddings using transformer models
 */

import { pipeline } from '@xenova/transformers';
import type { VectorEmbedding } from '../schemas/eizen.js';
import { logger } from '../config/winston.js';

type EmbeddingPipeline = (
	texts: string[],
	options?: { pooling?: string; normalize?: boolean }
) => Promise<{
	data: Float32Array | number[];
	dims: number[];
}>;

export interface EmbeddingResult {
	embeddings: VectorEmbedding;
	dimensions: number;
	model: string;
}

/**
 * Service for converting text to vector embeddings
 * Uses Xenova transformers with all-MiniLM-L6-v2 model (384 dimensions)
 */
export class EmbeddingService {
	private extractor: EmbeddingPipeline | null = null;
	private isInitialized = false;
	private initializationPromise: Promise<void> | null = null;
	private readonly modelName = 'Xenova/all-MiniLM-L6-v2';

	private async initialize(): Promise<void> {
		try {
			logger.info('Initializing EmbeddingService...');
			logger.info(`Loading model: ${this.modelName}`);

			this.extractor = (await pipeline(
				'feature-extraction',
				this.modelName
			)) as EmbeddingPipeline;

			this.isInitialized = true;
			logger.info('✅ EmbeddingService initialized successfully');
		} catch (error) {
			logger.error('❌ EmbeddingService initialization failed:', error);
			throw error;
		}
	}

	async ensureInitialized(): Promise<void> {
		if (this.isInitialized && this.extractor) {
			return;
		}

		if (this.initializationPromise) {
			await this.initializationPromise;
			return;
		}

		this.initializationPromise = this.initialize();

		try {
			await this.initializationPromise;
		} finally {
			this.initializationPromise = null;
		}

		if (!this.extractor) {
			throw new Error('EmbeddingService is not properly initialized');
		}
	}

	/**
	 * Convert text to vector embedding
	 */
	async textToEmbeddings(text: string): Promise<EmbeddingResult> {
		await this.ensureInitialized();

		if (!this.extractor) {
			throw new Error('Extractor not initialized');
		}

		try {
			logger.debug(`Converting text to embeddings: "${text.substring(0, 50)}..."`);

			const response = await this.extractor([text], {
				pooling: 'mean',
				normalize: true,
			});

			const embeddings: VectorEmbedding = Array.from(response.data);

			logger.debug(`Generated ${embeddings.length}-dimensional embeddings`);

			return {
				embeddings,
				dimensions: embeddings.length,
				model: this.modelName,
			};
		} catch (error) {
			logger.error('Failed to generate embeddings:', error);
			throw new Error(
				`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Batch process multiple texts
	 */
	async batchTextToEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
		await this.ensureInitialized();

		if (!this.extractor) {
			throw new Error('Extractor not initialized');
		}

		try {
			logger.info(`Converting ${texts.length} texts to embeddings (batch)`);

			const response = await this.extractor(texts, {
				pooling: 'mean',
				normalize: true,
			});

			const embeddingDim = response.dims.at(-1) ?? 0;

			if (embeddingDim <= 0) {
				throw new Error(`Invalid embedding dimension: ${embeddingDim}`);
			}

			const batchDim = response.dims[0] ?? 0;
			if (batchDim !== texts.length) {
				throw new Error(`Batch dimension mismatch: expected ${texts.length} but got ${batchDim}`);
			}

			const results: EmbeddingResult[] = [];

			if (response.dims.length === 1) {
				if (texts.length !== 1) {
					throw new Error(`Expected 1 text for 1D tensor, got ${texts.length} texts`);
				}
				const embeddings: VectorEmbedding = Array.from(response.data);
				results.push({
					embeddings,
					dimensions: embeddings.length,
					model: this.modelName,
				});
			} else if (response.dims.length === 2) {
				for (let i = 0; i < texts.length; i++) {
					const startIdx = i * embeddingDim;
					const endIdx = startIdx + embeddingDim;

					if (startIdx >= response.data.length || endIdx > response.data.length) {
						throw new Error(
							`Index out of bounds: trying to slice [${startIdx}:${endIdx}] from data of length ${response.data.length}`
						);
					}

					const embeddings: VectorEmbedding = Array.from(response.data.slice(startIdx, endIdx));

					results.push({
						embeddings,
						dimensions: embeddings.length,
						model: this.modelName,
					});
				}
			} else {
				throw new Error(
					`Unexpected tensor dimensionality: ${response.dims.length}D tensor with dims [${response.dims.join(', ')}]`
				);
			}

			logger.info(`✅ Generated embeddings for ${results.length} texts`);
			return results;
		} catch (error) {
			logger.error('Failed to generate batch embeddings:', error);
			throw new Error(
				`Failed to generate batch embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	getInfo(): { model: string; isInitialized: boolean } {
		return {
			model: this.modelName,
			isInitialized: this.isInitialized,
		};
	}
}

// Singleton instance
export const embeddingService = new EmbeddingService();
