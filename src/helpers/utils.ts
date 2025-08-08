import requestIp from 'request-ip';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const convertToDate = (date: string | number | Date): Date => {
  const preFormated = new Date(date);
  const formatedDate = new Date(
    preFormated.getTime() - preFormated.getTimezoneOffset() * -60000,
  );
  return formatedDate;
};

const selectRandomId = (collection: Array<{ id: number }>): number =>
  collection[Random(0, collection.length - 1)].id;

const Random = (min: number, max: number): number => {
  const newMin = Math.ceil(min);
  const newMax = Math.floor(max);
  return Math.floor(Math.random() * (newMax - newMin + 1)) + min;
};

const removeExtensionFromFile = (file: string): string =>
  file.split('.').slice(0, -1).join('.');

const getIP = (req: Request): string => requestIp.getClientIp(req) || 'unknown';

const getBrowserInfo = (req: Request): string =>
  req.headers['user-agent'] as string;

const getCountry = (req: Request): string =>
  req.headers['cf-ipcountry'] ? (req.headers['cf-ipcountry'] as string) : 'XX';

const handleError = (res: Response, err: any): void => {
  console.error('🐞 LOG HERE err:', err);
  console.error('🐞 Error stack:', err.stack);

  // Handle different types of error codes
  let statusCode = 500;
  if (typeof err.code === 'number') {
    statusCode = err.code;
  } else if (typeof err.status === 'number') {
    statusCode = err.status;
  } else if (typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  } else if (err.code === 'ERR_BAD_REQUEST') {
    statusCode = 400;
  } else if (err.code === 'ERR_NOT_FOUND') {
    statusCode = 404;
  } else if (err.code === 'ERR_UNAUTHORIZED') {
    statusCode = 401;
  } else if (err.code === 'ERR_FORBIDDEN') {
    statusCode = 403;
  }

  const errorMessage = err.message || 'Internal Server Error';

  // Prepare error response
  const errorResponse: any = {
    errors: {
      msg: errorMessage,
      ...(process.env.NODE_ENV !== 'production' && {
        stack: err.stack,
        name: err.name,
        code: err.code,
      }),
    },
  };

  // Add axios-specific details if it's an axios error
  if (err.isAxiosError && err.config) {
    errorResponse.errors.axios = {
      request: {
        method: err.config.method?.toUpperCase(),
        url: err.config.url,
        baseURL: err.config.baseURL,
        headers: err.config.headers,
        data: err.config.data,
        params: err.config.params,
      },
      response: err.response
        ? {
            status: err.response.status,
            statusText: err.response.statusText,
            headers: err.response.headers,
            data: err.response.data,
          }
        : null,
    };
  }

  res.status(statusCode).json(errorResponse);
};

const buildErrObject = (
  code: number,
  message: string,
): { code: number; message: string } => ({
  code,
  message,
});

const validationResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void | Response<any> => {
  try {
    validationResult(req).throw();
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase();
    }
    return next();
  } catch (err: any) {
    return handleError(res, buildErrObject(422, err.array()));
  }
};

const buildSuccObject = (message: string): { msg: string } => ({
  msg: message,
});

const isIDGood = async (id: string): Promise<number> => {
  const numId = parseInt(id, 10);
  if (!isNaN(numId) && numId > 0) {
    return numId;
  }
  throw buildErrObject(422, 'ID_MALFORMED');
};

const listResponse = (data: any): object => {
  return {
    ok: true,
    ...data,
  };
};

export {
  convertToDate,
  selectRandomId,
  Random,
  removeExtensionFromFile,
  getIP,
  getBrowserInfo,
  getCountry,
  handleError,
  buildErrObject,
  validationResultMiddleware,
  buildSuccObject,
  isIDGood,
  listResponse,
};
