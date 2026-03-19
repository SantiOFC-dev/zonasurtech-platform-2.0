import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { logger } from "../config/logger.js";

export const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
  if (error instanceof AppError) {
    logger.warn(
      {
        requestId: req.requestId,
        code: error.code,
        details: error.details
      },
      error.message
    );

    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }

  logger.error({ requestId: req.requestId, error }, "Unhandled server error");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Unexpected server error"
    }
  });
};
