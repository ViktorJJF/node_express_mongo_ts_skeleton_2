import { z } from 'zod';
import {
  botSchema,
  createBotSchema,
  updateBotSchema,
} from '../../schemas/bot.schema';

export type Bot = z.infer<typeof botSchema>;
export type CreateBot = z.infer<typeof createBotSchema>;
export type UpdateBot = z.infer<typeof updateBotSchema>;
