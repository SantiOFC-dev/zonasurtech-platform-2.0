import { randomUUID } from "node:crypto";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { createMcpExpressApp } from "@modelcontextprotocol/express";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { McpServer, isInitializeRequest } from "@modelcontextprotocol/server";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { apiKeyAuth } from "./middleware/api-key-auth.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestContext } from "./middleware/request-context.js";
import { registerBusinessTools } from "./tools/register-tools.js";

const app = createMcpExpressApp();
const transports: Record<string, NodeStreamableHTTPServerTransport> = {};

const server = new McpServer({
  name: env.MCP_SERVER_NAME,
  version: env.MCP_SERVER_VERSION
});

registerBusinessTools(server);

app.disable("x-powered-by");
app.use(helmet());
app.use(requestContext);
app.use(express.json({ limit: "1mb" }));
app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({
      requestId: req.requestId
    })
  })
);

const healthHandler: express.RequestHandler = (_req, res) => {
  res.status(200).json({
    status: "ok",
    env: env.NODE_ENV,
    server: env.MCP_SERVER_NAME,
    version: env.MCP_SERVER_VERSION
  });
};

app.get("/health", healthHandler);
app.get("/healthz", healthHandler);

app.use(apiKeyAuth);
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use((req, res, next) => {
  const origin = req.header("origin");

  if (!origin || env.allowedOrigins.length === 0 || env.allowedOrigins.includes(origin)) {
    if (origin) {
      res.setHeader("access-control-allow-origin", origin);
    }
    res.setHeader("access-control-allow-headers", "content-type,mcp-session-id,x-api-key,x-tenant-id");
    res.setHeader("access-control-allow-methods", "GET,POST,DELETE,OPTIONS");
    next();
    return;
  }

  res.status(403).json({
    error: {
      code: "FORBIDDEN_ORIGIN",
      message: "Origin not allowed"
    }
  });
});

app.options("/mcp", (_req, res) => {
  res.sendStatus(204);
});

app.post("/mcp", async (req, res, next) => {
  try {
    const sessionId = req.header("mcp-session-id");

    if (sessionId && transports[sessionId]) {
      await transports[sessionId].handleRequest(req, res, req.body);
      return;
    }

    if (!sessionId && isInitializeRequest(req.body)) {
      const transport = new NodeStreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          transports[id] = transport;
          logger.info({ sessionId: id }, "MCP session initialized");
        }
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
          logger.info({ sessionId: transport.sessionId }, "MCP session closed");
        }
      };

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Invalid session"
      },
      id: null
    });
  } catch (error) {
    next(error);
  }
});

app.get("/mcp", async (req, res, next) => {
  try {
    const sessionId = req.header("mcp-session-id");

    if (sessionId && transports[sessionId]) {
      await transports[sessionId].handleRequest(req, res);
      return;
    }

    res.status(400).send("Invalid session");
  } catch (error) {
    next(error);
  }
});

app.delete("/mcp", async (req, res, next) => {
  try {
    const sessionId = req.header("mcp-session-id");

    if (sessionId && transports[sessionId]) {
      await transports[sessionId].handleRequest(req, res);
      return;
    }

    res.status(400).send("Invalid session");
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(
    {
      port: env.PORT
    },
    `${env.MCP_SERVER_NAME} listening`
  );
});
