import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SAFEPAY_BASE = "https://api.getsafepay.com";

async function getSessionUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, directoryProfileId } = await req.json();
  // type: "unlock" | "bundle" | "gold_monthly" | "gold_yearly"

  const amounts: Record<string, number> = {
    unlock: 50000,       // Rs 500 in paisas
    bundle: 500000,      // Rs 5,000
    gold_monthly: 99900, // Rs 999
    gold_yearly: 799900, // Rs 7,999
  };

  const labels: Record<string, string> = {
    unlock: "Contact Unlock — Rs 500",
    bundle: "30 Contact Bundle — Rs 5,000",
    gold_monthly: "Gold Monthly — Rs 999",
    gold_yearly: "Gold Yearly — Rs 7,999",
  };

  const amount = amounts[type];
  if (!amount) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Create Safepay payment tracker
  const res = await fetch(`${SAFEPAY_BASE}/order/v1/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SFPY-MERCHANT-SECRET": process.env.SAFEPAY_SECRET_KEY!,
    },
    body: JSON.stringify({
      merchant_api_key: process.env.SAFEPAY_SECRET_KEY!,
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: "PKR",
      amount,
      order_id: `${type}_${user.id}_${Date.now()}`,
      source: "custom",
      cancel_url: `${appUrl}/payment/cancel`,
      redirect_url: `${appUrl}/payment/success?type=${type}&profile=${directoryProfileId || ""}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Safepay error:", err);
    return NextResponse.json({ error: "Payment init failed" }, { status: 500 });
  }

  const data = await res.json();
  const token = data?.data?.tracker?.token;

  if (!token) return NextResponse.json({ error: "No token from Safepay" }, { status: 500 });

  const checkoutUrl = `https://sandbox.api.getsafepay.com/checkout/pay?tbt=${token}&source=custom&order_id=${type}_${user.id}_${Date.now()}`;

  return NextResponse.json({ url: checkoutUrl, token });
}
