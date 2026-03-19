import { redirect } from "next/navigation";
import { AppShell, EmptyState } from "../../components/shell/AppShell";
import { getTenantContext } from "../../lib/auth";
import { getCoreAccessToken, getDashboardSnapshot } from "../../lib/core-api";
import {
  BillingStatusWidget,
  DashboardAlert,
  LeadsTasksWidget,
  LowStockWidget,
  SalesTodayWidget,
} from "../../components/dashboard/DashboardWidgets";

export default async function DashboardPage() {
  const tenant = await getTenantContext();
  if (!tenant) redirect("/select-tenant?next=/dashboard");

  const accessToken = await getCoreAccessToken();
  if (!accessToken) redirect("/login?next=/dashboard");

  try {
    const snapshot = await getDashboardSnapshot({
      token: accessToken,
      organizationId: tenant.tenantId,
      planId: tenant.planId,
    });

    return (
      <AppShell>
        <section className="mb-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-400">Tenant: {tenant.tenantSlug}</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SalesTodayWidget data={snapshot} />
          <LowStockWidget data={snapshot} />
          <LeadsTasksWidget data={snapshot} />
          <BillingStatusWidget data={snapshot} />
        </section>

        {snapshot.salesTodayCount === 0 && snapshot.lowStockCount === 0 && snapshot.openLeadsCount === 0 ? (
          <section className="mt-4">
            <EmptyState
              title="Todavia no hay actividad de negocio"
              description="Registra una venta, agrega inventario o crea un lead para activar el dashboard."
            />
          </section>
        ) : null}
      </AppShell>
    );
  } catch (error) {
    return (
      <AppShell>
        <DashboardAlert
          title="No se pudo cargar el dashboard"
          detail="El core API no respondio para este tenant. Reintenta en unos segundos o valida la conectividad del backend."
        />
        <EmptyState
          title="Datos no disponibles"
          description="No se pudieron obtener ventas, inventario y CRM desde el core en este momento."
        />
      </AppShell>
    );
  }
}
