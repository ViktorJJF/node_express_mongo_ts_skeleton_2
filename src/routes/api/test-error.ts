import { Router } from 'express';
import {
  reportError,
  reportValidationError,
  reportDatabaseError,
  reportAuthError,
  reportCriticalError,
} from '../../helpers/errorReporter';

const router = Router();

// Test different types of error reporting
router.post('/validation', async (req, res) => {
  const error = new Error('Email format is invalid');
  error.name = 'ValidationError';

  await reportValidationError(error, req, 'email');

  res.json({
    message: 'Validation error reported',
    error: 'Email format is invalid',
  });
});

router.post('/database', async (req, res) => {
  const error = new Error('Connection timeout');
  error.name = 'MongoError';
  (error as any).dbName = 'testdb';
  (error as any).collection = 'users';

  await reportDatabaseError(error, req, 'find');

  res.json({
    message: 'Database error reported',
    error: 'Connection timeout',
  });
});

router.post('/auth', async (req, res) => {
  const error = new Error('Token expired');
  error.name = 'TokenExpiredError';

  await reportAuthError(error, req, 'JWT');

  res.json({
    message: 'Authentication error reported',
    error: 'Token expired',
  });
});

router.post('/critical', async (req, res) => {
  const error = new Error('System memory exhausted');
  error.status = 500;

  await reportCriticalError(error, req, {
    operation: 'memory-intensive-task',
    memoryUsage: '95%',
    systemLoad: 'high',
    affectedUsers: 1000,
  });

  res.json({
    message: 'Critical error reported',
    error: 'System memory exhausted',
  });
});

router.post('/custom', async (req, res) => {
  const error = new Error('Custom business logic error');
  error.name = 'BusinessLogicError';

  await reportError({
    error,
    request: req,
    severity: 'medium',
    category: 'internal',
    additionalInfo: {
      businessRule: 'user-verification',
      userId: req.body.userId,
      action: 'profile-update',
      previousValue: req.body.previousValue,
      newValue: req.body.newValue,
      timestamp: new Date().toISOString(),
    },
  });

  res.json({
    message: 'Custom error reported',
    error: 'Custom business logic error',
  });
});

router.post('/simulate-error', async (req, res, next) => {
  try {
    // Simulate an error that would be caught by the error handler
    throw new Error('This is a simulated error for testing');
  } catch (error) {
    next(error);
  }
});

export default router;
