# Node + Express + TypeScript REST API Skeleton

A production-ready REST API skeleton with authentication, authorization, PostgreSQL, and Drizzle ORM.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **PostgreSQL + Drizzle ORM**: Type-safe SQL with schema-first migrations
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **TypeScript**: Full TypeScript support
- **Testing**: Jest and Mocha test suites
- **Code Quality**: ESLint, Prettier, and Husky pre-commit hooks
- **Internationalization**: i18n support
- **Logging**: Winston logger with Google Cloud integration
- **Health Checks**: Comprehensive health monitoring
- **Docker Support**: Containerized deployment

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL 12+ (or Docker)
- pnpm (recommended package manager)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd node_express_mongo_ts_skeleton

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# (Optional) Start PostgreSQL with Docker
docker run -d \
  --name postgres-db \
  -e POSTGRES_DB=myapp \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15

# Update DATABASE_URL accordingly in .env

# Create database schema
pnpm db:push  # or pnpm db:migrate if using migrations folder

# Start development server
pnpm run dev
```

## API Documentation

The API documentation is automatically generated using swagger-autogen and is available at:

- **Swagger UI**: http://localhost:3333/docs
- **API Base URL**: http://localhost:3333/api

### Generating Documentation

To regenerate the API documentation:

```bash
# Using the original script
pnpm run swagger

# Using the enhanced generator with automatic schema registration
pnpm run swagger:generate
```

The enhanced generator (`swagger:generate`) automatically discovers and registers all Zod schemas from the `src/schemas/` directory, eliminating the need to manually register each schema.

#### Automatic Schema Registration

The new swagger generator automatically:

- **Discovers Schema Files**: Scans all `.schema.ts` files in `src/schemas/`
- **Registers Zod Schemas**: Automatically registers all exported Zod schemas
- **Generates Schema Names**: Creates meaningful schema names based on file structure
- **Provides Detailed Logging**: Shows which schemas were registered from each file
- **Handles Errors Gracefully**: Continues processing even if some schemas fail to register

**Example Output:**
```
Starting Swagger documentation generation...
Registered 4 schemas from bot.schema
Registered 2 schemas from shared.schema
Registered 5 schemas from user.schema
Total schemas registered: 11
Generating Swagger documentation to ./swagger-output.json...
Swagger documentation generated successfully!
```

### Documentation Features

- **Authentication**: Bearer token authentication
- **Request/Response Examples**: Detailed examples for all endpoints
- **Error Responses**: Comprehensive error documentation
- **Schema Definitions**: Reusable data models
- **Tags**: Organized by functionality (Authentication, Users, Bots)

## Available Scripts

```bash
# Development
pnpm run dev          # Start development server with hot reload
pnpm run start        # Start production server

# Testing
pnpm run test         # Run all tests
pnpm run test:unit    # Run unit tests only
pnpm run test:e2e     # Run end-to-end tests only

# Code Quality
pnpm run lint         # Run ESLint
pnpm run prettier     # Check code formatting
pnpm run prettier:fix # Fix code formatting

# Documentation
pnpm run swagger      # Generate API documentation (original)
pnpm run swagger:generate # Generate API documentation (enhanced with auto schema registration)

# Database (Drizzle)
pnpm db:generate     # Generate migrations from schema
pnpm db:migrate      # Apply migrations from drizzle/migrations
pnpm db:push         # Push current schema directly to DB (safe for dev)
pnpm db:drop         # Drop database objects (use with care)
pnpm db:studio       # Open Drizzle Studio
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/verify` - Verify email
- `POST /api/forgot` - Request password reset
- `POST /api/reset` - Reset password
- `GET /api/token` - Get new refresh token
- `GET /api/me` - Get current user profile

### Users (Admin Only)
- `GET /api/users/all` - Get all users (public)
- `GET /api/users` - Get users (admin)
- `POST /api/users` - Create user (admin)
- `GET /api/users/:id` - Get user by ID (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Bots
- `GET /api/bots` - Get all bots
- `GET /api/bots/:id` - Get bot by ID
- `POST /api/bots` - Create new bot (admin)
- `PUT /api/bots/:id` - Update bot (admin)
- `DELETE /api/bots/:id` - Delete bot (admin)

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://postgres:123456@localhost:5432/myapp
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION_IN_MINUTES=60
EMAIL_SMTP_API_MAILGUN=
EMAIL_SMTP_DOMAIN_MAILGUN=
EMAIL_FROM_NAME=MyApp
EMAIL_FROM_ADDRESS=noreply@myapp.com
FRONTEND_URL=http://localhost:3000
```

## Architecture Overview

The project follows a layered architecture and emphasizes DRY and SRP principles:

- Routes → Controllers (HTTP only)
- Services (business rules) where needed (e.g., auth)
- Database access via `db.ts` helpers + Drizzle schemas (no model classes)
- Types inferred from Drizzle schemas

Key decisions:
- IDs are auto-increment integers (`serial`) for simplicity in a skeleton
- Drizzle schemas live in `src/schemas/database/*`
- Shared database helpers in `src/helpers/db.ts` implement pagination, filters, and CRUD

## Working with Drizzle ORM

### Where are schemas?
- `src/schemas/database/*` exports the table definitions, e.g., `users`, `bots`, etc.
- Each schema also exposes types via `$inferSelect` and `$inferInsert`.

### CRUD in controllers/services
Use the table + `db.ts` helpers:

```ts
import { users } from '@/schemas/database';
import { createItem, getItem, updateItem, deleteItem, listItemsPaginated } from '@/helpers/db';

// Create
const created = await createItem<typeof users, any>({ firstName: 'A' }, users);

// Read (list with pagination)
const list = await listItemsPaginated<typeof users, any>(req, users);

// Read (one)
const user = await getItem<typeof users, any>(1, users);

// Update
const updated = await updateItem<typeof users, any>(1, users, { firstName: 'B' });

// Delete
const removed = await deleteItem<typeof users, any>(1, users);
```

### Migrations
- Generate from schema: `pnpm db:generate`
- Apply: `pnpm db:migrate`
- Or push directly from current schema (dev): `pnpm db:push`

## How to add a new entity (example: Chats)

1) Define schema: `src/schemas/database/chats.ts`

```ts
import { pgTable, serial, varchar, boolean, timestamp, text, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').default(sql`now()`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`now()`).notNull(),
});

export type Chat = typeof chats.$inferSelect;    // Read
export type NewChat = typeof chats.$inferInsert; // Create
```

2) Export from `src/schemas/database/index.ts`:

```ts
export * from './chats';
```

3) Create migration:

```bash
pnpm db:generate   # then pnpm db:migrate
# or for quick dev iterations:
pnpm db:push
```

4) Use in controller/service via helpers:

```ts
import { chats } from '@/schemas/database';
import { createItem, listItemsPaginated, getItem, updateItem, deleteItem } from '@/helpers/db';

// list
const list = await listItemsPaginated<typeof chats, any>(req, chats);

// create
const created = await createItem<typeof chats, any>({ title: 'General' }, chats);

// read one
const chat = await getItem<typeof chats, any>(1, chats);

// update
const updated = await updateItem<typeof chats, any>(1, chats, { isArchived: true });

// delete
await deleteItem<typeof chats, any>(1, chats);
```

5) Add routes and validation as usual under `src/routes/api/v1/*` and any Zod schemas under `src/schemas`.

## Notes
- ID validation uses numeric IDs. See `isIDGood` in `src/helpers/utils.ts`.
- Prefer `db:push` for local development, `db:generate` + `db:migrate` for team workflows/CI.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm run test`
5. Update documentation: `pnpm run swagger`
6. Submit a pull request

## License

MIT License
