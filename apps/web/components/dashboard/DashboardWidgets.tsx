import Link from "next/link";
import type { Route } from "next";
import type { DashboardSnapshot } from "../../lib/core-api";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardAlert({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mb-4 rounded-md border border-amber-500/50 bg-amber-500/10 p-3">
      <p className="text-sm font-medium text-amber-300">{title}</p>
      <p className="mt-1 text-sm text-amber-200">{detail}</p>
    </div>
  );
}

export function SalesTodayWidget({ data }: { data: DashboardSnapshot }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Ventas del dia</p>
      <p className="mt-2 text-2xl font-semibold">{formatCurrency(data.salesTodayAmount)}</p>
      <p className="mt-1 text-sm text-slate-400">{data.salesTodayCount} ventas completadas hoy</p>
    </article>
  );
}

export function LowStockWidget({ data }: { data: DashboardSnapshot }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Stock bajo</p>
      <p className="mt-2 text-2xl font-semibold">{data.lowStockCount}</p>
      {data.lowStockItems.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">No hay productos en nivel critico.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm text-slate-300">
          {data.lowStockItems.slice(0, 3).map((item) => (
            <li key={item.id} className="flex items-center justify-between">
              <span>{item.name}</span>
              <span className="text-rose-300">{item.currentQuantity}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function LeadsTasksWidget({ data }: { data: DashboardSnapshot }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Leads y tareas abiertas</p>
      <p className="mt-2 text-2xl font-semibold">{data.openLeadsCount}</p>
      <p className="mt-1 text-sm text-slate-400">{data.openTasksCount} seguimientos pendientes</p>
    </article>
  );
}

export function BillingStatusWidget({ data }: { data: DashboardSnapshot }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Facturacion</p>
      <p className="mt-2 text-lg font-semibold">{data.billingStatusLabel}</p>
      {data.billingEnabled ? (
        <Link
          href={"/modules/facturacion" as Route}
          className="mt-3 inline-flex rounded-md bg-teal-500 px-3 py-2 text-sm font-medium text-slate-950"
        >
          Abrir Facturacion
        </Link>
      ) : (
        <Link
          href={"/settings/billing" as Route}
          className="mt-3 inline-flex rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200"
        >
          Ver plan y habilitar
        </Link>
      )}
    </article>
  );
}
