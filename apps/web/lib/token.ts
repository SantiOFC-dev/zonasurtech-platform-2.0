import { createHmac, randomUUID } from "node:crypto";
import type { ModuleAccessTokenClaims } from "@zs/contracts";

function base64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

export function signModuleToken(claims: ModuleAccessTokenClaims, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(claims));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function buildModuleClaims(input: {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  role: ModuleAccessTokenClaims["role"];
  moduleKey: ModuleAccessTokenClaims["module_key"];
  planId: string;
  ttlSeconds: number;
}): ModuleAccessTokenClaims {
  const now = Math.floor(Date.now() / 1000);
  return {
    iss: "app.zonasurtech.online",
    aud: "zonasurtech-module",
    sub: input.userId,
    tenant_id: input.tenantId,
    tenant_slug: input.tenantSlug,
    role: input.role,
    module_key: input.moduleKey,
    plan_id: input.planId,
    jti: randomUUID(),
    iat: now,
    exp: now + input.ttlSeconds
  };
}

