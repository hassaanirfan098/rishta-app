import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { blockedId } = await req.json();
  if (!blockedId) return NextResponse.json({ error: "Missing blockedId" }, { status: 400 });

  await supabase.from("blocks").upsert({ blocker_id: user.id, blocked_id: blockedId });

  return NextResponse.json({ success: true });
}
