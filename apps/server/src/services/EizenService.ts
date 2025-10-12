/**
 * Eizen Vector Database Service
 * Manages vector storage and similarity search using HNSW algorithm
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EizenDbVector } from 'eizendb';
import { SetSDK } from 'hollowdb';
import { type ArweaveConfig, getArweaveConfig } from '../config/arweave.js';
import type {
	InsertVector,
	SearchVector,
	VectorEmbedding,
	EizenSearchResult,
	EizenInsertResult,
} from '../schemas/eizen.js';
import { type VectorMetadata } from '../schemas/common.js';
import { logger } from '../config/winston.js';

/**
 * Service class for managing Eizen vector database operations
 */
export class EizenService {
	private vectorDb: EizenDbVector<VectorMetadata> | null = null;
	private sdk: SetSDK<string> | null = null;
	private contractId: string;
	private isInitialized = false;

	private static sharedArweaveConfig: ArweaveConfig | null = null;
	private static arweaveInitPromise: Promise<ArweaveConfig> | null = null;

	private constructor(contractId: string) {
		this.contractId = contractId;
	}

	/**
	 * Create EizenService for a specific contract
	 */
	static async forContract(contractId: string): Promise<EizenService> {
		const service = new EizenService(contractId);
		await service.initialize();
		return service;
	}

	/**
	 * Deploy a new contract and return the contractID
	 */
	static async deployNewContract(): Promise<{
		contractId: string;
		walletAddress: string;
	}> {
		const arweaveConfig = await EizenService.getSharedArweaveConfig();

		try {
			logger.info('Deploying new Eizen contract...');

			const walletAddress = await arweaveConfig.warp.arweave.wallets.getAddress(
				arweaveConfig.wallet
			);

			// Check wallet balance
			const balance = await arweaveConfig.warp.arweave.wallets.getBalance(walletAddress);
			const readableBalance = arweaveConfig.warp.arweave.ar.winstonToAr(balance);

			logger.info(`Wallet balance: ${readableBalance} AR (${walletAddress})`);

			if (parseFloat(readableBalance) <= 0) {
				const isProduction = process.env.NODE_ENV === 'production';
				if (!isProduction) {
					throw new Error(
						`Insufficient wallet balance. Current: ${readableBalance} AR. ` +
							'💡 Dev tip: ArLocal should auto-mint tokens. Check ArLocal is running.'
					);
				}
				throw new Error(
					`Insufficient wallet balance for deployment. Current: ${readableBalance} AR.`
				);
			}

			const isProduction = process.env.NODE_ENV === 'production';
			let contractTxId: string;

			if (isProduction) {
				// Production: Use EizenDbVector.deploy()
				const result = await EizenDbVector.deploy(arweaveConfig.wallet, arweaveConfig.warp);
				contractTxId = result.contractTxId;
			} else {
				// Development: Use warp.deploy() with embedded contract source
				logger.info('Using ArLocal TestNet for deployment');

				const contractSource = readFileSync(
					join(process.cwd(), 'data', 'contract.js'),
					'utf8'
				);
				const initialState = JSON.parse(
					readFileSync(join(process.cwd(), 'data', 'state.json'), 'utf8')
				);

				initialState.owner = walletAddress;

				const result = await arweaveConfig.warp.deploy({
					wallet: arweaveConfig.wallet,
					initState: JSON.stringify(initialState),
					src: contractSource,
					evaluationManifest: {
						evaluationOptions: {
							allowBigInt: true,
							useKVStorage: true,
						},
					},
				});
				contractTxId = result.contractTxId;
			}

			logger.info(`✅ Eizen contract deployed successfully: ${contractTxId}`);

			// Check balance after deployment
			const newBalance = await arweaveConfig.warp.arweave.wallets.getBalance(walletAddress);
			const newReadableBalance = arweaveConfig.warp.arweave.ar.winstonToAr(newBalance);
			logger.info(`Wallet balance after deployment: ${newReadableBalance} AR`);

			return {
				contractId: contractTxId,
				walletAddress,
			};
		} catch (error) {
			logger.error('Failed to deploy contract:', error);
			throw new Error(
				`Failed to deploy contract: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	private static async getSharedArweaveConfig(): Promise<ArweaveConfig> {
		if (EizenService.sharedArweaveConfig) {
			return EizenService.sharedArweaveConfig;
		}

		if (!EizenService.arweaveInitPromise) {
			EizenService.arweaveInitPromise = getArweaveConfig();
		}

		EizenService.sharedArweaveConfig = await EizenService.arweaveInitPromise;
		return EizenService.sharedArweaveConfig!;
	}

	private static getHnswParams() {
		return {
			m: Number(process.env.EIZEN_M) || 16,
			efConstruction: Number(process.env.EIZEN_EF_CONSTRUCTION) || 200,
			efSearch: Number(process.env.EIZEN_EF_SEARCH) || 50,
		};
	}

	private async initialize(): Promise<void> {
		try {
			logger.info(`Initializing EizenService for contract: ${this.contractId}`);

			const arweaveConfig = await EizenService.getSharedArweaveConfig();

			this.sdk = new SetSDK<string>(arweaveConfig.wallet, this.contractId, arweaveConfig.warp);

			const options = EizenService.getHnswParams();

			this.vectorDb = new EizenDbVector<VectorMetadata>(this.sdk, options);

			this.isInitialized = true;
			logger.info(`✅ EizenService initialized for contract: ${this.contractId}`);
			logger.info(
				`HNSW Parameters: m=${options.m}, efConstruction=${options.efConstruction}, efSearch=${options.efSearch}`
			);
		} catch (error) {
			logger.error(`EizenService initialization failed for contract ${this.contractId}:`, error);
			throw error;
		}
	}

	private async ensureInitialized(): Promise<void> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		if (!this.vectorDb) {
			throw new Error('EizenService is not properly initialized');
		}
	}

	/**
	 * Insert a vector with metadata
	 */
	async insertVector(data: InsertVector): Promise<EizenInsertResult> {
		await this.ensureInitialized();

		if (!this.vectorDb) {
			throw new Error('Vector database not initialized');
		}

		try {
			logger.info(`Inserting vector with ${data.vector.length} dimensions`);

			const vectorId = await this.vectorDb.db.get_datasize();

			await this.vectorDb.insert(data.vector, data.metadata);

			logger.info(`✅ Vector inserted successfully with ID: ${vectorId}`);

			return {
				success: true,
				vectorId,
				message: `Vector inserted successfully with ID: ${vectorId}`,
			};
		} catch (error) {
			logger.error('Failed to insert vector:', error);
			throw new Error(
				`Failed to insert vector: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Search for k most similar vectors
	 */
	async searchVectors(data: SearchVector): Promise<EizenSearchResult[]> {
		await this.ensureInitialized();

		if (!this.vectorDb) {
			throw new Error('Vector database not initialized');
		}

		try {
			logger.info(`Searching for ${data.k} nearest neighbors`);

			const results = await this.vectorDb.knn_search(data.query, data.k);

			logger.info(`✅ Found ${results.length} similar vectors`);

			return results.map((result) => ({
				id: result.id,
				distance: result.distance,
				metadata: result.metadata || undefined,
			}));
		} catch (error) {
			logger.error('Failed to search vectors:', error);
			throw new Error(
				`Failed to search vectors: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Get a specific vector by ID
	 */
	async getVector(
		vectorId: number
	): Promise<{ point: VectorEmbedding; metadata?: VectorMetadata } | null> {
		await this.ensureInitialized();

		if (!this.vectorDb) {
			throw new Error('Vector database not initialized');
		}

		try {
			logger.info(`Retrieving vector with ID: ${vectorId}`);

			const result = await this.vectorDb.get_vector(vectorId);

			if (result) {
				logger.info(`✅ Vector ${vectorId} retrieved successfully`);
				return {
					point: result.point,
					metadata: result.metadata || undefined,
				};
			}

			logger.info(`Vector ${vectorId} not found`);
			return null;
		} catch (error) {
			logger.error(`Failed to retrieve vector ${vectorId}:`, error);
			throw new Error(
				`Failed to retrieve vector: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Get database statistics
	 */
	async getStats(): Promise<{
		totalVectors: number;
		isInitialized: boolean;
		contractId: string;
	}> {
		try {
			return {
				totalVectors: this.vectorDb ? await this.getVectorCount() : 0,
				isInitialized: this.isInitialized,
				contractId: this.contractId,
			};
		} catch {
			return {
				totalVectors: 0,
				isInitialized: this.isInitialized,
				contractId: this.contractId,
			};
		}
	}

	private async getVectorCount(): Promise<number> {
		if (!this.vectorDb) {
			return 0;
		}
		return await this.vectorDb.db.get_datasize();
	}

	/**
	 * Cleanup resources
	 */
	async cleanup(): Promise<void> {
		try {
			this.isInitialized = false;
			this.vectorDb = null;
			this.sdk = null;
			logger.info(`EizenService cleaned up for contract: ${this.contractId}`);
		} catch (error) {
			logger.error('Failed to cleanup EizenService:', error);
		}
	}
}
