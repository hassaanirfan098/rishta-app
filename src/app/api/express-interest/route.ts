import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { directoryProfileId, message } = await req.json();
  if (!directoryProfileId) return NextResponse.json({ error: "Missing proposal" }, { status: 400 });

  const { error } = await supabase.from("inquiries").insert({
    user_id: user.id,
    directory_profile_id: directoryProfileId,
    message: message || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
