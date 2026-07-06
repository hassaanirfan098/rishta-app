import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

// Creates the account server-side, already email-confirmed, so signup never
// depends on Supabase's (unreliable) confirmation email. The client then signs
// in with the same password to establish a session.
export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await admin.auth.admin.createUser({
    email: String(email).trim().toLowerCase(),
    password,
    email_confirm: true, // no verification email needed
  });

  if (error) {
    const msg = error.message || "";
    if (/already|registered|exists/i.test(msg)) {
      return NextResponse.json(
        { error: "That email is already registered. Please sign in instead." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: msg || "Sign up failed." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
