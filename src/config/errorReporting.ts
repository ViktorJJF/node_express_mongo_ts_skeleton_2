export interface ErrorReportingConfig {
  enabled: boolean;
  telegram: {
    enabled: boolean;
    chatId?: string;
    botToken?: string;
  };
  severity: {
    threshold: 'low' | 'medium' | 'high' | 'critical';
    includeStack: boolean;
    includeHeaders: boolean;
    includeBody: boolean;
  };
  categories: {
    validation: boolean;
    database: boolean;
    authentication: boolean;
    authorization: boolean;
    external: boolean;
    internal: boolean;
  };
  sanitization: {
    enabled: boolean;
    sensitiveFields: string[];
    sensitiveHeaders: string[];
  };
  rateLimiting: {
    enabled: boolean;
    maxReportsPerMinute: number;
    maxReportsPerHour: number;
  };
}

export const getErrorReportingConfig = (): ErrorReportingConfig => {
  const environment = process.env.NODE_ENV || 'development';

  return {
    enabled: process.env.ERROR_REPORTING_ENABLED === 'true',
    telegram: {
      enabled: process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
      chatId: process.env.TELEGRAM_CHAT_ID,
      botToken: process.env.TELEGRAM_BOT_TOKEN,
    },
    severity: {
      threshold: (process.env.ERROR_SEVERITY_THRESHOLD as any) || 'low',
      includeStack: environment === 'development',
      includeHeaders: environment === 'development',
      includeBody: true,
    },
    categories: {
      validation: true,
      database: true,
      authentication: true,
      authorization: true,
      external: true,
      internal: true,
    },
    sanitization: {
      enabled: true,
      sensitiveFields: [
        'password',
        'token',
        'secret',
        'key',
        'authorization',
        'apiKey',
        'privateKey',
        'accessToken',
        'refreshToken',
      ],
      sensitiveHeaders: [
        'authorization',
        'cookie',
        'x-api-key',
        'x-auth-token',
        'x-access-token',
      ],
    },
    rateLimiting: {
      enabled: process.env.ERROR_RATE_LIMITING_ENABLED === 'true',
      maxReportsPerMinute: parseInt(
        process.env.ERROR_MAX_REPORTS_PER_MINUTE || '10',
      ),
      maxReportsPerHour: parseInt(
        process.env.ERROR_MAX_REPORTS_PER_HOUR || '100',
      ),
    },
  };
};

export const isErrorReportingEnabled = (): boolean => {
  const config = getErrorReportingConfig();
  return config.enabled && config.telegram.enabled;
};

export const shouldReportError = (error: any, category?: string): boolean => {
  const config = getErrorReportingConfig();

  if (!config.enabled) return false;

  // Check if category is enabled
  if (
    category &&
    !config.categories[category as keyof typeof config.categories]
  ) {
    return false;
  }

  // Check severity threshold
  const severityLevels = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3,
  };

  const errorSeverity = getErrorSeverity(error);
  const threshold = severityLevels[config.severity.threshold];
  const errorLevel = severityLevels[errorSeverity];

  return errorLevel >= threshold;
};

function getErrorSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
  if (error.status >= 500) return 'critical';
  if (error.status >= 400) return 'medium';
  if (error.name === 'ValidationError') return 'low';
  if (error.name === 'MongoError' || error.name === 'MongooseError')
    return 'high';
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')
    return 'medium';

  return 'medium';
}
