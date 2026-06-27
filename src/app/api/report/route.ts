import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reportedId, reason } = await req.json();
  if (!reportedId || !reason) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await supabase.from("reports").upsert({ reporter_id: user.id, reported_id: reportedId, reason });

  return NextResponse.json({ success: true });
}
