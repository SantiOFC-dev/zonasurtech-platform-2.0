import { redirect } from "next/navigation";
import { AppShell } from "../../components/shell/AppShell";
import { getAuthenticatedUser, listUserTenants, setActiveTenantForUser } from "../../lib/auth";

function getSafeNextPath(next: string | string[] | undefined) {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default async function SelectTenantPage({
  searchParams
}: {
  searchParams?: { next?: string | string[] };
}) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const authenticatedUser = user;
  const availableTenants = await listUserTenants(authenticatedUser.userId);
  const nextPath = getSafeNextPath(searchParams?.next);

  async function setTenantAction(formData: FormData) {
    "use server";

    const tenantId = String(formData.get("tenant_id") ?? "");
    const redirectTo = getSafeNextPath(String(formData.get("next") ?? "/dashboard"));

    if (!tenantId) return;

    await setActiveTenantForUser(authenticatedUser.userId, tenantId);
    redirect(redirectTo);
  }

  return (
    <AppShell>
      <section className="max-w-2xl">
        <h1 className="mb-3 text-xl font-semibold">Select Tenant</h1>
        <p className="mb-4 text-sm text-slate-400">Choose the business context for this session.</p>

        <div className="space-y-3">
          {availableTenants.map((tenant) => (
            <form key={tenant.tenantId} action={setTenantAction} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <input type="hidden" name="tenant_id" value={tenant.tenantId} />
              <input type="hidden" name="next" value={nextPath} />

              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-medium">{tenant.commercialName ?? tenant.legalName}</h2>
                  <p className="text-sm text-slate-400">{tenant.tenantSlug}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div>Role: {tenant.role}</div>
                  <div>Plan: {tenant.planId}</div>
                </div>
              </div>

              <button type="submit" className="rounded-md bg-teal-500 px-3 py-2 text-sm font-medium text-slate-950">
                Continue with this tenant
              </button>
            </form>
          ))}

          {availableTenants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-400">
              No active memberships found for this account.
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}

