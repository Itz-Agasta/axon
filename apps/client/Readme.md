# Axon Client Dashboard

> Modern web interface for managing AI agent memories

The Axon Client is a Next.js 15 application providing an intuitive dashboard for users to manage their AI agent memories, subscriptions, and vector database instances. Built with Appwrite for authentication and real-time data synchronization.

## Features

### Authentication
- Email/password registration and login
- OAuth providers (Google, GitHub) via Appwrite
- Persistent sessions with automatic refresh
- Protected routes with middleware
- User profile management

### Dashboard
- Real-time memory statistics
- Usage quota visualization
- Recent memories timeline
- Quick search interface
- Subscription status overview

### Memory Management
- Create new memories with metadata
- Semantic search with natural language
- Filter by tags and importance
- View memory details
- Export memories (planned)

### Instance Management
- List all vector database instances
- Deploy new instances
- Monitor instance status
- View memory counts per instance
- Delete unused instances

### Subscription Management
- View current plan (Basic/Pro/Enterprise)
- Upgrade/downgrade plans
- Usage analytics
- Billing history (planned)
- Payment integration with Stripe (planned)

### API Keys
- Generate API keys for programmatic access
- Copy keys to clipboard
- Revoke compromised keys
- View last used timestamps

## Technology Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with server components
- **TypeScript** - Type-safe development

### Appwrite Integration
- **appwrite SDK** - Official JavaScript SDK
- **Account API** - User authentication
- **Databases API** - Real-time data sync
- **Storage API** (planned) - File uploads

### UI Components
- **Radix UI** - Headless component library
  - Dialog
  - Popover
  - Separator
  - Slot
  - Tooltip
- **Lucide React** - Beautiful icons
- **Tabler Icons** - Additional icon set

### Styling
- **Tailwind CSS 4** - Utility-first CSS
- **tw-animate-css** - Animation utilities
- **class-variance-authority** - Component variants
- **clsx** - Conditional classes

### State Management
- **TanStack Query** - Server state management
- **React Context** - Global app state
- **Appwrite Realtime** - Live database updates

### Animations
- **GSAP** - Professional animations
- **Lenis** - Smooth scrolling
- **Motion** (Framer Motion) - React animations

### Web3 Integration
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- Future: Wallet connection for direct contract interaction

### AI Integration
- **OpenAI SDK** - ChatGPT integration
- **Google GenAI** - Gemini integration
- In-app AI chat assistant (planned)

### Data Visualization
- **Recharts** - Usage charts and analytics

## Project Structure

```
apps/client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles
│   │   │
│   │   ├── auth/               # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset/
│   │   │
│   │   ├── dashboard/          # Main dashboard
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── memories/       # Memory management
│   │   │   ├── instances/      # Instance management
│   │   │   ├── api-keys/       # API key management
│   │   │   └── settings/       # User settings
│   │   │
│   │   ├── get-started/        # Onboarding flow
│   │   ├── payment/            # Payment pages
│   │   └── playground/         # Demo playground
│   │
│   ├── components/             # React components
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   └── ui/                 # UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       └── ... (shadcn components)
│   │
│   ├── context/                # React Context providers
│   │   ├── AppwriteContext.tsx # Appwrite auth state
│   │   └── WagmiWrapper.tsx    # Web3 provider
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-mobile.ts       # Mobile detection
│   │   ├── useLenisProvider.tsx # Smooth scroll
│   │   └── usePaymentSuccess.tsx # Payment handling
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── api.ts              # API wrapper functions
│   │   ├── appwrite.ts         # Appwrite configuration
│   │   ├── chat.ts             # AI chat utilities
│   │   ├── getCryptoPrice.ts   # Crypto price API
│   │   └── utils.ts            # General utilities
│   │
│   ├── middleware.ts           # Next.js middleware (auth)
│   └── components.json         # shadcn/ui config
│
├── public/                     # Static assets
│   ├── emojis/                 # Emoji images
│   ├── fonts/                  # Custom fonts
│   ├── icons/                  # Icon files
│   └── images/                 # Images
│
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── postcss.config.mjs          # PostCSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

## Setup

### Prerequisites

- Node.js 20+ or Bun 1.2+
- Appwrite account (cloud or self-hosted)
- Running Axon API server

### Installation

1. Install dependencies:
```bash
bun install
```

2. Create `.env.local`:
```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: Web3 Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wc_project_id

# Optional: AI Configuration
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_key
```

3. Start development server:
```bash
bun dev
```

Access at http://localhost:3000

## Appwrite Integration

### Context Provider

The `AppwriteContext` manages authentication state globally:

```typescript
// src/context/AppwriteContext.tsx
export const AppwriteProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  return (
    <AppwriteContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      register
    }}>
      {children}
    </AppwriteContext.Provider>
  );
};
```

### Usage in Components

```typescript
import { useAppwrite } from '@/context/AppwriteContext';

export function DashboardPage() {
  const { user, isAuthenticated, logout } = useAppwrite();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Real-time Subscriptions

Listen to database changes in real-time:

```typescript
import { appwriteClient, DATABASE_ID } from '@/lib/appwrite';

useEffect(() => {
  const unsubscribe = appwriteClient.subscribe(
    `databases.${DATABASE_ID}.collections.memories.documents`,
    (response) => {
      if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        // New memory created
        console.log('New memory:', response.payload);
      }
    }
  );

  return () => unsubscribe();
}, []);
```

## API Integration

### API Wrapper

All API calls go through a centralized wrapper:

```typescript
// src/lib/api.ts
export const api = {
  memories: {
    create: async (data) => {
      const token = await getAppwriteSession();
      const response = await fetch(`${API_URL}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    
    search: async (query, k = 10) => {
      const token = await getAppwriteSession();
      const response = await fetch(
        `${API_URL}/memories/search?q=${query}&k=${k}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      return response.json();
    }
  },
  
  instances: {
    list: async () => { /* ... */ },
    create: async () => { /* ... */ },
    delete: async (id) => { /* ... */ }
  }
};
```

### TanStack Query Integration

Use React Query for server state:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function MemoriesList() {
  // Fetch memories
  const { data, isLoading, error } = useQuery({
    queryKey: ['memories'],
    queryFn: () => api.memories.list()
  });

  // Create memory mutation
  const createMemory = useMutation({
    mutationFn: api.memories.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['memories']);
    }
  });

  return (
    <div>
      {isLoading && <Spinner />}
      {error && <Error message={error.message} />}
      {data?.map(memory => (
        <MemoryCard key={memory.id} memory={memory} />
      ))}
      <button onClick={() => createMemory.mutate(newMemory)}>
        Create Memory
      </button>
    </div>
  );
}
```

## Component Library

### UI Components (shadcn/ui)

Pre-built accessible components:

```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

<Button variant="primary" size="lg">
  Create Memory
</Button>

<Card>
  <Card.Header>
    <Card.Title>Memory Details</Card.Title>
  </Card.Header>
  <Card.Content>
    {/* content */}
  </Card.Content>
</Card>
```

### Custom Components

Layout components for consistent design:

```typescript
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
```

## Styling Guide

### Tailwind CSS

Utility-first styling:

```tsx
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">
    My Memories
  </h2>
  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
    New Memory
  </Button>
</div>
```

### CSS Variables

Define theme colors in globals.css:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
}

.dark {
  --primary: 210 40% 98%;
  --secondary: 217.2 32.6% 17.5%;
}
```

### Animations

GSAP for complex animations:

```typescript
import gsap from 'gsap';

useEffect(() => {
  gsap.from('.memory-card', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.1
  });
}, []);
```

## Development

### Available Scripts

```bash
# Development server (with Turbopack)
bun dev

# Build for production
bun build

# Start production server
bun start

# Linting
bun lint
```

### Adding New Pages

1. Create page file in `src/app/`:
```tsx
// src/app/new-feature/page.tsx
export default function NewFeaturePage() {
  return <div>New Feature</div>;
}
```

2. Add to navigation:
```tsx
// src/components/layout/Sidebar.tsx
const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/new-feature', label: 'New Feature' }
];
```

### Adding New Components

Use shadcn CLI:

```bash
bunx shadcn@latest add button
bunx shadcn@latest add card
bunx shadcn@latest add dialog
```

Or create manually in `src/components/ui/`.

## Testing

### Unit Tests (Planned)

```bash
bun test
```

### E2E Tests (Planned)

Using Playwright:

```bash
bun test:e2e
```

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

```bash
# Or use CLI
bunx vercel
```

### Netlify

1. Connect repository
2. Build command: `bun build`
3. Publish directory: `.next`

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install

COPY . .
RUN bun build

EXPOSE 3000
CMD ["bun", "start"]
```

### Self-Hosted

```bash
bun build
bun start
```

Use PM2 for process management:

```bash
pm2 start bun --name "axon-client" -- start
```

## Performance

### Optimization Techniques

1. **Server Components**: Use RSC by default
2. **Dynamic Imports**: Lazy load heavy components
3. **Image Optimization**: Use Next.js Image component
4. **Font Optimization**: Use next/font
5. **Code Splitting**: Automatic with Next.js

### Lighthouse Score Target

- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## Security

### Best Practices

1. **Authentication**: Always verify Appwrite session
2. **Environment Variables**: Never expose secrets in client code
3. **XSS Protection**: Sanitize user input
4. **CSRF Protection**: Use Appwrite session tokens
5. **Content Security Policy**: Configure in next.config.ts

## Troubleshooting

### Common Issues

**1. Appwrite Connection Error**
```
Error: Failed to fetch
```
Solution: Check NEXT_PUBLIC_APPWRITE_ENDPOINT in .env.local

**2. Session Expired**
```
Error: Session expired
```
Solution: Refresh page or implement automatic token refresh

**3. CORS Error**
```
Error: CORS policy blocked
```
Solution: Add localhost:3000 to Appwrite allowed origins

**4. Build Error**
```
Error: Module not found
```
Solution: Delete .next folder and rebuild

## Contributing

See main [CONTRIBUTING.md](../../CONTRIBUTING.md).

### Design System

- Follow existing component patterns
- Use Tailwind utilities
- Maintain accessibility standards
- Document complex components

## License

MIT License - see [LICENSE](../../LICENSE)

## Support

- **Issues**: https://github.com/Itz-Agasta/axon/issues
- **Discussions**: https://github.com/Itz-Agasta/axon/discussions
- **Email**: rupam.golui@proton.me