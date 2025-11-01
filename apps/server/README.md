# Axon API Server

> High-performance backend for decentralized AI memory powered by Appwrite and Arweave

The Axon API Server is a production-ready backend built with Hono and Bun, providing a complete REST API for AI memory management. It integrates Appwrite's backend services with blockchain storage to deliver permanent, searchable AI memories.


## Technology Stack

### Core Framework
- **Hono** - Ultra-fast web framework (faster than Express)
- **Bun** - JavaScript runtime (3x faster than Node.js)
- **TypeScript** - Type-safe development

### Appwrite Services

#### 1. Authentication Service
```typescript
// User management and session handling
import { Account, Users } from 'node-appwrite';

Features:
- Email/password authentication
- OAuth providers (Google, GitHub, etc.)
- JWT session management
- Password reset via email
- Account verification
```

#### 2. Database Service
```typescript
// Document-based NoSQL database
import { Databases, Query } from 'node-appwrite';

Collections:
1. Subscriptions
   - User plan tracking (basic/pro/enterprise)
   - Quota limits and usage
   - Renewal dates
   - Stripe integration fields

2. Instances
   - Blockchain contract references
   - User-specific vector databases
   - Status tracking (active/suspended/deleted)
   - Memory count statistics

3. API Keys
   - Secure key management
   - Key hashing with bcrypt
   - Usage tracking
   - Expiration dates

4. Memory Metadata
   - Content and context
   - Importance scores
   - Tags for categorization
   - Vector ID references
```

#### 3. Storage Service (Planned)
```typescript
// File storage for attachments
import { Storage } from 'node-appwrite';

Future Use Cases:
- Memory file attachments (PDFs, images)
- User profile pictures
- Memory export/import files
- Training data uploads
```

#### 4. Messaging Service (Planned)
```typescript
// Email notifications
import { Messaging } from 'node-appwrite';

Planned Features:
- Welcome emails on registration
- Weekly memory digest
- Quota warning emails
- Security alerts
```

#### 5. Functions Service (Planned)
```typescript
// Serverless background jobs
import { Functions } from 'node-appwrite';

Future Jobs:
- Nightly memory cleanup
- Usage analytics aggregation
- Blockchain sync verification
- Scheduled embeddings generation
```

### Blockchain Stack

#### Arweave
- Permanent data storage
- Pay once, store forever model
- Decentralized network
- Cryptographic proofs

#### Warp Contracts
- Smart contracts on Arweave
- Lazy evaluation for efficiency
- State caching with Redis
- Gas-free transactions

#### EizenDB
- Custom HNSW vector database
- O(log N) search complexity
- Protocol Buffer encoding
- Multi-tenant architecture

### Supporting Services

#### Redis
- Warp contract state caching
- Session storage (future)
- Rate limiting (future)

#### Xenova Transformers
- Local embedding generation
- No external API dependencies
- ONNX runtime for performance
- all-MiniLM-L6-v2 model (384 dim)

#### Winston
- Structured logging
- Multiple transports
- Log levels (error/warn/info/debug)
- Timestamp and context tracking

## Project Structure

```
apps/server/
├── src/
│   ├── config/              # Configuration modules
│   │   ├── appwrite.ts      # Appwrite SDK setup
│   │   ├── arweave.ts       # Arweave/Warp config
│   │   ├── redis.ts         # Redis client
│   │   └── winston.ts       # Logger config
│   │
│   ├── middlewares/         # Request middleware
│   │   ├── auth.ts          # Authentication verification
│   │   ├── errorHandler.ts  # Global error handling
│   │   └── quota.ts         # Usage quota enforcement
│   │
│   ├── routes/              # API endpoints
│   │   ├── auth.ts          # /auth routes
│   │   ├── health.ts        # /health routes
│   │   ├── memories.ts      # /memories routes
│   │   └── instances.ts     # /instances routes
│   │
│   ├── services/            # Business logic
│   │   ├── AppwriteService.ts   # Appwrite operations
│   │   ├── EizenService.ts      # Vector DB operations
│   │   ├── EmbeddingService.ts  # Text to vector
│   │   └── MemoryService.ts     # High-level memory ops
│   │
│   ├── schemas/             # Zod validation schemas
│   │   ├── auth.ts          # Auth request/response
│   │   ├── common.ts        # Shared types
│   │   ├── eizen.ts         # Vector operations
│   │   └── memory.ts        # Memory operations
│   │
│   ├── utils/               # Utility functions
│   │   ├── apiKey.ts        # API key generation
│   │   └── validation.ts    # Input validators
│   │
│   └── index.ts             # Application entry point
│
├── scripts/                 # Setup and maintenance
│   ├── setup-appwrite.ts             # Initial Appwrite setup
│   ├── setup-appwrite-collections.ts # Create collections
│   └── cleanup-subscriptions.ts      # Admin utilities
│
├── data/                    # Contract data for ArLocal
│   ├── contract.js          # Warp contract source
│   └── state.json           # Initial contract state
│
├── cache/                   # Runtime cache (gitignored)
│   └── warp/                # Warp contract cache
│
├── package.json
├── tsconfig.json
├── tsdown.config.ts
└── README.md
```

## API Endpoints

### Authentication Routes

#### POST /auth/register
Register a new user account.

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "success": true,
  "user": {
    "$id": "...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "$id": "...",
    "userId": "...",
    "expire": "..."
  }
}
```

#### POST /auth/login
Authenticate existing user.

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### GET /auth/me
Get current user information (requires authentication).

```bash
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer <session_token>"
```

#### POST /auth/logout
End current session.

```bash
curl -X POST http://localhost:3001/auth/logout \
  -H "Authorization: Bearer <session_token>"
```

### Memory Routes

#### POST /memories
Store a new memory.

```bash
curl -X POST http://localhost:3001/memories \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "User prefers detailed technical explanations with code examples",
    "metadata": {
      "importance": 8,
      "tags": ["preference", "communication"],
      "context": "conversation about API documentation"
    }
  }'
```

Response:
```json
{
  "success": true,
  "memoryId": 42,
  "message": "Memory created from 67 characters of content"
}
```

#### GET /memories/search
Search memories with natural language.

```bash
curl "http://localhost:3001/memories/search?q=how%20does%20user%20like%20explanations&k=5" \
  -H "Authorization: Bearer <session_token>"
```

Query Parameters:
- `q` (required): Search query text
- `k` (optional): Number of results (default: 10)

Response:
```json
{
  "success": true,
  "results": [
    {
      "id": 42,
      "content": "User prefers detailed technical explanations...",
      "metadata": {
        "importance": 8,
        "tags": ["preference", "communication"]
      },
      "distance": 0.12
    }
  ],
  "query": "how does user like explanations",
  "count": 1
}
```

### Instance Routes

#### GET /instances
List all user's vector database instances.

```bash
curl http://localhost:3001/instances \
  -H "Authorization: Bearer <session_token>"
```

#### POST /instances
Deploy a new vector database instance.

```bash
curl -X POST http://localhost:3001/instances \
  -H "Authorization: Bearer <session_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Instance"
  }'
```

Response:
```json
{
  "success": true,
  "instance": {
    "$id": "...",
    "contractId": "arweave_contract_id",
    "walletAddress": "...",
    "status": "active",
    "deployedAt": "2025-10-28T..."
  }
}
```

#### GET /instances/:id
Get specific instance details.

```bash
curl http://localhost:3001/instances/instance_id \
  -H "Authorization: Bearer <session_token>"
```

### Health Routes

#### GET /health
Overall system health check.

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-28T...",
  "services": {
    "appwrite": "connected",
    "arweave": "connected",
    "redis": "connected",
    "embedding": "ready"
  },
  "version": "2.0.0"
}
```

## Environment Variables

Create a `.env` file in the server directory:

```bash
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id

# Collection IDs (auto-generated by setup script)
APPWRITE_COLLECTION_SUBSCRIPTIONS=subscriptions
APPWRITE_COLLECTION_INSTANCES=instances
APPWRITE_COLLECTION_API_KEYS=apiKeys
APPWRITE_COLLECTION_MEMORY_METADATA=memoryMetadata

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,http://localhost:3002

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Arweave Configuration
# For development (ArLocal testnet)
ARWEAVE_HOST=localhost
ARWEAVE_PORT=1984
ARWEAVE_PROTOCOL=http

# For production (Arweave mainnet)
# ARWEAVE_HOST=arweave.net
# ARWEAVE_PORT=443
# ARWEAVE_PROTOCOL=https

# Wallet Path (for contract deployment)
WALLET_PATH=./dev-wallet.json

# Logging
LOG_LEVEL=info
```

## Setup Instructions

### 1. Install Dependencies

```bash
bun install
```

### 2. Start Redis

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or using local Redis
redis-server
```

### 3. Start ArLocal (Development)

```bash
# Install ArLocal globally
bun add -g arlocal

# Run in separate terminal
arlocal
```

### 4. Setup Appwrite

#### Option A: Use Appwrite Cloud
1. Sign up at https://cloud.appwrite.io
2. Create a new project
3. Copy Project ID and API Key

#### Option B: Self-Host Appwrite
```bash
docker run -d \
  --name appwrite \
  -p 80:80 \
  -p 443:443 \
  -v appwrite:/storage/uploads \
  -v appwrite-cache:/storage/cache \
  -v appwrite-config:/storage/config \
  -v appwrite-certificates:/storage/certificates \
  --env-file .env \
  appwrite/appwrite:latest
```

### 5. Initialize Database Collections

```bash
bun run scripts/setup-appwrite-collections.ts
```

This creates:
- Subscriptions collection
- Instances collection
- API Keys collection
- Memory Metadata collection

With proper indexes and permissions.

### 6. Generate Development Wallet

```bash
bun run scripts/generate-wallet.ts
```

This creates `dev-wallet.json` with test tokens (ArLocal only).

### 7. Start Development Server

```bash
bun dev
```

Server starts on http://localhost:3001

## Development

### Available Scripts

```bash
# Development with hot reload
bun dev

# Build for production
bun build

# Start production server
bun start

# Type checking
bun check-types

# Compile to native binary
bun compile
```

### Code Structure Guidelines

#### Service Pattern
Each service encapsulates a specific domain:

```typescript
// services/ExampleService.ts
export class ExampleService {
  // Static methods for stateless operations
  static async operation(params) {
    // Implementation
  }

  // Instance methods for stateful operations
  private state: any;
  
  async instanceOperation() {
    // Implementation using this.state
  }
}
```

#### Error Handling
All errors are caught and returned in a consistent format:

```typescript
{
  success: false,
  error: "Human-readable error message",
  code: "ERROR_CODE",
  timestamp: "2025-10-28T..."
}
```

#### Logging
Use Winston logger for all logging:

```typescript
import { logger } from './config/winston.js';

logger.info('Operation completed', { userId, duration });
logger.error('Operation failed', { error: err.message });
logger.debug('Debug information', { data });
```

## Testing

### Unit Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test services/EizenService.test.ts

# Watch mode
bun test --watch
```

### Integration Tests

```bash
# Test full API flow
bun test:integration

# Test with real Appwrite (requires setup)
bun test:e2e
```

### Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run tests/load/memories.js
```

## Performance

### Benchmarks (Local Development)

**Memory Creation:**
- Text to embedding: ~50ms
- Vector insertion: ~100-200ms
- Appwrite metadata: ~30ms
- **Total: ~180-280ms**

**Memory Search:**
- Text to embedding: ~50ms
- Vector search (100K vectors): ~10-20ms
- Appwrite metadata fetch: ~20ms
- **Total: ~80-90ms**

**Instance Deployment:**
- Contract creation: ~500ms (ArLocal)
- Appwrite document: ~30ms
- **Total: ~530ms**

### Optimization Tips

1. **Use Redis Caching**
   - Cache Warp contract state
   - Reduces blockchain read latency

2. **Batch Operations**
   - Insert multiple memories at once
   - Reduces round-trip overhead

3. **Optimize Embeddings**
   - Use smaller models for faster generation
   - Consider GPU acceleration

4. **Database Indexes**
   - Ensure proper Appwrite indexes
   - Index frequently queried fields

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use production Appwrite instance
- [ ] Use Arweave mainnet
- [ ] Enable SSL/TLS
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure rate limiting
- [ ] Enable Redis password
- [ ] Set strong JWT secret
- [ ] Configure CORS properly
- [ ] Set up automated backups

### Deployment Options

#### 1. Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

#### 2. Fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch
flyctl launch

# Deploy
flyctl deploy
```

#### 3. Docker
```dockerfile
FROM oven/bun:1.2.19-alpine

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .
RUN bun build

CMD ["bun", "start"]
```

```bash
docker build -t axon-server .
docker run -p 3001:3001 axon-server
```

## Monitoring

### Health Checks

```bash
# Overall health
curl http://localhost:3001/health

# Specific service health
curl http://localhost:3001/health/appwrite
curl http://localhost:3001/health/arweave
```

### Logging

Logs are written to:
- Console (development)
- File: `logs/combined.log` (all logs)
- File: `logs/error.log` (errors only)

### Metrics (Future)

Planned integration with:
- Prometheus (metrics collection)
- Grafana (visualization)
- Sentry (error tracking)

## Troubleshooting

### Common Issues

**1. Appwrite Connection Error**
```
Error: connect ECONNREFUSED
```
Solution: Check APPWRITE_ENDPOINT and ensure Appwrite is running

**2. Redis Connection Error**
```
Error: Redis connection failed
```
Solution: Start Redis server or check Redis configuration

**3. ArLocal Not Running**
```
Error: ECONNREFUSED localhost:1984
```
Solution: Start ArLocal with `arlocal` command

**4. Insufficient Wallet Balance**
```
Error: Insufficient wallet balance for deployment
```
Solution: For ArLocal, wallet is auto-funded. For mainnet, add AR tokens.

**5. Collection Not Found**
```
Error: Collection not found
```
Solution: Run `bun run scripts/setup-appwrite-collections.ts`

## Contributing

See main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

### Code Style

- Use TypeScript strict mode
- Follow Biome formatting rules
- Write JSDoc comments for public APIs
- Use async/await (no callbacks)
- Handle all errors explicitly

## Security

### Best Practices

1. **API Keys**: Always hash before storage (bcrypt)
2. **Sessions**: Validate Appwrite sessions on every request
3. **Input**: Validate all input with Zod schemas
4. **CORS**: Configure allowed origins explicitly
5. **Rate Limiting**: Enforce quota limits per user
6. **Logging**: Never log sensitive data (passwords, keys)

### Reporting Security Issues

Email: security@context0.tech

## License

MIT License - see [LICENSE](../../LICENSE)

## Support

- **Issues**: https://github.com/Itz-Agasta/axon/issues
- **Discussions**: https://github.com/Itz-Agasta/axon/discussions
- **Email**: rupam.golui@proton.me
