import { redirect } from "next/navigation";
import { AppShell, EmptyState } from "../../../components/shell/AppShell";
import { DashboardAlert } from "../../../components/dashboard/DashboardWidgets";
import { SalesFiltersBar } from "../../../components/sales/SalesFiltersBar";
import { SalesTable } from "../../../components/sales/SalesTable";
import { getTenantContext } from "../../../lib/auth";
import { filterSales, getCoreAccessToken, getCoreSales, type SalesFilters } from "../../../lib/core-api";

function normalizeFilters(params?: {
  q?: string | string[];
  status?: string | string[];
  from?: string | string[];
  to?: string | string[];
}): SalesFilters {
  const toValue = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

  return {
    q: toValue(params?.q) ?? "",
    status: toValue(params?.status) ?? "all",
    from: toValue(params?.from) ?? "",
    to: toValue(params?.to) ?? "",
  };
}

export default async function SalesModulePage({
  searchParams,
}: {
  searchParams?: {
    q?: string | string[];
    status?: string | string[];
    from?: string | string[];
    to?: string | string[];
  };
}) {
  const tenant = await getTenantContext();
  if (!tenant) redirect("/select-tenant?next=/modules/ventas");

  const accessToken = await getCoreAccessToken();
  if (!accessToken) redirect("/login?next=/modules/ventas");

  const filters = normalizeFilters(searchParams);

  try {
    const sales = await getCoreSales({
      token: accessToken,
      organizationId: tenant.tenantId,
    });

    const filtered = filterSales(sales, filters);

    return (
      <AppShell>
        <section className="mb-4">
          <h1 className="text-xl font-semibold">Ventas</h1>
          <p className="text-sm text-slate-400">Tenant: {tenant.tenantSlug}</p>
        </section>

        <section className="mb-4">
          <SalesFiltersBar filters={filters} />
        </section>

        {filtered.length > 0 ? (
          <SalesTable items={filtered} />
        ) : (
          <EmptyState
            title="No hay ventas para los filtros aplicados"
            description="Ajusta busqueda, estado o rango de fechas para ver resultados."
          />
        )}
      </AppShell>
    );
  } catch {
    return (
      <AppShell>
        <section className="mb-4">
          <h1 className="text-xl font-semibold">Ventas</h1>
          <p className="text-sm text-slate-400">Tenant: {tenant.tenantSlug}</p>
        </section>

        <DashboardAlert
          title="No se pudo cargar Ventas"
          detail="El core API no respondio para este tenant. Reintenta en unos segundos."
        />

        <EmptyState
          title="Listado no disponible"
          description="No fue posible obtener el listado de ventas desde el backend core."
        />
      </AppShell>
    );
  }
}
