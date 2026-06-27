import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Raw fetch to see exactly what Supabase returns
  let rawResponse: unknown = null;
  try {
    const res = await fetch(`${url}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ email: "debugtest@example.com", password: "debug12345" }),
    });
    rawResponse = { status: res.status, body: await res.text() };
  } catch (e: unknown) {
    rawResponse = { fetchError: String(e) };
  }

  // Also test via SDK
  const supabase = createClient(url, key);
  const { data, error } = await supabase.auth.signUp({
    email: "debugtest2@example.com",
    password: "debug12345",
  });

  return NextResponse.json({
    env: {
      url: url ? "set" : "MISSING",
      key: key ? key.slice(0, 20) + "..." : "MISSING",
    },
    rawFetch: rawResponse,
    sdkResult: {
      user: data?.user?.id ?? null,
      errorMessage: error?.message ?? null,
      errorName: error?.name ?? null,
      errorStatus: (error as any)?.status ?? null,
      errorCode: (error as any)?.code ?? null,
      errorStringified: error ? JSON.stringify(error) : null,
      errorToString: error ? String(error) : null,
    },
  });
}
