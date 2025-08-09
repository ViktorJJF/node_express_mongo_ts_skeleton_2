# Technical Context

## Technology Stack

### Core Technologies
- **Node.js**: Runtime environment for server-side JavaScript
- **Express.js**: Web application framework for Node.js
- **TypeScript**: Typed superset of JavaScript for better development experience
- **PostgreSQL**: Relational database
- **Drizzle ORM**: Type-safe SQL builder and migration tooling

### Authentication & Security
- **JWT (jsonwebtoken)**: Token-based authentication
- **Passport.js**: Authentication middleware
- **bcrypt**: Password hashing and comparison
- **Helmet**: Security headers middleware
- **CORS**: Cross-origin resource sharing

### Development Tools
- **ts-node**: TypeScript execution engine
- **ts-node-dev**: Development server with hot reload
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatter
- **Jest**: Unit testing framework
- **Mocha**: End-to-end testing framework
- **NYC**: Code coverage reporting

### Database & Caching
- **Drizzle ORM**: Schema-first approach with `pg` driver
- **Drizzle Kit**: Migrations: `db:generate`, `db:migrate`, `db:push`
- **Redis**: Optional caching layer (via expeditious-engine-redis)
- **express-expeditious**: Request caching middleware

### Email & Communication
- **Nodemailer**: Email sending library
- **Mailgun**: Email service provider integration

### Validation & Sanitization
- **express-validator**: Input validation and sanitization
- **trim-request**: Request body trimming middleware

### Utilities
- **date-fns**: Date manipulation library
- **uuid**: Unique identifier generation
- **request-ip**: Client IP address extraction
- **compression**: Response compression middleware
- **morgan**: HTTP request logger

## Development Setup

### Environment Variables
```env
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION_IN_MINUTES=60
EMAIL_SMTP_API_MAILGUN=your_mailgun_api_key
EMAIL_SMTP_DOMAIN_MAILGUN=your_mailgun_domain
EMAIL_FROM_NAME=Your App Name
EMAIL_FROM_ADDRESS=noreply@yourapp.com
FRONTEND_URL=http://localhost:3000
```

### Package Management
- **pnpm**: Fast, disk space efficient package manager
- **Lock file**: pnpm-lock.yaml for reproducible builds

### Scripts
- `pnpm dev`: Development server with hot reload
- `pnpm start`: Production server
- `pnpm test`, `pnpm test:unit`, `pnpm test:e2e`
- `pnpm tsc`, `pnpm lint`, `pnpm prettier`
- `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:push`, `pnpm db:drop`, `pnpm db:studio`

## Architecture Patterns

### Database Layer
- **Schemas**: Drizzle `pgTable` definitions in `src/schemas/database/*`
- **Helpers**: Database utility functions in `src/helpers/db.ts` (pagination, filtering, CRUD)
- **IDs**: Auto-incrementing integers (`serial`) by default

### Service Layer
- **Business Logic**: Separated from controllers into service classes
- **Authentication Service**: Handles all auth-related operations
- **Email Service**: Manages email sending operations

### Controller Layer
- Controllers call `db.ts` helpers with Drizzle tables
- HTTP concerns only; business logic lives in services when needed (e.g., `auth.service.ts`)

### Route Layer
- **Base Router**: Automatic CRUD route generation
- **Middleware**: Authentication, validation, and error handling
- **Modular Structure**: Each resource has its own route file

## Code Organization

### Directory Structure
```
src/
├── config/          # Configuration files
├── controllers/     # HTTP request handlers
├── helpers/         # Utility functions
├── locales/         # Internationalization
├── models/          # Database models
├── routes/          # Route definitions
├── services/        # Business logic
└── index.ts         # Application entry point
```

### Type Definitions
- All interfaces and types are defined in separate files
- Strict typing throughout the application
- Mongoose models with TypeScript interfaces
