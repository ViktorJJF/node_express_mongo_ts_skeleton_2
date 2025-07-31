import { z } from 'zod';
import {
  userSchema,
  createUserSchema,
  updateUserSchema,
} from '../../schemas/user.schema';

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
