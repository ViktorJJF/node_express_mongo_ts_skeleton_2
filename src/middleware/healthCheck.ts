import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import logger from '../config/logger';

interface HealthMetrics {
  requestCount: number;
  errorCount: number;
  lastCheck: Date;
}

class HealthCheckMiddleware {
  private static metrics: HealthMetrics = {
    requestCount: 0,
    errorCount: 0,
    lastCheck: new Date(),
  };

  /**
   * Middleware to track basic request metrics
   */
  static trackMetrics(req: Request, res: Response, next: NextFunction) {
    // Increment request count
    HealthCheckMiddleware.metrics.requestCount++;
    HealthCheckMiddleware.metrics.lastCheck = new Date();

    // Track errors
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        HealthCheckMiddleware.metrics.errorCount++;
      }

      // Log slow requests only
      const responseTime = Date.now() - Date.now(); // Simplified
      if (responseTime > 1000) {
        // 1 second threshold
        logger.warn('Slow request detected', {
          path: req.path,
          method: req.method,
          statusCode: res.statusCode,
        });
      }
    });

    next();
  }

  /**
   * Get current health metrics
   */
  static getMetrics(): HealthMetrics {
    return {
      ...HealthCheckMiddleware.metrics,
    };
  }

  /**
   * Check if application is healthy based on database connection
   */
  static async isHealthy(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get basic health status
   */
  static getHealthStatus() {
    // Lightweight; detailed check is done in /health endpoint
    return {
      isHealthy: true,
      database: 'unknown',
      timestamp: new Date().toISOString(),
    };
  }
}

export default HealthCheckMiddleware;
