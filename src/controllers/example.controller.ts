import { Request, Response, NextFunction } from 'express';
import {
  reportError,
  reportValidationError,
  reportDatabaseError,
  reportAuthError,
  reportAuthorizationError,
  reportExternalServiceError,
  reportCriticalError,
} from '../helpers/errorReporter';
import logger from '../config/logger';

class ExampleController {
  /**
   * Example of handling validation errors
   */
  public async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      // Simulate validation error
      if (!req.body.name) {
        const validationError = new Error('Name is required');
        validationError.name = 'ValidationError';

        // Report the validation error
        await reportValidationError(validationError, req, 'name');

        return res.status(400).json({ error: 'Name is required' });
      }

      // Simulate database error
      if (req.body.name === 'error') {
        const dbError = new Error('Database connection failed');
        dbError.name = 'MongoError';

        // Report the database error
        await reportDatabaseError(dbError, req, 'create');

        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ message: 'Item created successfully' });
    } catch (error) {
      // Report any unexpected errors
      await reportError({
        error,
        request: req,
        severity: 'medium',
        category: 'internal',
      });

      next(error);
    }
  }

  /**
   * Example of handling authentication errors
   */
  public async protectedRoute(req: Request, res: Response, next: NextFunction) {
    try {
      // Simulate authentication error
      if (!req.headers.authorization) {
        const authError = new Error('No token provided');
        authError.name = 'JsonWebTokenError';

        // Report the authentication error
        await reportAuthError(authError, req, 'JWT');

        return res.status(401).json({ error: 'Authentication required' });
      }

      // Simulate authorization error
      if (req.user?.role !== 'admin') {
        const authzError = new Error('Insufficient permissions');
        authzError.status = 403;

        // Report the authorization error
        await reportAuthorizationError(authzError, req, 'admin');

        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      res.json({ message: 'Access granted' });
    } catch (error) {
      await reportError({
        error,
        request: req,
        severity: 'medium',
        category: 'authentication',
      });

      next(error);
    }
  }

  /**
   * Example of handling external service errors
   */
  public async callExternalService(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // Simulate external service error
      const externalError = new Error('External API timeout');
      externalError.name = 'AxiosError';
      (externalError as any).config = { url: 'https://api.example.com' };
      (externalError as any).response = { status: 500 };

      // Report the external service error
      await reportExternalServiceError(externalError, req, 'Example API');

      return res.status(502).json({ error: 'External service unavailable' });
    } catch (error) {
      await reportError({
        error,
        request: req,
        severity: 'high',
        category: 'external',
      });

      next(error);
    }
  }

  /**
   * Example of handling critical errors
   */
  public async criticalOperation(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // Simulate critical system error
      const criticalError = new Error('System memory exhausted');
      criticalError.status = 500;

      // Report the critical error with additional context
      await reportCriticalError(criticalError, req, {
        operation: 'memory-intensive-task',
        memoryUsage: '95%',
        systemLoad: 'high',
        affectedUsers: 1000,
      });

      return res.status(500).json({ error: 'System temporarily unavailable' });
    } catch (error) {
      await reportError({
        error,
        request: req,
        severity: 'critical',
        category: 'internal',
      });

      next(error);
    }
  }

  /**
   * Example of manual error reporting with custom context
   */
  public async customErrorReporting(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // Simulate a complex error scenario
      const customError = new Error('Custom business logic error');
      customError.name = 'BusinessLogicError';

      // Report with custom context
      await reportError({
        error: customError,
        request: req,
        severity: 'medium',
        category: 'internal',
        additionalInfo: {
          businessRule: 'user-verification',
          userId: req.user?.id,
          action: 'profile-update',
          previousValue: req.body.previousValue,
          newValue: req.body.newValue,
          timestamp: new Date().toISOString(),
        },
      });

      res.json({ message: 'Error logged successfully' });
    } catch (error) {
      logger.error('Failed to report custom error:', error);
      next(error);
    }
  }
}

export default new ExampleController();
