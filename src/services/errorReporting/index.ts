import { Request } from 'express';
import { notificationManager } from '../notifications';
import logger from '../../config/logger';

export interface ErrorDetails {
  error: any;
  request: Request;
  timestamp: Date;
  environment: string;
  stack?: string;
  additionalInfo?: Record<string, any>;
}

export interface ErrorReport {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category:
    | 'validation'
    | 'database'
    | 'authentication'
    | 'authorization'
    | 'external'
    | 'internal'
    | 'unknown';
}

export class ErrorReportingService {
  private static instance: ErrorReportingService;
  private isEnabled: boolean;
  private telegramChatId?: string;

  private constructor() {
    this.isEnabled = process.env.ERROR_REPORTING_ENABLED === 'true';
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID;
  }

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  public async reportError(errorDetails: ErrorDetails): Promise<void> {
    if (!this.isEnabled) {
      logger.debug('Error reporting is disabled');
      return;
    }

    try {
      const errorReport = this.analyzeError(errorDetails);
      const formattedMessage = this.formatErrorMessage(
        errorDetails,
        errorReport,
      );

      if (this.telegramChatId) {
        await notificationManager.sendNotification(
          'telegram',
          this.telegramChatId,
          formattedMessage,
        );
        logger.info(`Error reported via Telegram: ${errorReport.title}`);
      } else {
        logger.warn('TELEGRAM_CHAT_ID not configured, error not sent');
      }
    } catch (reportingError) {
      logger.error('Failed to report error:', reportingError);
    }
  }

  private analyzeError(errorDetails: ErrorDetails): ErrorReport {
    const { error } = errorDetails;

    // Determine severity based on error type and context
    let severity: ErrorReport['severity'] = 'medium';
    let category: ErrorReport['category'] = 'unknown';
    let title = '🚨 API Error';

    // Analyze error type
    if (error.name === 'ValidationError') {
      category = 'validation';
      severity = 'low';
      title = '📝 Validation Error';
    } else if (error.name === 'MongoError' || error.name === 'MongooseError') {
      category = 'database';
      severity = 'high';
      title = '🗄️ Database Error';
    } else if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      category = 'authentication';
      severity = 'medium';
      title = '🔐 Authentication Error';
    } else if (error.status === 403) {
      category = 'authorization';
      severity = 'medium';
      title = '🚫 Authorization Error';
    } else if (error.status >= 500) {
      severity = 'critical';
      category = 'internal';
      title = '💥 Critical Error';
    } else if (error.status >= 400) {
      severity = 'medium';
      category = 'external';
      title = '⚠️ Client Error';
    }

    return {
      title,
      message: error.message || 'Unknown error occurred',
      severity,
      category,
    };
  }

  private formatErrorMessage(
    errorDetails: ErrorDetails,
    errorReport: ErrorReport,
  ): string {
    const { error, request, timestamp, environment, stack, additionalInfo } =
      errorDetails;
    const { title, message, severity, category } = errorReport;

    const severityEmoji = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    };

    const categoryEmoji = {
      validation: '📝',
      database: '🗄️',
      authentication: '🔐',
      authorization: '🚫',
      external: '🌐',
      internal: '⚙️',
      unknown: '❓',
    };

    const userAgent = request.headers['user-agent'] || 'Unknown';
    const ip = request.ip || request.connection.remoteAddress || 'Unknown';
    const referer = request.headers.referer || 'Direct access';

    let formattedMessage = `
${title}
${severityEmoji[severity]} <b>Severity:</b> ${severity.toUpperCase()}
${categoryEmoji[category]} <b>Category:</b> ${category.toUpperCase()}

📅 <b>Timestamp:</b> ${timestamp.toISOString()}
🌍 <b>Environment:</b> ${environment}

🔗 <b>Request Details:</b>
• <b>Method:</b> ${request.method}
• <b>URL:</b> ${request.originalUrl}
• <b>IP:</b> ${ip}
• <b>User Agent:</b> ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}
• <b>Referer:</b> ${referer}

💬 <b>Error Message:</b>
<code>${message}</code>

🔢 <b>Error Code:</b> ${error.status || error.code || 'N/A'}`;

    // Add request body if present and not too large
    if (request.body && Object.keys(request.body).length > 0) {
      const bodyStr = JSON.stringify(request.body, null, 2);
      if (bodyStr.length < 500) {
        formattedMessage += `\n\n📦 <b>Request Body:</b>\n<code>${bodyStr}</code>`;
      } else {
        formattedMessage += `\n\n📦 <b>Request Body:</b> <i>(truncated - too large)</i>`;
      }
    }

    // Add query parameters if present
    if (request.query && Object.keys(request.query).length > 0) {
      formattedMessage += `\n\n🔍 <b>Query Parameters:</b>\n<code>${JSON.stringify(request.query, null, 2)}</code>`;
    }

    // Add stack trace for critical errors or in development
    if (stack && (severity === 'critical' || environment === 'development')) {
      const stackLines = stack.split('\n').slice(0, 5); // Limit to first 5 lines
      formattedMessage += `\n\n📚 <b>Stack Trace:</b>\n<code>${stackLines.join('\n')}</code>`;
    }

    // Add additional info if provided
    if (additionalInfo && Object.keys(additionalInfo).length > 0) {
      formattedMessage += `\n\nℹ️ <b>Additional Info:</b>\n<code>${JSON.stringify(additionalInfo, null, 2)}</code>`;
    }

    // Add headers for debugging (only in development or for critical errors)
    if (environment === 'development' || severity === 'critical') {
      const relevantHeaders = {
        'content-type': request.headers['content-type'],
        authorization: request.headers.authorization ? '[REDACTED]' : undefined,
        'x-forwarded-for': request.headers['x-forwarded-for'],
        host: request.headers.host,
      };

      const filteredHeaders = Object.fromEntries(
        Object.entries(relevantHeaders).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      if (Object.keys(filteredHeaders).length > 0) {
        formattedMessage += `\n\n📋 <b>Relevant Headers:</b>\n<code>${JSON.stringify(filteredHeaders, null, 2)}</code>`;
      }
    }

    return formattedMessage;
  }

  public enable(): void {
    this.isEnabled = true;
    logger.info('Error reporting enabled');
  }

  public disable(): void {
    this.isEnabled = false;
    logger.info('Error reporting disabled');
  }

  public setTelegramChatId(chatId: string): void {
    this.telegramChatId = chatId;
    logger.info(`Telegram chat ID set to: ${chatId}`);
  }
}
