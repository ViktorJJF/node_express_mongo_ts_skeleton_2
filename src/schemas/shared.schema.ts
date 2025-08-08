import { z } from '../lib/zod';

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

// UUID or cuid-like id support (Prisma default uses cuid)
export const idSchema = z
  .string()
  .min(1, { message: 'Invalid id format' });
