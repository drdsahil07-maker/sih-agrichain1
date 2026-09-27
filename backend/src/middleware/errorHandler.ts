import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

// Lightweight production-safe logging format that excludes credentials, keys, or direct secrets
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;
  const safeHeaders = { ...req.headers };
  
  // Clean confidential elements
  delete safeHeaders.authorization;
  delete safeHeaders.cookie;
  delete safeHeaders['x-api-key'];

  res.on('finish', () => {
    const duration = Date.now() - start;
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role || 'anonymous';
    const status = res.statusCode;

    if (status >= 400) {
      console.error(
        `[API_FAILURE] ${new Date().toISOString()} | Method: ${method} | URL: ${originalUrl} | Status: ${status} | Role: ${userRole} | Duration: ${duration}ms`
      );
    } else {
      console.log(
        `[API_REQUEST] ${new Date().toISOString()} | Method: ${method} | URL: ${originalUrl} | Status: ${status} | Role: ${userRole} | Duration: ${duration}ms`
      );
    }
  });

  next();
};

// Central production error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const authReq = req as AuthRequest;
  const userRole = authReq.user?.role || 'anonymous';

  // Securely log the full error inside backend logs (excluding keys/secrets)
  const safeErrorMessage = err.message ? err.message.replace(/([a-zA-Z0-9_-]{20,})/g, '***') : 'Internal Server Error';
  console.error(
    `[SERVER_ERROR] ${new Date().toISOString()} | Error: ${safeErrorMessage} | Code: ${err.code || 'N/A'} | Status: ${status} | URL: ${req.originalUrl} | Role: ${userRole}`
  );

  // Return consistent sanitized JSON error responses in production
  return res.status(status).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: status === 500 ? 'An unexpected system error occurred' : safeErrorMessage
    }
  });
};
