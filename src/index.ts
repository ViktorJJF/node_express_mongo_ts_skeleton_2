import 'dotenv/config';
import express, {
  Request as _Request,
  Response as _Response,
  NextFunction as _NextFunction,
} from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import passport from 'passport';
import routes from './routes/api';
import i18n from 'i18n';
import { initializeDatabase } from './config/database';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
// import logger from './config/logger';
import HealthCheckMiddleware from './middleware/healthCheck';
import getDatabase from './config/database';
import errorHandler from './middleware/errorHandler';
import { notificationManager } from './services/notifications';
import { isAxiosError } from 'axios';

// Import swagger document conditionally
let swaggerDocument: any;
try {
  swaggerDocument = require('../swagger.json');
} catch {
  swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description:
        'API documentation will be generated when you run npm run swagger',
    },
    paths: {},
  };
}

const app = express();

// Setup express server port from ENV, default: 3333
app.set('port', process.env.PORT || 3333);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Enable only in development HTTP request logger middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: '100mb',
    extended: true,
  }),
);

// i18n
i18n.configure({
  locales: ['en', 'es'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  objectNotation: true,
});
app.use(i18n.init);

// Init all other stuff
app.use(cors());
app.use(passport.initialize());
app.use(compression());
app.use(helmet());

// Setup Swagger
if (process.env.NODE_ENV !== 'production') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.get('/health', async (req, res) => {
  try {
    // Get basic health status from middleware
    const healthStatus = HealthCheckMiddleware.getHealthStatus();

    // Additional database verification
    let dbStatus = 'unknown';
    let dbResponseTime = 0;

    try {
      const db = getDatabase();
      const startTime = Date.now();
      // Perform a simple database operation to verify connectivity
      await db.execute('SELECT 1');
      dbResponseTime = Date.now() - startTime;
      dbStatus = 'healthy';
    } catch (dbError) {
      dbStatus = 'error';
      console.error('Database ping failed:', dbError);
    }

    // Enhanced health response
    const response = {
      status:
        healthStatus.isHealthy && dbStatus === 'healthy'
          ? 'healthy'
          : 'unhealthy',
      timestamp: healthStatus.timestamp,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        type: 'postgresql',
        responseTime: dbResponseTime,
      },
      application: {
        version: process.env.npm_package_version || '1.0.0',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      },
      metrics: HealthCheckMiddleware.getMetrics(),
    };

    const statusCode = response.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(response);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.use('/api', routes);
app.use(errorHandler);

app.listen(app.get('port'), () => {
  console.info('🚀 Server started successfully!');
  console.info(`🌐 URL: http://localhost:${app.get('port')}`);
  console.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.info(
    `📚 API Documentation: http://localhost:${app.get('port')}/docs`,
  );
  console.info(`🎯 Press CTRL-C to stop`);
  console.info('─'.repeat(50));
});

// Init PostgreSQL
initializeDatabase();

process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection at:', reason);

  if (isAxiosError(reason)) {
    const { config, response } = reason;
    const errorMessage = `
*🚨 Unhandled Axios Error 🚨*

\`\`\`
*URL:* ${config?.method?.toUpperCase() || 'UNKNOWN'} ${config?.url || 'unknown'}
*Status:* ${response?.status} ${response?.statusText}
*Headers:* ${JSON.stringify(config?.headers || {}, null, 2)}
*Params:* ${JSON.stringify(config?.params || {}, null, 2)}
*Data:* ${JSON.stringify(config?.data || {}, null, 2)}
*Response:* ${JSON.stringify(response?.data || {}, null, 2)}
\`\`\`
    `;

    if (process.env.TELEGRAM_CHAT_ID) {
      notificationManager.sendNotification(
        'telegram',
        process.env.TELEGRAM_CHAT_ID,
        errorMessage,
      );
    }
  }
});

export default app; // for testing
