import { z } from '../lib/zod';
import { paginatedResponseSchema } from './shared.schema';

export enum ROLES {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export const userSchema = z.object({
  _id: z.string().openapi({ example: '60d0fe4f5311236168a109ca' }),
  email: z.string().email().openapi({ example: 'john.doe@example.com' }),
  password: z.string().openapi({ example: 'aVeryComplexPassword123!' }),
  firstName: z.string().openapi({ example: 'John' }),
  lastName: z.string().openapi({ example: 'Doe' }),
  role: z.nativeEnum(ROLES).openapi({ example: ROLES.USER }),
  isEmailVerified: z.boolean().openapi({ example: true }),
  isActive: z.boolean().openapi({ example: true }),
  createdAt: z.date().openapi({ example: '2023-01-01T12:00:00.000Z' }),
  updatedAt: z.date().openapi({ example: '2023-01-01T12:00:00.000Z' }),
});

export const createUserSchema = userSchema
  .omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    role: z.nativeEnum(ROLES).optional(),
    isEmailVerified: z.boolean().optional(),
    isActive: z.boolean().optional(),
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
