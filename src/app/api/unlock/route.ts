import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { directory_profile_id, payment_id, amount_pkr } = body;

  if (!directory_profile_id || !payment_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // TODO: Verify payment with payment gateway before creating unlock
  // For now, we just record the unlock after external payment verification

  const serviceClient = await createServiceClient();

  const { error } = await serviceClient.from("unlocks").insert({
    user_id: user.id,
    directory_profile_id,
    payment_id,
    amount_pkr: amount_pkr || 500,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch the phone via the DB function
  const { data, error: fnError } = await serviceClient.rpc("get_directory_phone", {
    p_profile_id: directory_profile_id,
  });

  if (fnError) {
    return NextResponse.json({ error: "Could not retrieve phone" }, { status: 500 });
  }

  return NextResponse.json({ phone: data });
}
