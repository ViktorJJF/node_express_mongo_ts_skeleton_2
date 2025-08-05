import { z } from '../lib/zod';
import { paginatedResponseSchema } from './shared.schema';

export const botSchema = z.object({
  _id: z.string().openapi({ example: '60d0fe4f5311236168a109cb' }),
  name: z.string().openapi({ example: 'My Awesome Bot' }),
  description: z
    .string()
    .optional()
    .openapi({ example: 'This bot is designed to do awesome thingsss.' }),
  isActive: z.boolean().openapi({ example: true }),
  createdAt: z.date().openapi({ example: '2023-01-01T12:00:00.000Z' }),
  updatedAt: z.date().openapi({ example: '2023-01-01T12:00:00.000Z' }),
});

export const createBotSchema = z.object({
  name: z.string().openapi({ example: 'My Awesome Bot' }),
  description: z
    .string()
    .optional()
    .openapi({ example: 'This bot is designed to do awesome things.' }),
  isActive: z.boolean().optional().openapi({ example: true }),
});

export const updateBotSchema = createBotSchema.partial();

export const getBotsResponseSchema = paginatedResponseSchema(botSchema);

// Bulk operation schemas
export const bulkCreateBotsSchema = z.object({
  bots: z
    .array(createBotSchema)
    .min(1)
    .max(100)
    .openapi({
      example: [
        { name: 'Bot 1', description: 'First bot', isActive: true },
        { name: 'Bot 2', description: 'Second bot', isActive: false },
      ],
    }),
});

export const bulkUpdateBotsSchema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().openapi({ example: '60d0fe4f5311236168a109cb' }),
        data: updateBotSchema,
      }),
    )
    .min(1)
    .max(100)
    .openapi({
      example: [
        { id: '60d0fe4f5311236168a109cb', data: { name: 'Updated Bot 1' } },
        { id: '60d0fe4f5311236168a109cc', data: { isActive: false } },
      ],
    }),
});

export const bulkDeleteBotsSchema = z.object({
  ids: z
    .array(z.string())
    .min(1)
    .max(100)
    .openapi({
      example: ['60d0fe4f5311236168a109cb', '60d0fe4f5311236168a109cc'],
    }),
});

// Response schemas for bulk operations
export const bulkCreateBotsResponseSchema = z.object({
  ok: z.boolean(),
  payload: z.object({
    created: z.number(),
    items: z.array(botSchema),
  }),
});

export const bulkUpdateBotsResponseSchema = z.object({
  ok: z.boolean(),
  payload: z.object({
    modified: z.number(),
    items: z.array(botSchema),
  }),
});

export const bulkDeleteBotsResponseSchema = z.object({
  ok: z.boolean(),
  payload: z.object({
    deleted: z.number(),
    items: z.array(botSchema),
  }),
});

export type Bot = z.infer<typeof botSchema>;
export type BulkCreateBots = z.infer<typeof bulkCreateBotsSchema>;
export type BulkUpdateBots = z.infer<typeof bulkUpdateBotsSchema>;
export type BulkDeleteBots = z.infer<typeof bulkDeleteBotsSchema>;
