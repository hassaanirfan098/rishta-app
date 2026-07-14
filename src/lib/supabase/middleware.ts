import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Bureau model: Directory + Personalized Service. No member onboarding gate.
  const protectedPaths = ["/directory", "/personalized", "/requests", "/settings", "/profile", "/account"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/verify");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/submit-profile";
    return NextResponse.redirect(url);
  }

  // Show the intake form once after auth (skippable) before any other
  // protected page — but never re-trigger once submitted or skipped.
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("own_proposal_submitted, intake_skipped")
      .eq("id", user.id)
      .single();

    if (profile && !profile.own_proposal_submitted && !profile.intake_skipped) {
      const url = request.nextUrl.clone();
      url.pathname = "/submit-profile";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
