import { LoginForm } from "./LoginForm";

function getSafeNextPath(next: string | string[] | undefined) {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value) return "/select-tenant";
  if (!value.startsWith("/") || value.startsWith("//")) return "/select-tenant";
  return value;
}

export default function LoginPage({
  searchParams
}: {
  searchParams?: { next?: string | string[] };
}) {
  const nextPath = getSafeNextPath(searchParams?.next);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-3 text-2xl font-semibold">Login</h1>
      <p className="mb-4 text-sm text-slate-400">Sign in with your workspace credentials.</p>
      <LoginForm nextPath={nextPath} />
    </main>
  );
}
