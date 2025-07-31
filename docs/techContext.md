# Technical Context

## Technology Stack

### Core Technologies
- **Node.js**: Runtime environment for server-side JavaScript
- **Express.js**: Web application framework for Node.js
- **TypeScript**: Typed superset of JavaScript for better development experience
- **MongoDB**: NoSQL database for data persistence
- **Mongoose**: MongoDB object modeling tool for Node.js

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
- **mongoose-paginate-v2**: Pagination plugin for Mongoose
- **Redis**: Caching layer (via expeditious-engine-redis)
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
- `npm run dev`: Development server with hot reload
- `npm run start`: Production server
- `npm run test`: Run all tests
- `npm run test:unit`: Run unit tests with Jest
- `npm run test:e2e`: Run end-to-end tests with Mocha
- `npm run tsc`: TypeScript compilation
- `npm run lint`: ESLint code linting
- `npm run prettier`: Prettier code formatting

## Architecture Patterns

### Database Layer
- **Models**: Mongoose schemas with TypeScript interfaces
- **Helpers**: Database utility functions (db.ts)
- **Pagination**: Built-in pagination support via mongoose-paginate-v2

### Service Layer
- **Business Logic**: Separated from controllers into service classes
- **Authentication Service**: Handles all auth-related operations
- **Email Service**: Manages email sending operations

### Controller Layer
- **Base Controller**: Provides common CRUD operations
- **Specialized Controllers**: Extend base controller for custom logic
- **HTTP Concerns**: Focused on request/response handling

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
