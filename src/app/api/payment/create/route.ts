import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use sandbox while in test mode
const SAFEPAY_BASE = "https://sandbox.api.getsafepay.com";
const CHECKOUT_BASE = "https://sandbox.api.getsafepay.com";

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

  const amounts: Record<string, number> = {
    unlock: 50000,
    bundle: 500000,
    gold_monthly: 99900,
    gold_yearly: 799900,
  };

  const amount = amounts[type];
  if (!amount) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const orderId = `${type}_${user.id}_${Date.now()}`;

  const res = await fetch(`${SAFEPAY_BASE}/order/v1/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SFPY-MERCHANT-SECRET": process.env.SAFEPAY_SECRET_KEY!,
    },
    body: JSON.stringify({
      merchant_api_key: process.env.SAFEPAY_SECRET_KEY,
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: "PKR",
      amount,
      order_id: orderId,
      cancel_url: `${appUrl}/payment/cancel`,
      redirect_url: `${appUrl}/payment/success?type=${type}&profile=${directoryProfileId || ""}`,
      client: "WEB",
      environment: "sandbox",
    }),
  });

  const responseText = await res.text();
  console.log("Safepay response:", res.status, responseText);

  if (!res.ok) {
    return NextResponse.json({ error: "Payment init failed", detail: responseText }, { status: 500 });
  }

  let data: any;
  try { data = JSON.parse(responseText); } catch { return NextResponse.json({ error: "Invalid response from Safepay" }, { status: 500 }); }

  const token = data?.data?.tracker?.token || data?.token;

  if (!token) return NextResponse.json({ error: "No token from Safepay", raw: data }, { status: 500 });

  const checkoutUrl = `${CHECKOUT_BASE}/checkout/pay?tbt=${token}&source=custom`;

  return NextResponse.json({ url: checkoutUrl, token });
}
