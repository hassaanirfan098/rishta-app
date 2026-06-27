import { NextResponse } from "next/server";

export async function GET() {
  const secretKey = process.env.SAFEPAY_SECRET_KEY;

  const res = await fetch("https://sandbox.api.getsafepay.com/order/v1/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SFPY-MERCHANT-SECRET": secretKey!,
    },
    body: JSON.stringify({
      merchant_api_key: secretKey,
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: "PKR",
      amount: 50000,
      order_id: `test_${Date.now()}`,
      cancel_url: "https://rishta-app-sigma.vercel.app/payment/cancel",
      redirect_url: "https://rishta-app-sigma.vercel.app/payment/success",
      client: "WEB",
      environment: "sandbox",
    }),
  });

  const text = await res.text();
  return NextResponse.json({ status: res.status, body: text, keyPrefix: secretKey?.slice(0, 8) });
}
