import { z } from 'zod';
import { idSchema } from './shared.schema';

export const registerSchema = z.object({
  first_name: z.string().min(1, 'IS_EMPTY'),
  last_name: z.string().min(1, 'IS_EMPTY'),
  email: z.string().email('EMAIL_IS_NOT_VALID'),
  password: z.string().min(5, 'PASSWORD_TOO_SHORT_MIN_5'),
});

export const loginSchema = z.object({
  email: z.string().email('EMAIL_IS_NOT_VALID'),
  password: z.string().min(1, 'IS_EMPTY'),
});

export const verifySchema = z.object({
  id: idSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('EMAIL_IS_NOT_VALID'),
});

export const resetPasswordSchema = z.object({
  id: idSchema,
  password: z.string().min(5, 'PASSWORD_TOO_SHORT_MIN_5'),
});
