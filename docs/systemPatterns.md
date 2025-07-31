# System Patterns

## Architecture Overview

### Layered Architecture
The application follows a clean layered architecture with clear separation of concerns:

1. **Route Layer**: HTTP routing and middleware
2. **Controller Layer**: Request/response handling
3. **Service Layer**: Business logic and data processing
4. **Model Layer**: Database schema and data access
5. **Helper Layer**: Utility functions and common operations

## Key Design Patterns

### 1. Base Class Pattern
**Purpose**: Eliminate code duplication and provide common functionality

**Implementation**:
- `BaseController`: Provides standard CRUD operations
- `BaseRouter`: Generates standard REST routes automatically
- `BaseValidation`: Common validation rules

**Benefits**:
- Reduces boilerplate code
- Ensures consistency across resources
- Easy to extend and customize

### 2. Service Layer Pattern
**Purpose**: Separate business logic from HTTP concerns

**Implementation**:
- `AuthService`: Handles all authentication-related operations
- Controllers delegate business logic to services
- Services handle database operations and business rules

**Benefits**:
- Controllers remain lean and focused
- Business logic is reusable and testable
- Clear separation of concerns

### 3. Repository Pattern (via Helpers)
**Purpose**: Abstract database operations

**Implementation**:
- `db.ts`: Centralized database helper functions
- Consistent error handling and response formatting
- Pagination and filtering support

**Benefits**:
- Consistent database access patterns
- Centralized error handling
- Easy to modify database logic

## Database Patterns

### 1. Mongoose Schema Design
```typescript
// Standard schema structure
const Schema = new mongoose.Schema({
  // Fields with validation
  field: {
    type: String,
    required: true,
    validate: { validator: function, message: 'Error message' }
  }
}, {
  timestamps: true,  // Automatic createdAt/updatedAt
  versionKey: false  // Disable __v field
});
```

### 2. Pagination Pattern
```typescript
// Standard pagination implementation
const options = {
  page: parseInt(req.query.page) || 1,
  limit: parseInt(req.query.limit) || 10,
  sort: { createdAt: -1 }
};
const result = await model.paginate(query, options);
```

### 3. Error Handling Pattern
```typescript
// Consistent error handling
try {
  const result = await operation();
  return result;
} catch (error) {
  throw buildErrObject(422, error.message);
}
```

## Authentication Patterns

### 1. JWT Token Management
- Tokens are encrypted before storage
- Automatic token refresh mechanism
- Role-based access control

### 2. Password Security
- bcrypt hashing with salt rounds
- Login attempt tracking
- Account blocking after failed attempts

### 3. Email Verification
- UUID-based verification tokens
- Automatic email sending
- Verification status tracking

## API Design Patterns

### 1. RESTful Endpoints
```
GET    /api/resource      # List with pagination
GET    /api/resource/all  # List all
GET    /api/resource/:id  # Get single item
POST   /api/resource      # Create new item
PUT    /api/resource/:id  # Update item
DELETE /api/resource/:id  # Delete item
```

### 2. Response Format
```typescript
// Success response
{
  "ok": true,
  "payload": data,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}

// Error response
{
  "errors": {
    "msg": "Error message"
  }
}
```

### 3. Query Parameters
- `page`: Page number for pagination
- `limit`: Items per page
- `sort`: Sort field
- `order`: Sort order (asc/desc)
- `filter`: Search term
- `fields`: Fields to search in

## Middleware Patterns

### 1. Authentication Middleware
```typescript
const requireAuth = passport.authenticate('jwt', { session: false });
const roleAuth = AuthController.roleAuthorization(['admin', 'user']);
```

### 2. Validation Middleware
```typescript
const validation = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validationResultMiddleware
];
```

### 3. Error Handling Middleware
```typescript
// Global error handler
app.use((error, req, res, next) => {
  utils.handleError(res, error);
});
```

## Testing Patterns

### 1. Unit Testing
- Jest framework for unit tests
- Mock database operations
- Test business logic in isolation

### 2. Integration Testing
- Mocha framework for e2e tests
- Test complete API endpoints
- Database state verification

### 3. Test Organization
```
test/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── fixtures/       # Test data
```

## Code Quality Patterns

### 1. TypeScript Usage
- Strict type checking enabled
- Interface definitions for all data structures
- Generic types for reusable components

### 2. Error Handling
- Consistent error objects
- Proper HTTP status codes
- Detailed error messages for debugging

### 3. Logging
- Structured logging with different levels
- Request/response logging
- Error logging with stack traces

## Performance Patterns

### 1. Caching
- Redis-based request caching
- Database query result caching
- Static asset caching

### 2. Database Optimization
- Indexed fields for common queries
- Pagination to limit result sets
- Lean queries for read operations

### 3. Response Optimization
- Response compression
- JSON response optimization
- Proper HTTP headers
