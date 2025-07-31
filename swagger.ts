#!/usr/bin/env ts-node

import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

import swaggerAutogen from 'swagger-autogen';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import * as fs from 'fs';
import * as path from 'path';

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
  endpointsFiles?: string[];
  schemasDir: string;
  routesDir: string;
}

const registry = new OpenAPIRegistry();

// Function to automatically register all schemas from a module
function registerSchemasFromModule(module: any, prefix: string = ''): number {
  let registeredCount = 0;

  Object.entries(module).forEach(([name, schema]) => {
    // Only register Zod schemas
    if (schema && typeof schema === 'object' && '_def' in schema) {
      const schemaName = prefix ? `${prefix}${name}` : name;
      try {
        registry.register(schemaName, schema as z.ZodType);
        registeredCount++;
      } catch (error) {
        console.warn(`Failed to register schema ${schemaName}:`, error);
      }
    }
  });

  return registeredCount;
}

// Function to automatically discover and register all schemas
async function registerAllSchemas(schemasDir: string): Promise<number> {
  try {
    if (!fs.existsSync(schemasDir)) {
      console.error(`Schemas directory does not exist: ${schemasDir}`);
      return 0;
    }

    const schemaFiles = fs
      .readdirSync(schemasDir)
      .filter(
        (file) => file.endsWith('.schema.ts') || file.endsWith('.schema.js'),
      )
      .map((file) => file.replace(/\.(ts|js)$/, ''));

    if (schemaFiles.length === 0) {
      console.warn(`No schema files found in ${schemasDir}`);
      return 0;
    }

    let totalRegistered = 0;

    for (const schemaFile of schemaFiles) {
      try {
        const modulePath = path.join(schemasDir, schemaFile);
        const module = await import(modulePath);

        // Use the filename as prefix (capitalized)
        const prefix = schemaFile
          .replace('.schema', '')
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');

        const registeredCount = registerSchemasFromModule(module, prefix);
        totalRegistered += registeredCount;
        console.log(
          `Registered ${registeredCount} schemas/parameters from ${schemaFile}`,
        );
      } catch (error) {
        console.warn(`Failed to import schema file ${schemaFile}:`, error);
      }
    }

    console.log(`Total schemas registered: ${totalRegistered}`);
    return totalRegistered;
  } catch (error) {
    console.error('Error reading schemas directory:', error);
    return 0;
  }
}

// Function to automatically discover endpoint files
async function discoverEndpointFiles(routesDir: string): Promise<string[]> {
  try {
    if (!fs.existsSync(routesDir)) {
      console.warn(`Routes directory ${routesDir} does not exist`);
      return [];
    }

    const routeFiles = fs
      .readdirSync(routesDir)
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
      .filter(
        (file) =>
          file !== 'index.ts' && file !== 'index.js' && !file.startsWith('.'),
      )
      .map((file) => path.join(routesDir, file));

    if (routeFiles.length === 0) {
      console.warn(`No route files found in ${routesDir}`);
      return [];
    }

    console.log(`Discovered ${routeFiles.length} endpoint files:`, routeFiles);
    return routeFiles;
  } catch (error) {
    console.error('Error reading routes directory:', error);
    return [];
  }
}

// Main function to generate swagger documentation
async function generateSwagger(config: SwaggerConfig): Promise<void> {
  console.log('Starting Swagger documentation generation...');

  // Register all schemas automatically
  const totalRegistered = await registerAllSchemas(config.schemasDir);

  if (totalRegistered === 0) {
    console.warn(
      'No schemas were registered. This may be expected if you only have parameters.',
    );
  }

  const generator = new OpenApiGeneratorV31(registry.definitions);
  const generatedComponents = generator.generateComponents();

  const doc = {
    info: {
      title: config.title,
      description: config.description,
      version: config.version,
      contact: config.contact,
    },
    openapi: '3.1.0',
    servers: config.servers,
    components: {
      schemas: generatedComponents.components?.schemas,
      parameters: generatedComponents.components?.parameters,
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  };

  // Ensure output directory exists
  const outputDir = path.dirname(config.outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generating Swagger documentation to ${config.outputFile}...`);

  // Auto-discover endpoint files
  const endpointsFiles = await discoverEndpointFiles(config.routesDir);

  try {
    await swaggerAutogen({ openapi: '3.1.0' })(
      config.outputFile,
      endpointsFiles,
      doc,
    );
    console.log('Swagger documentation generated successfully!');
  } catch (error) {
    console.error('Failed to generate Swagger documentation:', error);
    process.exit(1);
  }
}

// Default configuration
const defaultConfig: SwaggerConfig = {
  title: 'Node Express MongoDB JWT REST API Skeleton',
  description:
    'A comprehensive REST API skeleton with authentication, authorization, and MongoDB integration',
  version: '9.0.5',
  contact: {
    name: 'API Support',
    email: 'support@example.com',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  outputFile: './swagger.json',
  endpointsFiles: [], // Auto-discovered from routesDir
  schemasDir: path.join(__dirname, './src/schemas'),
  routesDir: path.join(__dirname, './src/routes/api'),
};

// Run the generator
generateSwagger(defaultConfig).catch((error) => {
  console.error('Failed to generate Swagger documentation:', error);
  process.exit(1);
});
