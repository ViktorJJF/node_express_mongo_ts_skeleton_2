import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

const myFormat = printf(({ level, message, timestamp: logTimestamp }) => {
  // Remove extra spaces and format the message nicely
  const cleanMessage = String(message).replace(/\s+/g, ' ').trim();
  return `${logTimestamp} [${level.toUpperCase()}] ${cleanMessage}`;
});

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize(),
    timestamp({
      format: 'HH:mm:ss',
    }),
    align(),
    myFormat,
  ),
  transports: [new winston.transports.Console()],
});

// Add Google Cloud Logging transport if in production and GCP credentials are available
if (
  process.env.NODE_ENV === 'production' &&
  process.env.GOOGLE_APPLICATION_CREDENTIALS
) {
  try {
    const loggingWinston = new LoggingWinston({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      logName: process.env.GOOGLE_CLOUD_LOG_NAME || 'node-express-api',
      serviceContext: {
        service: process.env.GOOGLE_CLOUD_SERVICE_NAME || 'node-express-api',
        version: process.env.APP_VERSION || '1.0.0',
      },
      labels: {
        environment: process.env.NODE_ENV,
        service: process.env.GOOGLE_CLOUD_SERVICE_NAME || 'node-express-api',
      },
    });

    logger.add(loggingWinston);
    logger.info('☁️ Google Cloud Logging transport added successfully');
  } catch (error) {
    logger.warn('⚠️ Failed to initialize Google Cloud Logging:', error);
  }
}

// Add file transport for local development if needed
if (
  process.env.NODE_ENV === 'development' &&
  process.env.LOG_TO_FILE === 'true'
) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    }),
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json(),
    }),
  );
}

export default logger;
