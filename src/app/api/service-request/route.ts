import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { full_name, phone, looking_for, age_range, city, sect, requirements, package: pkg } = body;

  if (!full_name || !phone) {
    return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
  }

  const { error } = await supabase.from("service_requests").insert({
    user_id: user.id,
    full_name,
    phone,
    looking_for,
    age_range,
    city,
    sect,
    requirements,
    package: pkg,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
