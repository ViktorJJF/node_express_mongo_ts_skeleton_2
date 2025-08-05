import { Router } from 'express';
import passport from 'passport';
// @ts-ignore
import trimRequest from 'trim-request';
import controller from '../../../controllers/users.controller';
import { roleAuthorization } from '../../../controllers/auth.controller';
import { createUserSchema, updateUserSchema } from '../../../schemas/user.schema';
import { validate } from '../../../middleware/validator';
import { z } from 'zod';

const router = Router();
require('../../../config/passport');

const requireAuth = passport.authenticate('jwt', {
  session: false,
});

router.get(
  '/users',
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get users (admin only)'
  // #swagger.security = [{ "BearerAuth": [] }]
  // #swagger.parameters['sort'] = { in: 'query', description: 'Sort by field', required: false, type: 'string', schema: { '@enum': ['createdAt', 'updatedAt'] } }
  // #swagger.parameters['order'] = { in: 'query', description: 'Sort order', required: false, type: 'string', schema: { '@enum': ['asc', 'desc'] } }
  // #swagger.parameters['page'] = { in: 'query', description: 'Page number', required: false, type: 'number' }
  // #swagger.parameters['limit'] = { in: 'query', description: 'Number of items per page', required: false, type: 'number' }
  // #swagger.parameters['filter'] = { in: 'query', description: 'Filter by text', required: false, type: 'string' }
  // #swagger.parameters['fields'] = { in: 'query', description: 'Fields to include in the response (comma-separated)', required: false, type: 'string' }
  // #swagger.responses[200] = { description: 'List of users', content: { 'application/json': { schema: { $ref: '#/components/schemas/UsergetUsersResponseSchema' } } } }
  // #swagger.responses[403] = { description: 'Forbidden - Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  controller.list,
);

router.post(
  '/users',
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Create a new user (admin only)'
  // #swagger.security = [{ "BearerAuth": [] }]
  // #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UsercreateUserSchema' } } } }
  // #swagger.responses[201] = { description: 'User created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/UseruserSchema' } } } }
  // #swagger.responses[403] = { description: 'Forbidden - Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validate(z.object({ body: createUserSchema })),
  controller.create,
);

router.get(
  '/users/:id',
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get user by ID (admin only)'
  // #swagger.security = [{ "BearerAuth": [] }]
  // #swagger.parameters['id'] = { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID' }
  // #swagger.responses[200] = { description: 'User details', content: { 'application/json': { schema: { $ref: '#/components/schemas/UseruserSchema' } } } }
  // #swagger.responses[404] = { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  // #swagger.responses[403] = { description: 'Forbidden - Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  controller.listOne,
);

router.put(
  '/users/:id',
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Update user (admin only)'
  // #swagger.security = [{ "BearerAuth": [] }]
  // #swagger.parameters['id'] = { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID' }
  // #swagger.requestBody = { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserupdateUserSchema' } } } }
  // #swagger.responses[200] = { description: 'User updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/UseruserSchema' } } } }
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  validate(z.object({ body: updateUserSchema })),
  controller.update,
);

router.delete(
  '/users/:id',
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Delete user (admin only)'
  // #swagger.security = [{ "BearerAuth": [] }]
  // #swagger.parameters['id'] = { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'User ID' }
  // #swagger.responses[200] = { description: 'User deleted successfully', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } } }
  // #swagger.responses[404] = { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  // #swagger.responses[403] = { description: 'Forbidden - Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/SharederrorResponseSchema' } } } }
  requireAuth,
  roleAuthorization(['admin']),
  trimRequest.all,
  controller.delete,
);

export default router;
