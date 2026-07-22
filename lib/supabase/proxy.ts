import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { dashboardPrefix } from "@/lib/constants/site";
import { hasSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!hasSupabaseConfig()) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const protectedPath = request.nextUrl.pathname.startsWith(dashboardPrefix)
    || request.nextUrl.pathname.startsWith("/settings")
    || request.nextUrl.pathname.startsWith("/onboarding")
    || request.nextUrl.pathname.startsWith("/invitations/accept");

  if (protectedPath && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
