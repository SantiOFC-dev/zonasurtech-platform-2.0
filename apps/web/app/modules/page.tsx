import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "../../components/shell/AppShell";
import { MODULE_REGISTRY } from "../../lib/module-registry";

export default function ModulesPage() {
  return (
    <AppShell>
      <h1 className="mb-4 text-xl font-semibold">Modules</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {MODULE_REGISTRY.map((module) => (
          <article key={module.module_key} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-medium">{module.name}</h2>
              <span className="text-xs uppercase text-slate-400">{module.status}</span>
            </div>
            <p className="mb-3 text-sm text-slate-400">Type: {module.type}</p>
            <Link href={module.route as Route} className="text-sm text-teal-400 underline">Open module</Link>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
