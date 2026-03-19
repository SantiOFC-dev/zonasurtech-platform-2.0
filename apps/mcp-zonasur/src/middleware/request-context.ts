import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export const requestContext = (req: Request, res: Response, next: NextFunction): void => {
  req.requestId = randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
};
