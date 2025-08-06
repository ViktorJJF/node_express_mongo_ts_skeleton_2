import express from 'express';
import controller from '../../../controllers/bots.controller';
import {
  requireAuth,
  role,
  checkRole,
  trimRequest,
} from '../../../middleware/auth';
import { ROLES } from '../../../middleware/roles';
import { validate } from '../../../middleware/validator';
import {
  createBotSchema,
  updateBotSchema,
  bulkCreateBotsSchema,
  bulkUpdateBotsSchema,
  bulkDeleteBotsSchema,
} from '../../../schemas/bot.schema';
import { idSchema } from '../../../schemas/shared.schema';
import { z } from 'zod';

const router = express.Router();

/*
 * Bots routes
 */

/*
 * Get all bots
 */
router.get(
  '/bots',
  // #swagger.tags = ['Bots']
  // #swagger.summary = 'Get all bots with pagination v3'
  // #swagger.parameters['sort'] = { in: 'query', description: 'Sort by field', schema: { type: 'string', enum: ['createdAt', 'updatedAt'] } }
  // #swagger.parameters['order'] = { in: 'query', description: 'Sort order', schema: { type: 'string', enum: ['asc', 'desc'] } }
  // #swagger.parameters['page'] = { in: 'query', description: 'Page number', schema: { type: 'number' } }
  // #swagger.parameters['limit'] = { in: 'query', description: 'Number of items per page', schema: { type: 'number' } }
  // #swagger.parameters['filter'] = { in: 'query', description: 'Filter by text', schema: { type: 'string' } }
  // #swagger.parameters['fields'] = { in: 'query', description: 'Fields to include in the response (comma-separated)', schema: { type: 'string' } }
  // #swagger.responses[200] = { description: 'A paginated list of bots', content: { 'application/json': { schema: { $ref: '#/components/schemas/BotgetBotsResponseSchema' } } } }
  // requireAuth,
  controller.list,
);

/*
 * Bulk create bots
 */
router.post(
  '/bots/bulk',
  // #swagger.tags = ['Bots']
  // #swagger.summary = 'Create multiple bots at once'
  // #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BotbulkCreateBotsSchema' } } } }
  // #swagger.responses[200] = { description: 'Bots created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/BotbulkCreateBotsResponseSchema' } } } }
  // #swagger.responses[403] = { description: 'Forbidden - Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  // requireAuth,
  // role(ROLES.Admin),
  // checkRole,
  trimRequest.all,
  validate(z.object({ body: bulkCreateBotsSchema })),
  controller.bulkCreate,
);

/*
 * Bulk update bots
 */
router.put(
  '/bots/bulk',
  // #swagger.tags = ['Bots']
  // #swagger.summary = 'Update multiple bots at once'
  // #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BotbulkUpdateBotsSchema' } } } }
  // #swagger.responses[200] = { description: 'Bots updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/BotbulkUpdateBotsResponseSchema' } } } }
  // #swagger.responses[403] = { description: 'Forbidden - Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  requireAuth,
  role(ROLES.Admin),
  checkRole,
  trimRequest.all,
  validate(z.object({ body: bulkUpdateBotsSchema })),
  controller.bulkUpdate,
);

/*
 * Bulk delete bots
 */
router.delete(
  '/bots/bulk',
  // #swagger.tags = ['Bots']
  // #swagger.summary = 'Delete multiple bots at once'
  // #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BotbulkDeleteBotsSchema' } } } }
  // #swagger.responses[200] = { description: 'Bots deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/BotbulkDeleteBotsResponseSchema' } } } }
  // #swagger.responses[403] = { description: 'Forbidden - Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  // requireAuth,
  // role(ROLES.Admin),
  // checkRole,
  validate(z.object({ body: bulkDeleteBotsSchema })),
  controller.bulkDelete,
);

/*
 * Get bot by id
 */
router.get(
  '/bots/:id',
  // #swagger.tags = ['Bots']
  // #swagger.summary = 'Get a bot by id'
  // #swagger.parameters['id'] = { in: 'path', description: 'Bot id', required: true, type: 'string' }
  // #swagger.responses[200] = { description: 'A bot', content: { 'application/json': { schema: { $ref: '#/components/schemas/BotbotSchema' } } } }
  // requireAuth,
  validate(z.object({ params: z.object({ id: idSchema }) })),
  controller.listOne,
);

/*
 * Create new bot
 */
router.post(
  '/bots',
  // #swagger.tags = ['Bots']
  // #swagger.summary = 'Create a new bot'
  // #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BotcreateBotSchema' } } } }
  // #swagger.responses[201] = { description: 'Bot created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/BotbotSchema' } } } }
  // #swagger.responses[403] = { description: 'Forbidden - Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  // requireAuth,
  // role(ROLES.Admin),
  // checkRole,
  trimRequest.all,
  validate(z.object({ body: createBotSchema })),
  controller.create,
);

/*
 * Update bot
 */
router.put(
  '/bots/:id',
  // #swagger.tags = ['Bots']
  // #swagger.summary = 'Update a bot'
  // #swagger.parameters['id'] = { in: 'path', description: 'Bot id', required: true, type: 'string' }
  // #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BotupdateBotSchema' } } } }
  // #swagger.responses[200] = { description: 'Bot updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/BotbotSchema' } } } }
  // #swagger.responses[403] = { description: 'Forbidden - Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  requireAuth,
  role(ROLES.Admin),
  checkRole,
  trimRequest.all,
  validate(
    z.object({
      params: z.object({ id: idSchema }),
      body: updateBotSchema,
    }),
  ),
  controller.update,
);

/*
 * Delete bot
 */
router.delete(
  '/bots/:id',
  // #swagger.tags = ['Bots']
  // #swagger.summary = 'Delete a bot'
  // #swagger.parameters['id'] = { in: 'path', description: 'Bot id', required: true, type: 'string' }
  // #swagger.responses[204] = { description: 'Bot deleted successfully' }
  // #swagger.responses[403] = { description: 'Forbidden - Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  // requireAuth,
  // role(ROLES.Admin),
  // checkRole,
  validate(z.object({ params: z.object({ id: idSchema }) })),
  controller.delete,
);

export default router;
