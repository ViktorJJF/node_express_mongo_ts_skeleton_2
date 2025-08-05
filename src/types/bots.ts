import { z } from 'zod';
import {
  botSchema,
  createBotSchema,
  updateBotSchema,
} from '../schemas/bot.schema';

export type IBot = z.infer<typeof botSchema>;
export type ICreateBot = z.infer<typeof createBotSchema>;
export type IUpdateBot = z.infer<typeof updateBotSchema>;
