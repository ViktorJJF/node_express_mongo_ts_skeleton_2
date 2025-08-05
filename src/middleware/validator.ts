import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate =
  (schema: z.ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(422).json({
          success: false,
          errors: errorMessages,
        });
      }
      return next(error);
    }
  };
