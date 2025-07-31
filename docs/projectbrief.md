# Project Brief: Node.js Express MongoDB TypeScript Skeleton

## Project Overview
A modern, scalable REST API skeleton built with Node.js, Express, MongoDB, and TypeScript. This project serves as a foundation for building production-ready APIs with authentication, authorization, and comprehensive CRUD operations.

## Core Requirements

### Technical Stack
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **Authentication**: JWT-based authentication
- **Validation**: Express-validator
- **Testing**: Jest for unit tests, Mocha for e2e tests
- **Documentation**: JSDoc comments throughout codebase

### Architecture Goals
- **Modular Design**: Clean separation of concerns with controllers, services, and models
- **Scalability**: Easy to extend and maintain as the application grows
- **Type Safety**: Full TypeScript implementation with proper type definitions
- **Modern Patterns**: Async/await throughout, no callback-based code
- **Consistency**: Standardized patterns across all modules

### Key Features
- User authentication and authorization system
- Role-based access control (user, admin, SUPERADMIN)
- Email verification system
- Password reset functionality
- CRUD operations with pagination
- Input validation and sanitization
- Error handling middleware
- Internationalization support
- Rate limiting and security headers

### Code Quality Standards
- **DRY Principle**: No code duplication
- **Single Responsibility**: Each function/class has one clear purpose
- **Clean Architecture**: Separation of business logic from HTTP concerns
- **Comprehensive Testing**: Unit and integration tests for all functionality
- **Documentation**: Clear comments and JSDoc for all public APIs

## Success Criteria
- All database operations use async/await (no callbacks)
- Controllers are lean and focused on HTTP concerns
- Business logic is properly separated into services
- Routes are clean and maintainable
- Code is easily testable and extensible
- Performance is optimized for production use
