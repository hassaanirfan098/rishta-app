import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  // Only callable server-side (from webhooks/triggers)
  const secret = req.headers.get("x-internal-secret");
  if (secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, title, body, url } = await req.json();

  const { data: sub } = await adminSupabase
    .from("push_subscriptions")
    .select("subscription")
    .eq("user_id", userId)
    .single();

  if (!sub?.subscription) return NextResponse.json({ ok: true, sent: false });

  try {
    await webpush.sendNotification(
      JSON.parse(sub.subscription),
      JSON.stringify({ title, body, url: url || "/" })
    );
    return NextResponse.json({ ok: true, sent: true });
  } catch (err: any) {
    if (err.statusCode === 410) {
      await adminSupabase.from("push_subscriptions").delete().eq("user_id", userId);
    }
    return NextResponse.json({ ok: true, sent: false });
  }
}
