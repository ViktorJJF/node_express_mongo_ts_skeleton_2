import express, { Router } from 'express';
import passport from 'passport';
// @ts-ignore
import trimRequest from 'trim-request';
import * as controller from '../../controllers/auth.controller';
import * as validate from '../../controllers/auth.validate';

const router: Router = express.Router();
import '../../config/passport';

const requireAuth = passport.authenticate('jwt', {
  session: false,
});

router.post(
  '/register',
  /* #swagger.tags = ['Authentication']
    #swagger.summary = 'Register a new user'
    #swagger.requestBody = {
        required: true,
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/User'
                }
            }
        }
    }
    #swagger.responses[201] = {
        description: 'User registered successfully',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/AuthResponse'
                }
            }
        }
    }
    #swagger.responses[400] = {
        description: 'Validation error',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/ValidationError'
                }
            }
        }
    }
    #swagger.responses[409] = {
        description: 'Email already exists',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/SharederrorResponseSchema'
                }
            }
        }
    } */
  trimRequest.all,
  validate.register,
  controller.register,
);

router.post(
  '/verify',
  /* #swagger.tags = ['Authentication']
    #swagger.summary = 'Verify user email'
    #swagger.requestBody = {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' }
                    }
                }
            }
        }
    }
    #swagger.responses[200] = {
        description: 'Email verified successfully',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }
    #swagger.responses[400] = {
        description: 'Invalid or expired token',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/SharederrorResponseSchema'
                }
            }
        }
    } */
  trimRequest.all,
  validate.verify,
  controller.verify,
);

router.post(
  '/forgot',
  /* #swagger.tags = ['Authentication']
    #swagger.summary = 'Request password reset'
    #swagger.requestBody = {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' }
                    }
                }
            }
        }
    }
    #swagger.responses[200] = {
        description: 'Password reset email sent',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }
    #swagger.responses[400] = {
        description: 'Validation error',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/SharedvalidationErrorSchema'
                }
            }
        }
    }
    #swagger.responses[404] = {
        description: 'Email not found',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/SharederrorResponseSchema'
                }
            }
        }
    } */
  trimRequest.all,
  validate.forgotPassword,
  controller.forgotPassword,
);

router.post(
  '/reset',
  /* #swagger.tags = ['Authentication']
    #swagger.summary = 'Reset password with token'
    #swagger.requestBody = {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        password: { type: 'string', minLength: 6 }
                    }
                }
            }
        }
    }
    #swagger.responses[200] = {
        description: 'Password reset successfully',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }
    #swagger.responses[400] = {
        description: 'Invalid or expired token',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/SharederrorResponseSchema'
                }
            }
        }
    } */
  trimRequest.all,
  validate.resetPassword,
  controller.resetPassword,
);

router.get(
  '/token',
  /* #swagger.tags = ['Authentication']
    #swagger.summary = 'Get new refresh token'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.responses[200] = {
        description: 'New token generated successfully',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        token: { type: 'string' },
                        refreshToken: { type: 'string' }
                    }
                }
            }
        }
    }
    #swagger.responses[401] = {
        description: 'Unauthorized',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/SharederrorResponseSchema'
                }
            }
        }
    } */
  requireAuth,
  controller.roleAuthorization(['USER', 'ADMIN', 'SUPERADMIN']),
  trimRequest.all,
  controller.getRefreshToken,
);

router.post(
  '/login',
  /* #swagger.tags = ['Authentication']
    #swagger.summary = 'Login user'
    #swagger.requestBody = {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' }
                    }
                }
            }
        }
    }
    #swagger.responses[200] = {
        description: 'Login successful',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/AuthResponse'
                }
            }
        }
    }
    #swagger.responses[401] = {
        description: 'Invalid credentials',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/SharederrorResponseSchema'
                }
            }
        }
    } */
  trimRequest.all,
  validate.login,
  controller.login,
);

router.get(
  '/me',
  /* #swagger.tags = ['Authentication']
    #swagger.summary = 'Get current user profile'
    #swagger.security = [{ "BearerAuth": [] }]
    #swagger.responses[200] = {
        description: 'User profile retrieved successfully',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        user: { $ref: '#/components/schemas/User' }
                    }
                }
            }
        }
    }
    } */
  requireAuth,
  controller.roleAuthorization(['USER', 'ADMIN', 'SUPERADMIN']),
  trimRequest.all,
  controller.me,
);

export default router;
