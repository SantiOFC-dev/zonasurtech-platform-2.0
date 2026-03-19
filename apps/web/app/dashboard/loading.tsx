import { AppShell } from "../../components/shell/AppShell";

export default function DashboardLoading() {
  return (
    <AppShell>
      <section className="mb-4">
        <div className="h-7 w-40 animate-pulse rounded bg-slate-800" />
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-36 animate-pulse rounded-xl border border-slate-800 bg-slate-900" />
        ))}
      </section>
    </AppShell>
  );
}
