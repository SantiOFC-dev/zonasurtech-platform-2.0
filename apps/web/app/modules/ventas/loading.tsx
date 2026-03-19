import { AppShell } from "../../../components/shell/AppShell";

export default function SalesLoading() {
  return (
    <AppShell>
      <section className="mb-4">
        <div className="h-7 w-32 animate-pulse rounded bg-slate-800" />
      </section>
      <section className="mb-4 h-20 animate-pulse rounded-xl border border-slate-800 bg-slate-900" />
      <section className="h-72 animate-pulse rounded-xl border border-slate-800 bg-slate-900" />
    </AppShell>
  );
}
