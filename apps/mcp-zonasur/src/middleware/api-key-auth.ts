import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method === "OPTIONS") {
    next();
    return;
  }

  const apiKey = req.header("x-api-key");

  if (!apiKey || apiKey !== env.MCP_API_KEY) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or missing MCP API key"
      }
    });
    return;
  }

  next();
};
