export class CustomError extends Error {
  statusCode: HttpStatusCode;

  constructor(message: string, statusCode: HttpStatusCode) {
    super(message);
    this.statusCode = statusCode;

    // Maintain proper stack trace for where the error was thrown (optional)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

type HttpStatusCode =
  | 100 // Continue
  | 101 // Switching Protocols
  | 200 // OK
  | 201 // Created
  | 202 // Accepted
  | 204 // No Content
  | 301 // Moved Permanently
  | 302 // Found
  | 304 // Not Modified
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 405 // Method Not Allowed
  | 429 // Too Many Requests
  | 500 // Internal Server Error
  | 501 // Not Implemented
  | 502 // Bad Gateway
  | 503; // Service Unavailable;
