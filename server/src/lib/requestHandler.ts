import { Request, Response } from 'express';
import { ClientError } from './errors.js';

type ExpressHandler<T, U> = (req: Request<any, any, T>) => Promise<U>;

/**
 * Wraps an async Express handler with a try-catch block and standardized JSON responses.
 *
 * @param handler - The async function to execute.
 * @param successStatusCode - The HTTP status code for a successful response (default: 200).
 * @returns An Express middleware function.
 */
export function handleRequest<T, U>(handler: ExpressHandler<T, U>, successStatusCode = 200) {
  return async (req: Request<any, any, T>, res: Response) => {
    try {
      const result = await handler(req);
      res.status(successStatusCode).json(result);
    } catch (err) {
      console.error(`Error in ${req.path}:`, err);

      const statusCode = err instanceof ClientError ? err.statusCode : 500;
      const message =
        err instanceof Error ? err.message : `An unexpected error occurred in ${req.path}.`;

      res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  };
}
