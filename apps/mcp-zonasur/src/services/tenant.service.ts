import type { Request } from "express";
import { env } from "../config/env.js";

export const getTenantId = (request?: Pick<Request, "headers">): string => {
  const tenantFromHeader = request?.headers["x-tenant-id"];
  if (typeof tenantFromHeader === "string" && tenantFromHeader.trim().length > 0) {
    return tenantFromHeader.trim();
  }

  return env.DEFAULT_TENANT_ID;
};
