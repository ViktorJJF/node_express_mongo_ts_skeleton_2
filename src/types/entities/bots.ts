import { z } from 'zod';
import {
  botSchema,
  createBotSchema,
  updateBotSchema,
  bulkCreateBotsSchema,
  bulkUpdateBotsSchema,
  bulkDeleteBotsSchema,
} from '../../schemas/bot.schema';
import { IPaginatedResponse } from '../api/pagination';
import { IApiResponse } from '../api/response';

export type IBot = z.infer<typeof botSchema>;
export type ICreateBot = z.infer<typeof createBotSchema>;
export type IUpdateBot = z.infer<typeof updateBotSchema>;
export type IBulkCreateBots = z.infer<typeof bulkCreateBotsSchema>;
export type IBulkUpdateBots = z.infer<typeof bulkUpdateBotsSchema>;
export type IBulkDeleteBots = z.infer<typeof bulkDeleteBotsSchema>;

// responses interfaces

// API Response interfaces
export type IBotListResponse = IPaginatedResponse<IBot>;
export type IBotResponse = IApiResponse<IBot>;

export type IListBotsResponse = IPaginatedResponse<IBot>;
export type IListOneBotResponse = IApiResponse<IBot>;
export type ICreateBotResponse = IApiResponse<IBot>;
export type IUpdateBotResponse = IApiResponse<IBot>;
export type IDeleteBotResponse = IApiResponse<IBot>;

// Bulk operations types
export interface IBulkCreateBotsRequest {
  bots: Array<{
    name: string;
    description?: string;
    isActive?: boolean;
  }>;
}

export type IBulkCreateBotsResponse = IApiResponse<{
  created: number;
  items: IBot[];
}>;

export interface IBulkUpdateBotsRequest {
  updates: Array<{
    id: string;
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    };
  }>;
}

export type IBulkUpdateBotsResponse = IApiResponse<{
  modified: number;
  items: IBot[];
}>;

export interface IBulkDeleteBotsRequest {
  ids: string[];
}

export type IBulkDeleteBotsResponse = IApiResponse<{
  deleted: number;
  items: IBot[];
}>;
