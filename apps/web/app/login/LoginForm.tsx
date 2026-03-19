"use client";

import type { Route } from "next";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(nextPath as Route);
    router.refresh();
  }

  return (
    <>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-md border border-slate-700 bg-slate-900 p-2"
          placeholder="email@company.com"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          className="w-full rounded-md border border-slate-700 bg-slate-900 p-2"
          placeholder="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-teal-500 p-2 font-medium text-slate-950 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
    </>
  );
}
