// src/lib/zod.ts
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Patch the Zod instance with the .openapi() method
extendZodWithOpenApi(z);

// Export the patched instance for the rest of your app to use
export { z };
