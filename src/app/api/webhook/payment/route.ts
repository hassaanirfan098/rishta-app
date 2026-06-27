import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Payment webhook endpoint.
 * When JazzCash/Easypaisa confirms a payment, this route:
 * 1. Verifies the webhook signature (TODO: add signature check for your provider)
 * 2. Records the unlock or subscription in the DB
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  // TODO: Verify webhook signature based on payment provider
  // const signature = request.headers.get("x-jazzcash-signature");

  const { type, payment_id, user_id, directory_profile_id, amount_pkr, tier } = body;

  const supabase = await createServiceClient();

  if (type === "unlock") {
    const { error } = await supabase.from("unlocks").insert({
      user_id,
      directory_profile_id,
      payment_id,
      amount_pkr,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (type === "subscription") {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

    const { error } = await supabase.from("subscriptions").insert({
      user_id,
      tier: tier || "gold",
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      payment_id,
      amount_pkr,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
