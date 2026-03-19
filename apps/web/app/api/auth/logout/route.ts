import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { clearActiveTenantCookies } from "../../../../lib/auth";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  await clearActiveTenantCookies();

  return NextResponse.redirect(new URL("/login", request.url), 303);
}
