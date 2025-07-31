import logger from '../config/logger';

const dbErrorHandler = (err: any) => {
  logger.error('El error: ', err);
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error: any) => error.message);
    return {
      message: 'Validation Error',
      errors,
    };
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return {
      message: 'Duplicate Error',
      errors: [`${field} already exists`],
    };
  }
  logger.error(err);
  return {
    message: 'Database Error',
    errors: ['Something went wrong'],
  };
};

export default dbErrorHandler;
