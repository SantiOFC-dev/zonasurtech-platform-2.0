"use client";

import { useMemo, useState } from "react";
import type { CreateModuleTokenResponse } from "@zs/contracts";
import {
  assertBillingExchangeUrl,
  buildExchangeForm,
  mapModuleTokenError,
  sanitizeRedirectPath,
} from "../../../lib/module-launcher";

type LaunchError = {
  title: string;
  detail: string;
};

type ModuleTokenErrorPayload = {
  code?: string;
  message?: string;
};

export function BillingLaunchCard({
  tenantId,
  defaultRedirectPath,
}: {
  tenantId: string;
  defaultRedirectPath: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LaunchError | null>(null);

  const safeRedirectPath = useMemo(
    () => sanitizeRedirectPath(defaultRedirectPath),
    [defaultRedirectPath]
  );

  async function launchBillingModule() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/module-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          module_key: "billing",
          tenant_id: tenantId,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as ModuleTokenErrorPayload;
        const mapped = mapModuleTokenError(payload.code);
        setError({ title: mapped.title, detail: mapped.detail });
        setLoading(false);
        return;
      }

      const tokenPayload = (await response.json()) as CreateModuleTokenResponse;
      const exchangeUrl = assertBillingExchangeUrl(tokenPayload.exchange_url);

      const form = buildExchangeForm({
        exchangeUrl,
        token: tokenPayload.token,
        redirectPath: safeRedirectPath,
      });

      document.body.appendChild(form);
      form.submit();
    } catch (launchError) {
      const isInvalidExchange =
        launchError instanceof Error && launchError.message === "INVALID_EXCHANGE_URL";

      setError({
        title: isInvalidExchange ? "Destino de exchange invalido" : "No se pudo abrir Facturacion",
        detail: isInvalidExchange
          ? "El endpoint de exchange no coincide con el dominio permitido del modulo fiscal."
          : "No hubo respuesta del launcher. Verifica tu conexion y reintenta.",
      });
      setLoading(false);
    }
  }

  return (
    <section className="max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h1 className="mb-2 text-xl font-semibold">Facturacion</h1>
      <p className="mb-4 text-sm text-slate-400">
        Lanza el modulo fiscal con token exchange seguro y sesion local.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={launchBillingModule}
          disabled={loading}
          className="rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Abriendo Facturacion..." : "Abrir Facturacion"}
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            void launchBillingModule();
          }}
          disabled={loading}
          className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Reintentar
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-rose-500/40 bg-rose-500/10 p-3">
          <p className="text-sm font-medium text-rose-300">{error.title}</p>
          <p className="mt-1 text-sm text-rose-200">{error.detail}</p>
        </div>
      ) : null}

      <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
        Si el modulo fiscal responde 401/403/409 en exchange, veras el error directamente en el dominio fiscal.
        Usa Reintentar desde el hub para emitir un token nuevo.
      </div>
    </section>
  );
}
