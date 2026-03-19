import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3005),
  MCP_SERVER_NAME: z.string().min(2).default("zonasur-mcp"),
  MCP_SERVER_VERSION: z.string().min(1).default("1.0.0"),
  MCP_API_KEY: z.string().min(8),
  MCP_ALLOWED_ORIGINS: z.string().default(""),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  DEFAULT_TENANT_ID: z.string().min(2).default("tenant_default")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment variables:\n${errors.join("\n")}`);
}

export const env = {
  ...parsed.data,
  allowedOrigins: parsed.data.MCP_ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
};
