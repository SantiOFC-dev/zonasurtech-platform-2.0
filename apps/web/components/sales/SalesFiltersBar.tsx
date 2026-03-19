import type { SalesFilters } from "../../lib/core-api";

export function SalesFiltersBar({
  filters,
}: {
  filters: SalesFilters;
}) {
  return (
    <form method="GET" className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-4">
      <input
        type="text"
        name="q"
        defaultValue={filters.q ?? ""}
        placeholder="Buscar por numero o pago"
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
      />

      <select
        name="status"
        defaultValue={filters.status ?? "all"}
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
      >
        <option value="all">Todos los estados</option>
        <option value="completed">Completada</option>
        <option value="pending">Pendiente</option>
        <option value="draft">Borrador</option>
        <option value="cancelled">Cancelada</option>
      </select>

      <input
        type="date"
        name="from"
        defaultValue={filters.from ?? ""}
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
      />

      <div className="flex gap-2">
        <input
          type="date"
          name="to"
          defaultValue={filters.to ?? ""}
          className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-teal-500 px-3 py-2 text-sm font-medium text-slate-950"
        >
          Filtrar
        </button>
      </div>
    </form>
  );
}
