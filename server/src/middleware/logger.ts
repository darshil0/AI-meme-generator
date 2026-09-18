import { Request, Response, NextFunction } from 'express';

/**
 * Express middleware logging incoming HTTP requests, response status codes,
 * and execution durations.
 * @param req Express request object.
 * @param res Express response object.
 * @param next Express next middleware callback.
 */
export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`,
    );
  });
  next();
};
