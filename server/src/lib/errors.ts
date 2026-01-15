/**
 * Custom error for client-side validation errors that should result in a 4xx response.
 */
export class ClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = 'ClientError';
  }
}
