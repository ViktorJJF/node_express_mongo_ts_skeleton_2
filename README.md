# Node Express MongoDB JWT REST API Skeleton

A comprehensive REST API skeleton with authentication, authorization, and MongoDB integration.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **MongoDB Integration**: Mongoose ODM with advanced features
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
- MongoDB
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

# Start development server
pnpm run dev
```

## API Documentation

The API documentation is automatically generated using swagger-autogen and is available at:

- **Swagger UI**: http://localhost:3000/docs
- **API Base URL**: http://localhost:3000/api

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

# Database
pnpm run fresh        # Clean and seed database
pnpm run clean        # Clean database
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
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm run test`
5. Update documentation: `pnpm run swagger`
6. Submit a pull request

## License

MIT License
