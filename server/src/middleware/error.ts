import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
}

export const errorHandler = (err: HttpError, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
