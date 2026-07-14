"use client";

import { useState, useEffect } from "react";
import { Phone, ClipboardList, BookOpen } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { LogoGlyph } from "@/components/Logo";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  new: { label: "Received", cls: "bg-surface-strong text-ink" },
  in_progress: { label: "In progress", cls: "bg-brand-50 text-brand-700" },
  matched: { label: "Matched", cls: "bg-brand-600 text-white" },
  closed: { label: "Closed", cls: "bg-surface-strong text-muted" },
};

export default function RequestsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Unlocked contacts
      const { data: unlocks } = await supabase
        .from("unlocks")
        .select("directory_profile_id")
        .eq("user_id", user.id);

      const rows: { id: string; name: string; phone: string }[] = [];
      for (const u of unlocks || []) {
        const { data: prof } = await supabase
          .from("directory_profiles")
          .select("full_name")
          .eq("id", u.directory_profile_id)
          .single();
        const { data: phone } = await supabase.rpc("get_directory_phone", { p_profile_id: u.directory_profile_id });
        rows.push({ id: u.directory_profile_id, name: prof?.full_name || "Contact", phone: (phone as string) || "" });
      }
      setContacts(rows);

      // Personalized service requests
      const { data: reqs } = await supabase
        .from("service_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRequests(reqs || []);

      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-white/90 backdrop-blur-md border-b border-hairline sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-2.5">
          <LogoGlyph className="w-6 h-6" />
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Requests</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-[14px] skeleton" />)}
          </div>
        ) : (
          <>
            {/* Unlocked contacts */}
            <section>
              <h2 className="font-semibold text-ink mb-3">Unlocked contacts</h2>
              {contacts.length === 0 ? (
                <div className="rounded-[14px] border border-hairline p-6 text-center">
                  <p className="text-sm text-muted">No unlocked contacts yet.</p>
                  <Link href="/directory" className="inline-flex items-center gap-1.5 text-sm text-brand-600 font-medium mt-2">
                    <BookOpen className="h-4 w-4" /> Browse the directory
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-[14px] border border-hairline p-4">
                      <div>
                        <p className="font-medium text-ink">{c.name}</p>
                        <p className="text-sm text-muted">{c.phone || "Contact unlocked"}</p>
                      </div>
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                          <Phone className="h-4.5 w-4.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Personalized requests */}
            <section>
              <h2 className="font-semibold text-ink mb-3">Personalized requests</h2>
              {requests.length === 0 ? (
                <div className="rounded-[14px] border border-hairline p-6 text-center">
                  <p className="text-sm text-muted">You haven't requested our matchmaking service yet.</p>
                  <Link href="/personalized" className="inline-flex items-center gap-1.5 text-sm text-brand-600 font-medium mt-2">
                    <ClipboardList className="h-4 w-4" /> Request personalized matchmaking
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((r) => {
                    const s = STATUS_LABEL[r.status] || STATUS_LABEL.new;
                    return (
                      <div key={r.id} className="rounded-[14px] border border-hairline p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-ink capitalize">{r.package || "Matchmaking"} package</p>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                        </div>
                        <p className="text-sm text-muted mt-1">
                          Looking for {r.looking_for === "female" ? "a bride" : r.looking_for === "male" ? "a groom" : "a match"}
                          {r.city ? ` · ${r.city}` : ""}{r.age_range ? ` · ${r.age_range}` : ""}
                        </p>
                        <p className="text-xs text-muted mt-1">Submitted {new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
