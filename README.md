# Axon - Decentralized Memory Layer for AI Agents

> Building the future of AI memory with Appwrite and blockchain technology

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Powered by Appwrite](https://img.shields.io/badge/Powered%20by-Appwrite-F02E65?logo=appwrite&logoColor=white)](https://appwrite.io)
[![Arweave](https://img.shields.io/badge/Storage-Arweave-9945FF)](https://arweave.org)

Axon is a decentralized AI memory platform that enables AI agents to store and retrieve memories permanently on blockchain infrastructure, powered by Appwrite's backend services.

## What is Axon?

Axon provides a complete solution for AI agents to maintain persistent, searchable, and censorship-resistant memory across sessions and platforms. By combining Appwrite's developer-friendly backend with blockchain's permanence, Axon offers the best of both worlds.

### Key Features

- **Permanent Storage**: Memories stored on Arweave blockchain last forever
- **Semantic Search**: Natural language queries using vector similarity
- **User Ownership**: Each user gets their own isolated blockchain contract
- **Privacy First**: Local embedding generation, no data sent to third parties
- **Developer Friendly**: Simple REST API with comprehensive documentation
- **Enterprise Ready**: Built on Appwrite's scalable infrastructure


### Technology Stack

**Backend:**
- Appwrite (Auth, Database, Storage)
- Hono (Web framework)
- Bun (Runtime)
- EizenDB (Vector database)
- Arweave (Blockchain storage)
- Warp Contracts (Smart contracts)
- Redis (Caching)
- Winston (Logging)

**Frontend:**
- Next.js 15 (App Router)
- Appwrite SDK (Authentication)
- Radix UI (Components)
- Tailwind CSS (Styling)
- TanStack Query (State management)

**Developer Tools:**
- Turborepo (Monorepo management)
- TypeScript (Type safety)
- Biome (Linting & formatting)
- Husky (Git hooks)



## Core Features

### 1. User Authentication

Powered by Appwrite Auth:
- Email/password registration
- OAuth providers (Google, GitHub)
- JWT session management
- Password reset functionality

### 2. Memory Management

Store and retrieve AI agent memories:

```typescript
// Store a memory
POST /memories
{
  "content": "User prefers technical explanations",
  "metadata": {
    "importance": 8,
    "tags": ["preference", "communication"],
    "context": "conversation about documentation"
  }
}

// Search memories
GET /memories/search?q=how does user like explanations&k=5
```

### 3. Vector Instances

Each user gets an isolated blockchain contract:
- Automatic deployment to Arweave
- Independent state management
- Quota tracking per instance
- Status monitoring (active/suspended/deleted)

### 4. Subscription System

Three tiers of service:
- **Basic**: 1,000 operations/month
- **Pro**: 50,000 operations/month
- **Enterprise**: Unlimited operations

### 5. API Keys

Secure API authentication:
- Multiple keys per user
- Key revocation
- Usage tracking
- Expiration dates

## API Documentation

### Authentication

All protected endpoints require authentication via Appwrite session or API key:

```bash
# Using Appwrite session
curl -H "Authorization: Bearer <session_token>" \
  http://localhost:3001/memories

# Using API key
curl -H "X-API-Key: <api_key>" \
  http://localhost:3001/memories
```

### Core Endpoints

**Health Check:**
```bash
GET /health
```

**User Authentication:**
```bash
POST /auth/register
POST /auth/login
POST /auth/logout
GET /auth/me
```

**Memory Operations:**
```bash
POST /memories              # Create memory
GET /memories/search        # Search memories
GET /memories/:id           # Get specific memory
DELETE /memories/:id        # Delete memory
```

**Instance Management:**
```bash
GET /instances              # List user's instances
POST /instances             # Deploy new instance
GET /instances/:id          # Get instance details
DELETE /instances/:id       # Delete instance
```

For complete API reference, see [docs/api/routes.md](docs/api/routes.md)

## Appwrite Integration

### Services Used

1. **Authentication**
   - User registration and login
   - Session management
   - OAuth integration

2. **Databases**
   - Subscriptions collection
   - Instances collection
   - API keys collection
   - Memory metadata collection

3. **Storage** (Planned)
   - File attachments
   - User avatars
   - Export/import

4. **Messaging** (Planned)
   - Email notifications
   - Usage alerts
   - Digest summaries

5. **Functions** (Planned)
   - Background jobs
   - Analytics aggregation
   - Scheduled cleanup

### Database Schema

See [apps/server/scripts/setup-appwrite-collections.ts](apps/server/scripts/setup-appwrite-collections.ts) for complete collection schemas.

## EizenDB: The Vector Database Engine

EizenDB is our custom vector database implementation running on Arweave:

- **HNSW Algorithm**: Hierarchical Navigable Small Worlds for efficient search
- **O(log N) Complexity**: Fast search even with millions of vectors
- **Protocol Buffers**: 60% storage cost reduction
- **Multi-Tenant**: Isolated contracts per user

Learn more: [docs/eizen/Eizen.md](docs/eizen/Eizen.md)



## Roadmap

- [x] Appwrite authentication integration
- [x] User subscription system
- [x] Vector instance management
- [x] Memory storage and search
- [x] Web dashboard
- [ ] TypeScript SDK
- [ ] Python SDK
- [ ] MCP server integration
- [ ] Team collaboration features
- [ ] Advanced analytics
- [ ] File attachment support
- [ ] Email notifications


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Appwrite Team** - For building an amazing backend platform
- **Arweave Team** - For permanent data storage
- **Context0 Community** - For early feedback and support
- **Open Source Contributors** - For the tools that make this possible

## Links

- **GitHub**: https://github.com/Itz-Agasta/axon
- **Context0 (Previous Project)**: https://github.com/Itz-Agasta/context0
- **Documentation**: [docs/](docs/)
- **Appwrite**: https://appwrite.io
- **Arweave**: https://arweave.org

## Support

- **Issues**: [GitHub Issues](https://github.com/Itz-Agasta/axon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Itz-Agasta/axon/discussions)
- **Email**: rupam.golui@proton.me
