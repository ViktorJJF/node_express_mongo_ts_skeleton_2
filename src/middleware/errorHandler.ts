import { Request, Response, NextFunction } from 'express';
import * as utils from '../helpers/utils';
import { errorReportingMiddleware } from './errorReporting';
import { notificationManager } from '../services/notifications';

import logger from '../config/logger';

const escapeHtml = (text: string) => {
  if (text === null || typeof text === 'undefined') {
    return '';
  }
  // Convert non-string types to string
  const str = String(text);
  return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
};

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error('🐞 LOG HERE err:', err);
  utils.handleError(res, err);

  if (process.env.TELEGRAM_CHAT_ID) {
    logger.info('🐞 start send notification');

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

    let axiosDetails = '';
    if (err.isAxiosError && err.config) {
      const axiosConfig = err.config;
      const axiosResponse = err.response;

      axiosDetails = `
<b>🔗 Axios Request Details:</b>
• <b>Method:</b> <code>${escapeHtml(axiosConfig.method?.toUpperCase() || 'UNKNOWN')}</code>
• <b>URL:</b> <code>${escapeHtml(axiosConfig.url || 'unknown')}</code>
• <b>Timeout:</b> <code>${escapeHtml(axiosConfig.timeout || 'default')}ms</code>
<pre><code>${escapeHtml(JSON.stringify(axiosConfig.data || {}, null, 2))}</code></pre>

<b>📡 Axios Response Details:</b>
• <b>Status:</b> <code>${escapeHtml(axiosResponse?.status || 'unknown')}</code>
• <b>Status Text:</b> <code>${escapeHtml(axiosResponse?.statusText || 'unknown')}</code>
<pre><code>${escapeHtml(JSON.stringify(axiosResponse?.data || {}, null, 2))}</code></pre>
`;
    }

    const detailedErrorMessage = `<b>🚨 API Error Detected 🚨</b>

<b>Error Details:</b>
• <b>Type:</b> <code>${escapeHtml(errorName)}</code>
• <b>Message:</b> ${escapeHtml(errorMessage)}
• <b>Code:</b> <code>${escapeHtml(errorCode)}</code>
• <b>Endpoint:</b> <code>${escapeHtml(requestMethod)} ${escapeHtml(requestUrl)}</code>
${axiosDetails}
<b>Request Information:</b>
• <b>Headers:</b>
<pre><code>${escapeHtml(requestHeaders)}</code></pre>
• <b>Body:</b>
<pre><code>${escapeHtml(requestBody)}</code></pre>
• <b>Params:</b>
<pre><code>${escapeHtml(requestParams)}</code></pre>
• <b>Query:</b>
<pre><code>${escapeHtml(requestQuery)}</code></pre>

<b>Stack Trace:</b>
<pre><code>${escapeHtml(errorStack)}</code></pre>`;

    // IMPORTANT: Ensure your notification manager sends with parse_mode: 'HTML'
    notificationManager.sendNotification(
      'telegram',
      process.env.TELEGRAM_CHAT_ID,
      detailedErrorMessage,
    );
  }
};

export default errorHandler;
