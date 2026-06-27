import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    url!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "no session", hasServiceKey: !!serviceKey, urlSet: !!url });

  const adminSupabase = createClient(url!, serviceKey!);
  const { data, error } = await adminSupabase.from("profiles").select("id, is_admin").eq("id", user.id).single();

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    hasServiceKey: !!serviceKey,
    profileData: data,
    profileError: error?.message,
  });
}
