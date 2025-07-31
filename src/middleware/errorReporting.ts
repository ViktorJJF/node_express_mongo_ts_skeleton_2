import { Request, Response, NextFunction } from 'express';
import {
  ErrorReportingService,
  ErrorDetails,
} from '../services/errorReporting';
import logger from '../config/logger';

export interface ErrorReportingOptions {
  enabled?: boolean;
  includeStack?: boolean;
  includeHeaders?: boolean;
  includeBody?: boolean;
  severityThreshold?: 'low' | 'medium' | 'high' | 'critical';
}

export const createErrorReportingMiddleware = (
  options: ErrorReportingOptions = {},
) => {
  const {
    enabled = process.env.ERROR_REPORTING_ENABLED === 'true',
    includeStack = process.env.NODE_ENV === 'development',
    includeHeaders = process.env.NODE_ENV === 'development',
    includeBody = true,
    severityThreshold = 'low',
  } = options;

  const errorReportingService = ErrorReportingService.getInstance();

  return async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (!enabled) {
      return next(err);
    }

    try {
      // Determine if we should report this error based on severity
      const shouldReport = shouldReportError(err, severityThreshold);

      if (shouldReport) {
        const errorDetails: ErrorDetails = {
          error: err,
          request: req,
          timestamp: new Date(),
          environment: process.env.NODE_ENV || 'development',
          stack: includeStack ? err.stack : undefined,
          additionalInfo: {
            responseStatus: res.statusCode,
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress,
            method: req.method,
            url: req.originalUrl,
            query: req.query,
            params: req.params,
            body: includeBody ? sanitizeRequestBody(req.body) : undefined,
            headers: includeHeaders ? sanitizeHeaders(req.headers) : undefined,
          },
        };

        // Report error asynchronously (don't wait for it to complete)
        errorReportingService
          .reportError(errorDetails)
          .catch((reportingError) => {
            logger.error('Failed to report error:', reportingError);
          });
      }
    } catch (reportingError) {
      logger.error('Error in error reporting middleware:', reportingError);
    }

    // Always continue to the next middleware
    next(err);
  };
};

function shouldReportError(error: any, threshold: string): boolean {
  const severityLevels = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
  };

  const errorSeverity = getErrorSeverity(error);
  return severityLevels[errorSeverity] >= severityLevels[threshold];
}

function getErrorSeverity(error: any): string {
  if (error.status >= 500) return 'critical';
  if (error.status >= 400) return 'medium';
  if (error.name === 'ValidationError') return 'low';
  if (error.name === 'MongoError' || error.name === 'MongooseError')
    return 'high';
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')
    return 'medium';

  return 'medium';
}

function sanitizeRequestBody(body: any): any {
  if (!body) return undefined;

  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
  ];
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

function sanitizeHeaders(headers: any): any {
  if (!headers) return undefined;

  const sanitized = { ...headers };

  // Remove sensitive headers
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  sensitiveHeaders.forEach((header) => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });

  return sanitized;
}

// Export a default middleware with common settings
export const errorReportingMiddleware = createErrorReportingMiddleware();
