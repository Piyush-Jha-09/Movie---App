import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { config } from "../config/env";

export interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(`Error: ${message}`, { stack: err.stack });

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
      ...(config.nodeEnv === "development" && { stack: err.stack }),
    },
  });
};
