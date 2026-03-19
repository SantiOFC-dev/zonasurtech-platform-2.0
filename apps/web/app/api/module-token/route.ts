import { NextResponse } from "next/server";
import { buildModuleClaims, signModuleToken } from "../../../lib/token";
import { getModuleByKey } from "../../../lib/module-registry";
import { getAuthenticatedUser, getTenantContext } from "../../../lib/auth";
import { createSupabaseAdminClient } from "../../../lib/supabase/server";
import type { CreateModuleTokenRequest, CreateModuleTokenResponse } from "@zs/contracts";

const MODULE_TOKEN_TTL_SECONDS = 120;

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ code: "UNAUTHENTICATED", message: "Session is required." }, { status: 401 });
  }

  const tenant = await getTenantContext();
  if (!tenant) {
    return NextResponse.json({ code: "TENANT_REQUIRED", message: "Active tenant is required." }, { status: 400 });
  }

  let body: CreateModuleTokenRequest;
  try {
    body = (await req.json()) as CreateModuleTokenRequest;
  } catch {
    return NextResponse.json({ code: "INVALID_JSON", message: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body?.module_key || !body?.tenant_id) {
    return NextResponse.json({ code: "INVALID_PAYLOAD", message: "module_key and tenant_id are required." }, { status: 422 });
  }

  if (body.tenant_id !== tenant.tenantId) {
    return NextResponse.json({ code: "TENANT_MISMATCH", message: "tenant_id does not match active tenant." }, { status: 403 });
  }

  const moduleDef = getModuleByKey(body.module_key);
  if (!moduleDef) {
    return NextResponse.json({ code: "MODULE_NOT_FOUND", message: "Unknown module_key." }, { status: 404 });
  }

  if (moduleDef.status !== "active") {
    return NextResponse.json({ code: "MODULE_DISABLED", message: "Module is not available for launch." }, { status: 409 });
  }

  if (moduleDef.required_plan === "internal" && tenant.role !== "owner") {
    return NextResponse.json({ code: "FORBIDDEN", message: "Internal module is restricted." }, { status: 403 });
  }

  const jwtSecret = process.env.MODULE_TOKEN_SECRET;
  if (!jwtSecret) {
    return NextResponse.json({ code: "SERVER_MISCONFIGURED", message: "MODULE_TOKEN_SECRET is not configured." }, { status: 500 });
  }

  const claims = buildModuleClaims({
    userId: user.userId,
    tenantId: tenant.tenantId,
    tenantSlug: tenant.tenantSlug,
    role: tenant.role,
    moduleKey: moduleDef.module_key,
    planId: tenant.planId,
    ttlSeconds: MODULE_TOKEN_TTL_SECONDS
  });

  const admin = createSupabaseAdminClient();
  const { error: insertError } = await admin.from("module_sessions").insert({
    tenant_id: tenant.tenantId,
    user_id: user.userId,
    module_key: moduleDef.module_key,
    jti: claims.jti,
    expires_at: new Date(claims.exp * 1000).toISOString()
  });

  if (insertError) {
    return NextResponse.json({ code: "SESSION_PERSIST_FAILED", message: "Failed to persist module session." }, { status: 500 });
  }

  const token = signModuleToken(claims, jwtSecret);
  const exchangeUrl = `${moduleDef.external_url ?? ""}/auth/exchange`;

  const response: CreateModuleTokenResponse = {
    token_type: "Bearer",
    token,
    expires_in: MODULE_TOKEN_TTL_SECONDS,
    expires_at: new Date(claims.exp * 1000).toISOString(),
    module_key: moduleDef.module_key,
    exchange_url: exchangeUrl
  };

  return NextResponse.json(response, { status: 201 });
}

