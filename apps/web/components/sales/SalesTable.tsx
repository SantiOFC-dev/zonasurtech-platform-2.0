import type { CoreSalesItem } from "../../lib/core-api";

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(safe);
}

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-emerald-500/20 text-emerald-300";
    case "pending":
      return "bg-amber-500/20 text-amber-300";
    case "cancelled":
      return "bg-rose-500/20 text-rose-300";
    default:
      return "bg-slate-700 text-slate-300";
  }
}

export function SalesTable({ items }: { items: CoreSalesItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
      <table className="min-w-full text-sm">
        <thead className="border-b border-slate-800 bg-slate-950/40 text-left text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Metodo de pago</th>
          </tr>
        </thead>
        <tbody>
          {items.map((sale) => (
            <tr key={sale.id} className="border-b border-slate-800/70 last:border-b-0">
              <td className="px-4 py-3 text-slate-200">{formatDate(sale.createdAt)}</td>
              <td className="px-4 py-3 text-slate-300">{sale.saleNumber ?? "Sin referencia"}</td>
              <td className="px-4 py-3 text-slate-100">{formatMoney(sale.total)}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClass(sale.status)}`}>
                  {sale.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-300">{sale.paymentMethod ?? "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
