import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-internal-secret");
  if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return NextResponse.json({ ok: true, sent: false, reason: "no key" });

  const { to, subject, html } = await req.json();
  if (!to || !subject || !html) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Rishta <noreply@rishta.app>", to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ ok: false, error: err });
  }

  return NextResponse.json({ ok: true, sent: true });
}
