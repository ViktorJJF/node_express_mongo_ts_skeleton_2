import { z } from 'zod';
import {
  botSchema,
  createBotSchema,
  updateBotSchema,
  bulkCreateBotsSchema,
  bulkUpdateBotsSchema,
  bulkDeleteBotsSchema,
} from '../../schemas/bot.schema';

export type IBot = z.infer<typeof botSchema>;
export type ICreateBot = z.infer<typeof createBotSchema>;
export type IUpdateBot = z.infer<typeof updateBotSchema>;
export type IBulkCreateBots = z.infer<typeof bulkCreateBotsSchema>;
export type IBulkUpdateBots = z.infer<typeof bulkUpdateBotsSchema>;
export type IBulkDeleteBots = z.infer<typeof bulkDeleteBotsSchema>;

// responses interfaces

export type ICreateBotResponse = IApiResponseIBot
