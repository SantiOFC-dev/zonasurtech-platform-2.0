import type { AuthenticatedUser, TenantContext, UserRole } from "@zs/contracts";
import { cookies } from "next/headers";
import { createSupabaseAdminClient, createSupabaseServerClient } from "./supabase/server";

type MembershipRow = {
  tenant_id: string;
  role: UserRole;
  status: string;
};

type TenantRow = {
  id: string;
  slug: string;
  legal_name: string;
  commercial_name: string | null;
  status: string;
};

type SubscriptionRow = {
  tenant_id: string;
  plan_id: string;
  status: string;
  current_period_end: string | null;
};

export type UserTenant = {
  tenantId: string;
  tenantSlug: string;
  legalName: string;
  commercialName: string | null;
  role: UserRole;
  planId: string;
};

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return {
    userId: user.id,
    email: user.email ?? "",
    sessionId: session?.access_token ?? `session-${user.id}`,
    role: ((cookies().get("zs_user_role")?.value as UserRole | undefined) ?? "viewer")
  };
}

export async function listUserTenants(userId: string): Promise<UserTenant[]> {
  const admin = createSupabaseAdminClient();

  const { data: memberships, error: membershipsError } = await admin
    .from("memberships")
    .select("tenant_id, role, status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (membershipsError) throw membershipsError;

  const membershipRows = (memberships ?? []) as MembershipRow[];
  if (membershipRows.length === 0) return [];

  const tenantIds = membershipRows.map((row) => row.tenant_id);

  const { data: tenants, error: tenantsError } = await admin
    .from("tenants")
    .select("id, slug, legal_name, commercial_name, status")
    .in("id", tenantIds)
    .eq("status", "active");

  if (tenantsError) throw tenantsError;

  const { data: subscriptions, error: subsError } = await admin
    .from("tenant_subscriptions")
    .select("tenant_id, plan_id, status, current_period_end")
    .in("tenant_id", tenantIds)
    .order("created_at", { ascending: false });

  if (subsError) throw subsError;

  const tenantRows = (tenants ?? []) as TenantRow[];
  const subscriptionRows = (subscriptions ?? []) as SubscriptionRow[];

  const membershipByTenant = new Map<string, MembershipRow>();
  membershipRows.forEach((row) => {
    if (!membershipByTenant.has(row.tenant_id)) {
      membershipByTenant.set(row.tenant_id, row);
    }
  });

  const subscriptionByTenant = new Map<string, SubscriptionRow>();
  subscriptionRows.forEach((row) => {
    if (!subscriptionByTenant.has(row.tenant_id) && row.status === "active") {
      subscriptionByTenant.set(row.tenant_id, row);
    }
  });

  return tenantRows
    .map((tenant) => {
      const membership = membershipByTenant.get(tenant.id);
      if (!membership) return null;

      return {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        legalName: tenant.legal_name,
        commercialName: tenant.commercial_name,
        role: membership.role,
        planId: subscriptionByTenant.get(tenant.id)?.plan_id ?? "starter"
      } satisfies UserTenant;
    })
    .filter((item): item is UserTenant => item !== null);
}

export async function setActiveTenantForUser(userId: string, tenantId: string): Promise<TenantContext> {
  const tenants = await listUserTenants(userId);
  const selected = tenants.find((item) => item.tenantId === tenantId);

  if (!selected) {
    throw new Error("Tenant does not belong to the authenticated user.");
  }

  const cookieStore = cookies();
  cookieStore.set("zs_active_tenant", selected.tenantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  cookieStore.set("zs_active_tenant_slug", selected.tenantSlug, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  cookieStore.set("zs_plan_id", selected.planId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  cookieStore.set("zs_user_role", selected.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return {
    tenantId: selected.tenantId,
    tenantSlug: selected.tenantSlug,
    role: selected.role,
    planId: selected.planId
  };
}

export async function clearActiveTenantCookies() {
  const cookieStore = cookies();
  cookieStore.delete("zs_active_tenant");
  cookieStore.delete("zs_active_tenant_slug");
  cookieStore.delete("zs_plan_id");
  cookieStore.delete("zs_user_role");
}

export async function getTenantContext(): Promise<TenantContext | null> {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const tenantId = cookies().get("zs_active_tenant")?.value;
  if (!tenantId) return null;

  const tenants = await listUserTenants(user.userId);
  const selected = tenants.find((item) => item.tenantId === tenantId);

  if (!selected) {
    await clearActiveTenantCookies();
    return null;
  }

  return {
    tenantId: selected.tenantId,
    tenantSlug: selected.tenantSlug,
    role: selected.role,
    planId: selected.planId
  };
}



