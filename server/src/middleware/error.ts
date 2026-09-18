import { Request, Response, NextFunction } from 'express';

/**
 * Interface extending Error with an optional HTTP status code.
 */
interface HttpError extends Error {
  status?: number;
}

/**
 * Global Express error handling middleware for formatting API error responses.
 * @param err Error object thrown during request handling.
 * @param req Express request object.
 * @param res Express response object.
 * @param _next Express next function.
 */
export const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
