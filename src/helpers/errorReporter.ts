import { Request } from 'express';
import {
  ErrorReportingService,
  ErrorDetails,
} from '../services/errorReporting';
import logger from '../config/logger';

export interface ManualErrorReport {
  error: any;
  request?: Request;
  additionalInfo?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?:
    | 'validation'
    | 'database'
    | 'authentication'
    | 'authorization'
    | 'external'
    | 'internal'
    | 'unknown';
}

/**
 * Manually report an error with detailed information
 * @param report - Error report details
 */
export const reportError = async (report: ManualErrorReport): Promise<void> => {
  try {
    console.error('🐞 LOG HERE report:', report);
    const errorReportingService = ErrorReportingService.getInstance();

    const errorDetails: ErrorDetails = {
      error: report.error,
      request: report.request || createDummyRequest(),
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      stack: report.error.stack,
      additionalInfo: {
        ...report.additionalInfo,
        manualReport: true,
        severity: report.severity,
        category: report.category,
      },
    };

    await errorReportingService.reportError(errorDetails);
    logger.info('Manual error report sent successfully');
  } catch (reportingError) {
    logger.error('Failed to send manual error report:', reportingError);
  }
};

/**
 * Report a validation error
 * @param error - Validation error
 * @param request - Express request object
 * @param field - Field that failed validation
 */
export const reportValidationError = async (
  error: any,
  request: Request,
  field?: string,
): Promise<void> => {
  await reportError({
    error,
    request,
    severity: 'low',
    category: 'validation',
    additionalInfo: {
      validationField: field,
      validationType: error.name,
    },
  });
};

/**
 * Report a database error
 * @param error - Database error
 * @param request - Express request object
 * @param operation - Database operation that failed
 */
export const reportDatabaseError = async (
  error: any,
  request: Request,
  operation?: string,
): Promise<void> => {
  await reportError({
    error,
    request,
    severity: 'high',
    category: 'database',
    additionalInfo: {
      databaseOperation: operation,
      databaseName: error.dbName,
      collection: error.collection,
    },
  });
};

/**
 * Report an authentication error
 * @param error - Authentication error
 * @param request - Express request object
 * @param authMethod - Authentication method used
 */
export const reportAuthError = async (
  error: any,
  request: Request,
  authMethod?: string,
): Promise<void> => {
  await reportError({
    error,
    request,
    severity: 'medium',
    category: 'authentication',
    additionalInfo: {
      authMethod,
      tokenType: error.name,
    },
  });
};

/**
 * Report an authorization error
 * @param error - Authorization error
 * @param request - Express request object
 * @param requiredRole - Role that was required
 */
export const reportAuthorizationError = async (
  error: any,
  request: Request,
  requiredRole?: string,
): Promise<void> => {
  await reportError({
    error,
    request,
    severity: 'medium',
    category: 'authorization',
    additionalInfo: {
      requiredRole,
      userRole: request.user?.role,
    },
  });
};

/**
 * Report an external service error
 * @param error - External service error
 * @param request - Express request object
 * @param service - External service name
 */
export const reportExternalServiceError = async (
  error: any,
  request: Request,
  service?: string,
): Promise<void> => {
  await reportError({
    error,
    request,
    severity: 'high',
    category: 'external',
    additionalInfo: {
      externalService: service,
      serviceUrl: error.config?.url,
      statusCode: error.response?.status,
    },
  });
};

/**
 * Report a critical system error
 * @param error - Critical error
 * @param request - Express request object
 * @param context - Additional context about the error
 */
export const reportCriticalError = async (
  error: any,
  request: Request,
  context?: Record<string, any>,
): Promise<void> => {
  await reportError({
    error,
    request,
    severity: 'critical',
    category: 'internal',
    additionalInfo: {
      ...context,
      critical: true,
    },
  });
};

/**
 * Create a dummy request object for cases where no request is available
 */
function createDummyRequest(): Request {
  return {
    method: 'UNKNOWN',
    originalUrl: '/unknown',
    headers: {},
    body: {},
    query: {},
    params: {},
    ip: 'unknown',
    connection: { remoteAddress: 'unknown' } as any,
  } as Request;
}

// Export the error reporting service for advanced usage
export { ErrorReportingService } from '../services/errorReporting';
