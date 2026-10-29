# CRM Platform

A full-stack Customer Relationship Management (CRM) application built with **Next.js 16 (App Router)**, **Prisma ORM**, **Neon PostgreSQL**, and **NextAuth v5**.

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.2.6 (App Router, React 19, TypeScript) |
| **Database** | PostgreSQL (Neon serverless) via Prisma 7.8 |
| **Authentication** | NextAuth v5 (beta) with Credentials provider, Argon2 password hashing |
| **Styling** | Tailwind CSS v4 with custom theme, Radix UI primitives |
| **Forms & Validation** | React Hook Form + Zod v4 |
| **Tables & Data** | TanStack React Table v8 |
| **Drag & Drop** | @dnd-kit for Kanban board |
| **Import/Export** | PapaParse for CSV processing |
| **Analytics** | Vercel Analytics + Speed Insights |
| **Package Manager** | pnpm |
| **Testing** | Jest (unit), Playwright (e2e) - configured, tests pending |
| **Linting** | ESLint + Prettier with strict rules |

## Features

- **Dashboard** - Overview metrics, recent activity, pipeline value
- **Contacts Management** - People and Organizations with emails, phones, notes, labels
- **Deals Pipeline** - Kanban board with drag-and-drop, stages, priorities, values
- **Activities** - Tasks, meetings, calls, deadlines with date ranges
- **Data Import** - Pipedrive CSV import with validation, progress tracking, rollback support
- **Role-based Access** - Admin, Manager, User roles
- **Soft Deletes** - All entities support soft deletion with `deletedAt`
- **Audit Trail** - Created/updated by tracking on all models

## Project Structure

```text
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Public auth pages (sign-in, register)
│   ├── (protected)/       # Protected routes requiring authentication
│   │   ├── dashboard/     # Dashboard with metrics
│   │   ├── contacts/      # People & Organizations
│   │   ├── deals/         # Deals pipeline (Kanban)
│   │   ├── activities/    # Activities calendar/list
│   │   ├── import/        # CSV import wizard
│   │   └── user/          # User settings
│   └── api/               # API routes (auth, import)
├── components/            # Shared UI components
│   ├── ui/               # Radix-based primitives (Button, Card, Table, etc.)
│   ├── sidebar/          # App sidebar navigation
│   ├── form/             # Form components
│   └── table/            # Table components with loading states
├── features/             # Feature-based modules (domain-driven)
│   ├── activity/         # Activity CRUD, validation, import
│   ├── auth/             # Auth components
│   ├── deal/             # Deal CRUD, pipeline stages, Kanban
│   ├── import/           # Import wizard, validation, orchestration
│   ├── kanban-board/     # Reusable Kanban board component
│   ├── organization/     # Organization CRUD, import
│   ├── person/           # Person CRUD, import
│   ├── priority-level/   # Priority utilities
│   ├── shared/           # Shared actions, utilities, import orchestration
│   └── user/             # User management
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities (Prisma client)
├── types/                # TypeScript type definitions
└── generated/            # Prisma generated client
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database (Neon recommended)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd CRM

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local  # Create from template
# Edit .env.local with your DATABASE_URL and NEXTAUTH_SECRET

# Set up database
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed initial data (optional)

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon/PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT encryption | Yes |
| `NEXTAUTH_URL` | Canonical URL (production) | Production only |

## Database Commands

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations in development
pnpm db:migrate

# Deploy migrations (production/CI)
pnpm db:deploy

# Open Prisma Studio
pnpm db:studio

# Reset database (⚠️ destructive)
pnpm db:reset

# Seed database
pnpm db:seed
```

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format Prisma schema
pnpm db:format
```

## Branching & Commits

- **Branches**: `feature/*`, `bugfix/*`, `hotfix/*`, `chore/*`, `release/*`
- **Commits**: [Conventional Commits](docs/commit-guidelines.md) format
- **PR Target**: `staging` branch for review, `main` for production

See [Branching Strategy](docs/branching.md) and [Commit Guidelines](docs/commit-guidelines.md) for details.

## Deployment

- **Vercel** (recommended): Connect repository for automatic preview/production deployments
- **Preview**: Auto-deployed on `staging` branch
- **Production**: Auto-deployed on `main` branch
- **Build Command**: `pnpm vercel-build` (runs Prisma generate + migrate + Next.js build)

## Architecture Notes

- **Server Components First**: Pages use RSC by default; client components marked with `'use client'`
- **Server Actions**: Mutations use Next.js Server Actions with Zod validation
- **Action Pipeline**: Shared `actionPipeline` wrapper for auth, validation, error handling
- **Import System**: Async pipeline with progress tracking via `ImportSession` model
- **Soft Deletes**: All entities use `deletedAt` timestamp; queries filter by default
- **Optimistic UI**: TanStack Table + Server Actions for responsive data grids

## Contributing

See [Contributing Guide](docs/contributing.md) for coding standards and PR process.

## License

MIT License - see [LICENSE](LICENSE) for details.
