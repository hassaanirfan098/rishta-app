const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://rishta-app.vercel.app";
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function notifyUser(userId: string, opts: {
  title: string;
  body: string;
  url?: string;
  email?: string;
  emailSubject?: string;
  emailHtml?: string;
}) {
  const headers = { "Content-Type": "application/json", "x-internal-secret": SECRET };

  await fetch(`${BASE}/api/push/send`, {
    method: "POST",
    headers,
    body: JSON.stringify({ userId, title: opts.title, body: opts.body, url: opts.url }),
  }).catch(() => {});

  if (opts.email && opts.emailSubject && opts.emailHtml) {
    await fetch(`${BASE}/api/email/send`, {
      method: "POST",
      headers,
      body: JSON.stringify({ to: opts.email, subject: opts.emailSubject, html: opts.emailHtml }),
    }).catch(() => {});
  }
}
