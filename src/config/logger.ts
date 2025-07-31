import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import util from 'util';

// --- Step 1: Keep a reference to the original console methods ---
// This is crucial for ensuring logs always appear on the console, even after overriding.
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

const { combine, timestamp, printf, colorize, splat, json } = winston.format;

// --- Step 2: Define formats for different environments ---

// Custom format for local development console (human-readable, colored)
const devConsoleFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  splat(), // Essential for handling multiple arguments like console.log('msg', { meta })
  printf((info) => {
    const { timestamp: logTimestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length
      ? `\n${util.inspect(meta, { depth: null, colors: true })}`
      : '';
    return `${logTimestamp} ${level}: ${message}${metaString}`;
  }),
);

// --- Step 3: Configure transports based on environment ---

const transports = [];

// For non-production environments, use a detailed, colored console logger.
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: devConsoleFormat,
      level: 'debug',
    }),
  );
} else {
  // For production, use a basic console transport.
  // The logs will be ingested by Google Cloud's agent, which prefers simple JSON stdout.
  // Our base logger format is JSON, so this transport will output JSON.
  transports.push(new winston.transports.Console());
}

// For production on Google Cloud, add the special GCP transport.
if (
  process.env.NODE_ENV === 'production' &&
  process.env.GOOGLE_APPLICATION_CREDENTIALS
) {
  try {
    const cloudTransport = new LoggingWinston({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      logName: process.env.GOOGLE_CLOUD_LOG_NAME || 'node-express-api',
      serviceContext: {
        service: process.env.GOOGLE_CLOUD_SERVICE_NAME || 'node-express-api',
        version: process.env.APP_VERSION || '1.0.0',
      },
      // Let the transport handle formatting for GCP compatibility.
    });
    transports.push(cloudTransport);
    originalConsole.log(
      '☁️ Google Cloud Logging transport added successfully.',
    );
  } catch (error) {
    originalConsole.error(
      '⚠️ Failed to initialize Google Cloud Logging:',
      error,
    );
  }
}

// For local development, add file transports if enabled.
if (
  process.env.NODE_ENV === 'development' &&
  process.env.LOG_TO_FILE === 'true'
) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  );
  transports.push(
    new winston.transports.File({ filename: 'logs/combined.log' }),
  );
}

// --- Step 4: Create the main logger instance ---

const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  // Default format for all transports that don't have their own.
  // JSON is best for machine-readability (files, GCP).
  format: combine(timestamp(), splat(), json()),
  transports: transports,
  exitOnError: false,
});

// --- Step 5: Override console methods to use the logger AND the original console ---
// This is the key to making `console.log` work everywhere as intended.

console.log = (...args: any[]) => {
  // Use util.format to combine arguments into a single string, just like Node's console does.
  logger.info(util.format(...args));
  originalConsole.log(...args);
};

console.error = (...args: any[]) => {
  // Now, logger.error receives a single, properly formatted string.
  logger.error(util.format(...args));
  originalConsole.error(...args);
};

console.warn = (...args: any[]) => {
  logger.warn(util.format(...args));
  originalConsole.warn(...args);
};

console.info = (...args: any[]) => {
  logger.info(util.format(...args));
  originalConsole.info(...args);
};

console.debug = (...args: any[]) => {
  logger.debug(util.format(...args));
  originalConsole.debug(...args);
};

export default logger;
