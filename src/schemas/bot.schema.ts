import { z } from '../lib/zod';
import { paginatedResponseSchema } from './shared.schema';

export const botSchema = z.object({
  id: z.number().int().positive().openapi({ example: 1 }),
  name: z.string().openapi({ example: 'My Awesome Bot' }),
  description: z
    .string()
    .optional()
    .openapi({ example: 'This bot is designed to do awesome thingsss.' }),
  status: z.boolean().openapi({ example: true }),
  created_at: z.date().openapi({ example: '2023-01-01T12:00:00.000Z' }),
  updated_at: z.date().openapi({ example: '2023-01-01T12:00:00.000Z' }),
});

export const createBotSchema = botSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    status: z.boolean().optional().openapi({ example: true }),
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
        { name: 'Bot 1', description: 'First bot', status: true },
        { name: 'Bot 2', description: 'Second bot', status: false },
      ],
    }),
});

export const bulkUpdateBotsSchema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().openapi({ example: '1' }),
        data: updateBotSchema,
      }),
    )
    .min(1)
    .max(100)
    .openapi({
      example: [
        { id: '1', data: { name: 'Updated Bot 1' } },
        { id: '2', data: { status: false } },
      ],
    }),
});

export const bulkDeleteBotsSchema = z.object({
  ids: z
    .array(z.string())
    .min(1)
    .max(100)
    .openapi({
      example: ['1', '2'],
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
