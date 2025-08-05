# API Versioning Structure

This directory contains the versioned API routes for the application.

## Structure

```
src/routes/api/
├── index.ts          # Main API router that handles versioning
├── v1/               # API version 1 (current stable version)
│   ├── index.ts      # v1 router
│   ├── auth.ts       # Authentication routes
│   ├── bots.ts       # Bot management routes
│   ├── users.ts      # User management routes
│   └── test-error.ts # Error testing routes
└── v2/               # API version 2 (future version)
    ├── index.ts      # v2 router
    └── example.ts    # Example v2 route
```

## URL Structure

- **v1 (default)**: `/api/*` - All v1 routes are accessible without version prefix
- **v1 (explicit)**: `/api/v1/*` - Explicit v1 routes
- **v2**: `/api/v2/*` - v2 routes

## Adding New Versions

1. Create a new version directory (e.g., `v3/`)
2. Create an `index.ts` file in the new version directory
3. Add the version to the `versions` array in `src/routes/api/index.ts`
4. Add your route files to the new version directory

## Migration Strategy

- **v1**: Current stable API - all existing routes
- **v2**: Future API version - for breaking changes
- When introducing breaking changes, create them in v2 while maintaining v1 for backward compatibility

## Example Usage

```bash
# v1 routes (default)
GET /api/auth/login
GET /api/users
GET /api/bots

# v1 routes (explicit)
GET /api/v1/auth/login
GET /api/v1/users
GET /api/v1/bots

# v2 routes
GET /api/v2/example
```

## Best Practices

1. **Backward Compatibility**: Always maintain backward compatibility when possible
2. **Version Deprecation**: Clearly document when versions will be deprecated
3. **Breaking Changes**: Use new versions for breaking changes
4. **Documentation**: Keep each version's documentation up to date
5. **Testing**: Test all versions thoroughly before deployment 