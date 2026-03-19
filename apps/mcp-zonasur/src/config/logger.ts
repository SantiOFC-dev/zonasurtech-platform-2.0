import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  name: env.MCP_SERVER_NAME,
  level: env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: ["req.headers.authorization", "req.headers.x-api-key", "response.structuredContent.internal"],
    remove: true
  }
});
