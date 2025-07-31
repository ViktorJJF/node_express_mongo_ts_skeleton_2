# Error Reporting System

A modular error reporting system that sends detailed Telegram notifications when errors occur in your application.

## Features

- 🔍 **Automatic Error Detection**: Automatically detects and categorizes different types of errors
- 📊 **Severity Levels**: Categorizes errors by severity (low, medium, high, critical)
- 🛡️ **Data Sanitization**: Automatically removes sensitive information from error reports
- 📱 **Telegram Integration**: Sends detailed error reports via Telegram
- ⚙️ **Configurable**: Highly configurable through environment variables
- 🔄 **Rate Limiting**: Prevents spam by limiting error reports
- 🎯 **Manual Reporting**: Allows manual error reporting with custom context

## Quick Start

### 1. Environment Variables

Add these environment variables to your `.env` file:

```env
# Enable error reporting
ERROR_REPORTING_ENABLED=true

# Telegram configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Error reporting configuration
ERROR_SEVERITY_THRESHOLD=low
ERROR_RATE_LIMITING_ENABLED=true
ERROR_MAX_REPORTS_PER_MINUTE=10
ERROR_MAX_REPORTS_PER_HOUR=100
```

### 2. Automatic Error Reporting

The system automatically reports errors through the middleware. Just use the error handler:

```typescript
import errorHandler from './middleware/errorHandler';

app.use(errorHandler);
```

### 3. Manual Error Reporting

Use the helper functions for manual error reporting:

```typescript
import {
  reportError,
  reportValidationError,
  reportDatabaseError,
  reportAuthError,
  reportCriticalError
} from './helpers/errorReporter';

// Report a validation error
await reportValidationError(error, req, 'email');

// Report a database error
await reportDatabaseError(error, req, 'create');

// Report a critical error with context
await reportCriticalError(error, req, {
  operation: 'payment-processing',
  userId: req.user.id,
  amount: req.body.amount
});
```

## Error Categories

The system automatically categorizes errors:

| Category | Description | Severity | Example |
|----------|-------------|----------|---------|
| **Validation** | Input validation errors | Low | Missing required fields |
| **Database** | Database connection/query errors | High | Connection timeout |
| **Authentication** | JWT/token errors | Medium | Invalid token |
| **Authorization** | Permission errors | Medium | Insufficient roles |
| **External** | Third-party service errors | High | API timeout |
| **Internal** | System errors | Critical | Memory exhaustion |

## Severity Levels

| Level | Description | Color | When Used |
|-------|-------------|-------|-----------|
| **Low** | 🟢 | Green | Validation errors, minor issues |
| **Medium** | 🟡 | Yellow | Auth errors, client errors |
| **High** | 🟠 | Orange | Database errors, external service errors |
| **Critical** | 🔴 | Red | System crashes, 500 errors |

## Telegram Message Format

Error reports include:

- 📅 **Timestamp**: When the error occurred
- 🌍 **Environment**: Development/Production
- 🔗 **Request Details**: Method, URL, IP, User Agent
- 💬 **Error Message**: The actual error message
- 🔢 **Error Code**: HTTP status code
- 📦 **Request Body**: (sanitized)
- 🔍 **Query Parameters**: URL parameters
- 📚 **Stack Trace**: (for critical errors or in development)
- ℹ️ **Additional Info**: Custom context data

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ERROR_REPORTING_ENABLED` | `false` | Enable/disable error reporting |
| `TELEGRAM_BOT_TOKEN` | - | Your Telegram bot token |
| `TELEGRAM_CHAT_ID` | - | Chat ID to send reports to |
| `ERROR_SEVERITY_THRESHOLD` | `low` | Minimum severity to report |
| `ERROR_RATE_LIMITING_ENABLED` | `false` | Enable rate limiting |
| `ERROR_MAX_REPORTS_PER_MINUTE` | `10` | Max reports per minute |
| `ERROR_MAX_REPORTS_PER_HOUR` | `100` | Max reports per hour |

### Advanced Configuration

```typescript
import { getErrorReportingConfig } from './config/errorReporting';

const config = getErrorReportingConfig();
console.log(config);
```

## Usage Examples

### Basic Error Handling

```typescript
import { reportError } from './helpers/errorReporter';

app.post('/api/users', async (req, res, next) => {
  try {
    // Your logic here
    const user = await createUser(req.body);
    res.json(user);
  } catch (error) {
    // Report the error
    await reportError({
      error,
      request: req,
      severity: 'medium',
      category: 'internal'
    });

    next(error);
  }
});
```

### Validation Error Handling

```typescript
import { reportValidationError } from './helpers/errorReporter';

app.post('/api/validate', async (req, res) => {
  try {
    if (!req.body.email) {
      const error = new Error('Email is required');
      error.name = 'ValidationError';

      await reportValidationError(error, req, 'email');
      return res.status(400).json({ error: 'Email is required' });
    }

    res.json({ valid: true });
  } catch (error) {
    next(error);
  }
});
```

### Database Error Handling

```typescript
import { reportDatabaseError } from './helpers/errorReporter';

app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    if (error.name === 'MongoError') {
      await reportDatabaseError(error, req, 'findById');
    }
    next(error);
  }
});
```

### Authentication Error Handling

```typescript
import { reportAuthError } from './helpers/errorReporter';

app.use('/api/protected', (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      const error = new Error('No token provided');
      error.name = 'JsonWebTokenError';

      await reportAuthError(error, req, 'JWT');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token logic here
    next();
  } catch (error) {
    next(error);
  }
});
```

### Custom Error Reporting

```typescript
import { reportError } from './helpers/errorReporter';

app.post('/api/payment', async (req, res, next) => {
  try {
    // Payment processing logic
    const result = await processPayment(req.body);
    res.json(result);
  } catch (error) {
    // Report with custom context
    await reportError({
      error,
      request: req,
      severity: 'critical',
      category: 'internal',
      additionalInfo: {
        operation: 'payment-processing',
        userId: req.user?.id,
        amount: req.body.amount,
        paymentMethod: req.body.paymentMethod,
        merchantId: req.body.merchantId
      }
    });

    next(error);
  }
});
```

## Middleware Integration

### Custom Error Reporting Middleware

```typescript
import { createErrorReportingMiddleware } from './middleware/errorReporting';

// Create custom middleware with specific options
const customErrorReporting = createErrorReportingMiddleware({
  enabled: true,
  includeStack: process.env.NODE_ENV === 'development',
  includeHeaders: false,
  includeBody: true,
  severityThreshold: 'medium'
});

app.use(customErrorReporting);
```

### Rate Limiting

The system includes built-in rate limiting to prevent spam:

```typescript
// Configure rate limiting
const config = getErrorReportingConfig();
if (config.rateLimiting.enabled) {
  console.log(`Rate limiting: ${config.rateLimiting.maxReportsPerMinute} per minute`);
}
```

## Data Sanitization

The system automatically sanitizes sensitive data:

### Sensitive Fields Removed
- `password`
- `token`
- `secret`
- `key`
- `authorization`
- `apiKey`
- `privateKey`
- `accessToken`
- `refreshToken`

### Sensitive Headers Removed
- `authorization`
- `cookie`
- `x-api-key`
- `x-auth-token`
- `x-access-token`

## Testing

### Test Error Reporting

```typescript
import { reportError } from './helpers/errorReporter';

// Test endpoint
app.post('/api/test-error', async (req, res) => {
  const testError = new Error('This is a test error');
  testError.name = 'TestError';

  await reportError({
    error: testError,
    request: req,
    severity: 'medium',
    category: 'internal',
    additionalInfo: {
      test: true,
      timestamp: new Date().toISOString()
    }
  });

  res.json({ message: 'Test error reported' });
});
```

## Troubleshooting

### Common Issues

1. **Telegram messages not sending**
   - Check `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
   - Verify bot has permission to send messages to chat

2. **Too many error reports**
   - Enable rate limiting: `ERROR_RATE_LIMITING_ENABLED=true`
   - Adjust thresholds: `ERROR_SEVERITY_THRESHOLD=high`

3. **Sensitive data in reports**
   - Check sanitization configuration
   - Add custom sensitive fields if needed

### Debug Mode

Enable debug logging:

```typescript
import logger from './config/logger';

logger.debug('Error reporting configuration:', getErrorReportingConfig());
```

## Best Practices

1. **Use appropriate severity levels** for different error types
2. **Include relevant context** in manual error reports
3. **Test error reporting** in development environment
4. **Monitor rate limits** to prevent spam
5. **Review and adjust** configuration based on your needs
6. **Keep sensitive data** out of error reports
7. **Use categories** to organize and filter errors

## API Reference

### ErrorReportingService

```typescript
import { ErrorReportingService } from './services/errorReporting';

const service = ErrorReportingService.getInstance();
service.enable();
service.disable();
service.setTelegramChatId('your-chat-id');
```

### Helper Functions

```typescript
import {
  reportError,
  reportValidationError,
  reportDatabaseError,
  reportAuthError,
  reportAuthorizationError,
  reportExternalServiceError,
  reportCriticalError
} from './helpers/errorReporter';
```

### Configuration

```typescript
import {
  getErrorReportingConfig,
  isErrorReportingEnabled,
  shouldReportError
} from './config/errorReporting';
```
