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

export type Bot = z.infer<typeof botSchema>;
