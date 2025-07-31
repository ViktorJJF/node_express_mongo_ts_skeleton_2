import { Request, Response, NextFunction } from 'express';
import * as utils from '../helpers/utils';
import { errorReportingMiddleware } from './errorReporting';
import { notificationManager } from '../services/notifications';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log('🐞 LOG HERE err:', err);
  utils.handleError(res, err);

  // Legacy Telegram notification (for backward compatibility)
  if (process.env.TELEGRAM_CHAT_ID) {
    console.log('🐞 start send notification');

    // Get detailed error information
    const errorName = err.name || 'Unknown Error';
    const errorMessage = err.message || 'No error message';
    const errorCode = err.code || err.status || err.statusCode || 'Unknown';
    const errorStack = err.stack || 'No stack trace available';

    // Get request details
    const requestMethod = req.method;
    const requestUrl = req.originalUrl;
    const requestHeaders = JSON.stringify(req.headers, null, 2);
    const requestBody = JSON.stringify(req.body, null, 2);
    const requestParams = JSON.stringify(req.params, null, 2);
    const requestQuery = JSON.stringify(req.query, null, 2);

    // Check if it's an axios error and extract axios-specific details
    let axiosDetails = '';
    if (err.isAxiosError && err.config) {
      const axiosConfig = err.config;
      const axiosResponse = err.response;

      axiosDetails = `🔗 Axios Request Details:
• Method: ${axiosConfig.method?.toUpperCase() || 'UNKNOWN'}
• URL: ${axiosConfig.url || 'unknown'}
• Base URL: ${axiosConfig.baseURL || 'none'}
• Timeout: ${axiosConfig.timeout || 'default'}ms
• Headers: \`\`\`${JSON.stringify(axiosConfig.headers || {}, null, 2)}\`\`\`
• Data: \`\`\`${JSON.stringify(axiosConfig.data || {}, null, 2)}\`\`\`
• Params: \`\`\`${JSON.stringify(axiosConfig.params || {}, null, 2)}\`\`\`

📡 Axios Response Details:
• Status: ${axiosResponse?.status || 'unknown'}
• Status Text: ${axiosResponse?.statusText || 'unknown'}
• Response Headers: \`\`\`${JSON.stringify(axiosResponse?.headers || {}, null, 2)}\`\`\`
• Response Data: \`\`\`${JSON.stringify(axiosResponse?.data || {}, null, 2)}\`\`\`

`;
    }

    // Create detailed error message with simpler markdown to avoid parsing issues
    const detailedErrorMessage = `🚨 API Error Detected 🚨

Error Details:
• Type: ${errorName}
• Message: ${errorMessage}
• Code: ${errorCode}
• Endpoint: ${requestMethod} ${requestUrl}

${axiosDetails}Request Information:
• Headers: \`\`\`${requestHeaders}\`\`\`
• Body: \`\`\`${requestBody}\`\`\`
• Params: \`\`\`${requestParams}\`\`\`
• Query: \`\`\`${requestQuery}\`\`\`

Stack Trace:
\`\`\`
${errorStack}
\`\`\``;

    notificationManager.sendNotification(
      'telegram',
      process.env.TELEGRAM_CHAT_ID,
      detailedErrorMessage,
    );
  }
};

export default errorHandler;
