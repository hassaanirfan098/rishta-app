import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-sfpy-signature") || "";

  const expected = crypto
    .createHmac("sha256", process.env.SAFEPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  if (event.type !== "payment:created") return NextResponse.json({ ok: true });

  const orderId: string = event.data?.tracker?.order_id || "";
  // order_id format: "type_userId_timestamp"
  const [type, userId] = orderId.split("_");

  if (!userId || !type) return NextResponse.json({ ok: true });

  if (type === "unlock") {
    const profileId = event.data?.tracker?.metadata?.directoryProfileId;
    if (profileId) {
      await adminSupabase.from("unlocks").insert({ user_id: userId, directory_profile_id: profileId });
    }
  } else if (type === "bundle") {
    const { data: profile } = await adminSupabase.from("profiles").select("unlock_credits").eq("id", userId).single();
    await adminSupabase.from("profiles").update({ unlock_credits: (profile?.unlock_credits || 0) + 30 }).eq("id", userId);
  } else if (type === "gold_monthly") {
    const until = new Date();
    until.setMonth(until.getMonth() + 1);
    await adminSupabase.from("profiles").update({ is_gold: true, gold_until: until.toISOString() }).eq("id", userId);
  } else if (type === "gold_yearly") {
    const until = new Date();
    until.setFullYear(until.getFullYear() + 1);
    await adminSupabase.from("profiles").update({ is_gold: true, gold_until: until.toISOString() }).eq("id", userId);
  }

  await adminSupabase.from("payments").insert({
    user_id: userId,
    type,
    amount: event.data?.tracker?.amount,
    currency: "PKR",
    safepay_token: event.data?.tracker?.token,
    status: "paid",
  });

  return NextResponse.json({ ok: true });
}
