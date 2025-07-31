# Automatic Schema Registration for Swagger Documentation

## Overview

The enhanced swagger generator automatically discovers and registers all Zod schemas from your `src/schemas/` directory, eliminating the need to manually register each schema in the swagger configuration.

## How It Works

### 1. Schema Discovery
The generator scans the `src/schemas/` directory for files ending with `.schema.ts` or `.schema.js`.

### 2. Automatic Registration
For each schema file found, it:
- Imports the module dynamically
- Identifies all exported Zod schemas (objects with `_def` property)
- Registers them with meaningful names based on the file structure
- Provides detailed logging of the registration process

### 3. Schema Naming Convention
Schemas are named using the pattern: `{FilePrefix}{SchemaName}`

**Examples:**
- `bot.schema.ts` → `Bot{SchemaName}`
- `user.schema.ts` → `User{SchemaName}`
- `shared.schema.ts` → `Shared{SchemaName}`

## Usage

### Basic Usage
```bash
# Generate swagger documentation with automatic schema registration
pnpm run swagger:generate
```

### Expected Output
```
Starting Swagger documentation generation...
Registered 4 schemas from bot.schema
Registered 2 schemas from shared.schema
Registered 5 schemas from user.schema
Total schemas registered: 11
Generating Swagger documentation to ./swagger-output.json...
Swagger documentation generated successfully!
```

## Adding New Schemas

### 1. Create a New Schema File
Create a new file in `src/schemas/` with the `.schema.ts` extension:

```typescript
// src/schemas/product.schema.ts
import { z } from '../lib/zod';

export const productSchema = z.object({
  _id: z.string(),
  name: z.string(),
  price: z.number(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProductSchema = productSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = createProductSchema.partial();
```

### 2. Generate Documentation
The new schemas will be automatically discovered and registered:

```bash
pnpm run swagger:generate
```

**Output:**
```
Starting Swagger documentation generation...
Registered 4 schemas from bot.schema
Registered 2 schemas from shared.schema
Registered 5 schemas from user.schema
Registered 3 schemas from product.schema
Total schemas registered: 14
Generating Swagger documentation to ./swagger-output.json...
Swagger documentation generated successfully!
```

## Schema Registration Rules

### What Gets Registered
- All exported objects that have a `_def` property (Zod schemas)
- Schemas must be valid Zod types
- Only direct exports are registered (not nested objects)

### What Doesn't Get Registered
- Non-Zod objects (functions, strings, numbers, etc.)
- Type definitions (`export type`)
- Enums (`export enum`)
- Constants that aren't Zod schemas

## Error Handling

The generator handles errors gracefully:

- **Import Errors**: If a schema file can't be imported, it logs a warning and continues
- **Registration Errors**: If a schema fails to register, it logs a warning and continues
- **Missing Directory**: If the schemas directory doesn't exist, it logs an error and exits
- **No Schemas**: If no schemas are registered, it exits with an error

## Configuration

The generator uses a configuration object that can be customized:

```typescript
interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  contact: {
    name: string;
    email: string;
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
  outputFile: string;
  endpointsFiles: string[];
  schemasDir: string;
}
```

## Benefits

1. **Reduced Maintenance**: No need to manually register schemas
2. **Automatic Discovery**: New schemas are automatically included
3. **Consistent Naming**: Schema names follow a predictable pattern
4. **Detailed Logging**: Clear feedback on what was registered
5. **Error Resilience**: Continues processing even if some schemas fail
6. **Type Safety**: Full TypeScript support with proper typing

## Migration from Manual Registration

If you're migrating from manual schema registration:

1. **Remove Manual Imports**: Delete individual schema imports
2. **Remove Manual Registration**: Delete `registry.register()` calls
3. **Use New Script**: Switch to `pnpm run swagger:generate`
4. **Verify Output**: Check that all schemas are properly registered

## Troubleshooting

### No Schemas Registered
- Check that schema files end with `.schema.ts`
- Verify schemas are properly exported
- Ensure schemas are valid Zod types

### Import Errors
- Check file paths and imports
- Verify TypeScript compilation
- Check for circular dependencies

### Registration Errors
- Verify schema structure
- Check for naming conflicts
- Ensure schemas are valid Zod types
