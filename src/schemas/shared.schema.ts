import { z } from '../lib/zod';
import mongoose from 'mongoose';

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    ok: z.boolean(),
    totalDocs: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    page: z.number(),
    pagingCounter: z.number(),
    hasPrevPage: z.boolean(),
    hasNextPage: z.boolean(),
    prevPage: z.number().nullable(),
    nextPage: z.number().nullable(),
    payload: z.array(itemSchema),
  });

export const errorResponseSchema = z.object({
  success: z.boolean(),
  errors: z.object({
    msg: z.string(),
  }),
});

export const validationErrorSchema = z.object({
  success: z.boolean(),
  errors: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    }),
  ),
});

export const idSchema = z.string().refine((val) => {
  return mongoose.Types.ObjectId.isValid(val);
}, {
  message: 'Invalid ObjectId format'
});
