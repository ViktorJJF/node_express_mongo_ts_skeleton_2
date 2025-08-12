import { z } from '../lib/zod';
import { paginatedResponseSchema } from './shared.schema';

export enum ROLES {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  DEVELOPER = 'developer',
  AGENT = 'agent',
  OWNER = 'owner',
}

export const userSchema = z.object({
  id: z.number().int().positive().openapi({ example: 1 }),
  firstname: z.string().openapi({ example: 'John' }),
  lastname: z.string().optional().openapi({ example: 'Doe' }),
  email: z.string().email().openapi({ example: 'john.doe@example.com' }),
  password: z.string().openapi({ example: 'aVeryComplexPassword123!' }),
  role: z.nativeEnum(ROLES).openapi({ example: ROLES.USER }),
  verification: z
    .string()
    .optional()
    .openapi({ example: 'verification-token-123' }),
  verified: z.boolean().openapi({ example: true }),
  phone: z.string().optional().openapi({ example: '+1234567890' }),
  city: z.string().optional().openapi({ example: 'New York' }),
  country: z.string().optional().openapi({ example: 'USA' }),
  url_twitter: z
    .string()
    .optional()
    .openapi({ example: 'https://twitter.com/johndoe' }),
  url_github: z
    .string()
    .optional()
    .openapi({ example: 'https://github.com/johndoe' }),
  login_attempts: z.number().int().min(0).openapi({ example: 0 }),
  block_expires: z.date().nullable().openapi({ example: null }),
  status: z.boolean().openapi({ example: true }),
  created_at: z.date().openapi({ example: '2023-01-01T12:00:00.000Z' }),
  updated_at: z.date().openapi({ example: '2023-01-01T12:00:00.000Z' }),
});

export const createUserSchema = userSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    login_attempts: true,
    block_expires: true,
  })
  .extend({
    role: z.nativeEnum(ROLES).optional(),
    verified: z.boolean().optional(),
    status: z.boolean().optional(),
  });

export const updateUserSchema = createUserSchema.partial();

export const authResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  token: z.string().openapi({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  }),
  refreshToken: z.string().openapi({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  }),
  user: userSchema,
});

export const getUsersResponseSchema = paginatedResponseSchema(userSchema);

export type User = z.infer<typeof userSchema>;
