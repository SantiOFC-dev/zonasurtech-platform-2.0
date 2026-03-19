export type UserRole = "owner" | "admin" | "operator" | "viewer";

export type ModuleType = "native" | "external";
export type ModuleStatus = "active" | "beta" | "disabled";

export type ModuleKey =
  | "billing"
  | "sales"
  | "inventory"
  | "crm"
  | "chat"
  | "admin";

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  role: UserRole;
  planId: string;
}

export interface ModuleDefinition {
  module_key: ModuleKey;
  name: string;
  type: ModuleType;
  status: ModuleStatus;
  route: string;
  external_url: string | null;
  required_plan: "starter" | "growth" | "pro" | "internal";
  health_endpoint?: string;
}

export interface ModuleAccessTokenClaims {
  iss: "app.zonasurtech.online";
  aud: "zonasurtech-module";
  sub: string;
  tenant_id: string;
  tenant_slug: string;
  role: UserRole;
  module_key: ModuleKey;
  plan_id: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface PlanEntitlement {
  planId: "starter" | "growth" | "pro" | "internal";
  moduleKey: ModuleKey;
  featureKey: string;
  enabled: boolean;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  sessionId: string;
  role: UserRole;
  tenantId?: string;
}

export interface AppRouteGuard {
  route: string;
  requiresAuth: boolean;
  requiresTenant: boolean;
  allowedRoles?: UserRole[];
  requiredFeatureKeys?: string[];
}

export interface CreateModuleTokenRequest {
  module_key: ModuleKey;
  tenant_id: string;
}

export interface CreateModuleTokenResponse {
  token_type: "Bearer";
  token: string;
  expires_in: number;
  expires_at: string;
  module_key: ModuleKey;
  exchange_url: string;
}

export interface ModuleExchangeRequest {
  token: string;
}

export interface ModuleExchangeResponse {
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  user: {
    id: string;
    email?: string;
  };
  tenant: {
    id: string;
    slug: string;
  };
}
