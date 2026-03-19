import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";

const nav: Array<{ href: Route; label: string }> = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/modules", label: "Modules" },
  { href: "/modules/ventas", label: "Ventas" },
  { href: "/modules/inventario", label: "Inventario" },
  { href: "/modules/crm", label: "CRM" },
  { href: "/modules/facturacion", label: "Facturacion" },
  { href: "/settings/team", label: "Team" },
  { href: "/settings/billing", label: "Billing" }
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/60 p-4 hidden md:block">
      <div className="mb-6 text-lg font-semibold">ZonaSurTech</div>
      <nav className="space-y-1">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function TenantSwitcher() {
  return (
    <Link href="/select-tenant" className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm hover:bg-slate-800">
      Switch tenant
    </Link>
  );
}

export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
      <TenantSwitcher />
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span>Authenticated session</span>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="rounded-md border border-slate-700 px-3 py-1.5 hover:bg-slate-800">
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}

export function HealthBadge({ status }: { status: "healthy" | "degraded" | "down" }) {
  const color = status === "healthy" ? "bg-emerald-500" : status === "degraded" ? "bg-amber-500" : "bg-rose-500";
  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-slate-950 ${color}`}>{status}</span>;
}

export function ModuleCard({ title, description, status }: { title: string; description: string; status: "healthy" | "degraded" | "down" }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <HealthBadge status={status} />
      </div>
      <p className="text-sm text-slate-400">{description}</p>
    </article>
  );
}

export function QuickActions() {
  const actions = ["New sale", "Create invoice", "Add product", "New lead"];
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 font-medium">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        {actions.map((item) => (
          <button key={item} className="rounded-md bg-teal-500 px-3 py-2 text-sm font-medium text-slate-950">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
      <h3 className="mb-2 font-medium">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 md:flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
