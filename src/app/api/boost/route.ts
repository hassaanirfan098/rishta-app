import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("is_gold, gold_until").eq("id", user.id).single();
  const isGold = profile?.is_gold && profile?.gold_until && new Date(profile.gold_until) > new Date();
  if (!isGold) return NextResponse.json({ error: "Gold required" }, { status: 403 });

  const boostedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("profiles").update({ boosted_until: boostedUntil }).eq("id", user.id);

  return NextResponse.json({ success: true, boosted_until: boostedUntil });
}
