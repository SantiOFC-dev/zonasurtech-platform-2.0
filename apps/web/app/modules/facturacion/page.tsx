import { redirect } from "next/navigation";
import { AppShell } from "../../../components/shell/AppShell";
import { getTenantContext } from "../../../lib/auth";
import { BillingLaunchCard } from "./BillingLaunchCard";

function getSafeRedirectPath(path: string | string[] | undefined): string {
  const value = Array.isArray(path) ? path[0] : path;
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default async function BillingModulePage({
  searchParams,
}: {
  searchParams?: { redirect_path?: string | string[] };
}) {
  const tenant = await getTenantContext();
  if (!tenant) redirect("/select-tenant?next=/modules/facturacion");

  const redirectPath = getSafeRedirectPath(searchParams?.redirect_path);

  return (
    <AppShell>
      <BillingLaunchCard tenantId={tenant.tenantId} defaultRedirectPath={redirectPath} />
    </AppShell>
  );
}
