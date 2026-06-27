import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://rishta-app.vercel.app";
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function sendNotification(userId: string, title: string, body: string, url: string, email?: string, emailSubject?: string, emailHtml?: string) {
  const headers = { "Content-Type": "application/json", "x-internal-secret": SECRET };
  await fetch(`${BASE}/api/push/send`, { method: "POST", headers, body: JSON.stringify({ userId, title, body, url }) }).catch(() => {});
  if (email && emailSubject && emailHtml) {
    await fetch(`${BASE}/api/email/send`, { method: "POST", headers, body: JSON.stringify({ to: email, subject: emailSubject, html: emailHtml }) }).catch(() => {});
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { table, record, type } = await req.json();

  if (table === "matches" && type === "INSERT") {
    const { user1_id, user2_id } = record;
    const { data: profiles } = await admin.from("profiles").select("id, full_name, email").in("id", [user1_id, user2_id]);
    const p1 = profiles?.find((p: any) => p.id === user1_id);
    const p2 = profiles?.find((p: any) => p.id === user2_id);
    if (p1 && p2) {
      const url = `/chat/${record.id}`;
      await sendNotification(user1_id, "New Match! 💚", `You matched with ${p2.full_name}`, url, p1.email, `You matched with ${p2.full_name} on Rishta!`,
        `<p>Assalamu Alaikum ${p1.full_name},</p><p>You have a new match with <strong>${p2.full_name}</strong>!</p><p><a href="${BASE}${url}">Start chatting →</a></p>`);
      await sendNotification(user2_id, "New Match! 💚", `You matched with ${p1.full_name}`, url, p2.email, `You matched with ${p1.full_name} on Rishta!`,
        `<p>Assalamu Alaikum ${p2.full_name},</p><p>You have a new match with <strong>${p1.full_name}</strong>!</p><p><a href="${BASE}${url}">Start chatting →</a></p>`);
    }
  }

  if (table === "messages" && type === "INSERT") {
    const { match_id, sender_id, content } = record;
    const { data: match } = await admin.from("matches").select("user1_id, user2_id").eq("id", match_id).single();
    if (!match) return NextResponse.json({ ok: true });

    const recipientId = match.user1_id === sender_id ? match.user2_id : match.user1_id;
    const { data: profiles } = await admin.from("profiles").select("id, full_name, email").in("id", [sender_id, recipientId]);
    const sender = profiles?.find((p: any) => p.id === sender_id);
    const recipient = profiles?.find((p: any) => p.id === recipientId);

    if (sender && recipient) {
      const url = `/chat/${match_id}`;
      const preview = content.length > 60 ? content.slice(0, 60) + "…" : content;
      await sendNotification(recipientId, `${sender.full_name} sent a message`, preview, url, recipient.email,
        `New message from ${sender.full_name}`,
        `<p>Assalamu Alaikum ${recipient.full_name},</p><p><strong>${sender.full_name}</strong> sent you a message:</p><blockquote>${preview}</blockquote><p><a href="${BASE}${url}">Reply →</a></p>`);
    }
  }

  return NextResponse.json({ ok: true });
}
