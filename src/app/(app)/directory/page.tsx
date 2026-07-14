"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Heart } from "lucide-react";
import { DirectoryCard } from "@/components/DirectoryCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { LogoGlyph } from "@/components/Logo";

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [unlocks, setUnlocks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [target, setTarget] = useState<any | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [ownProposalSubmitted, setOwnProposalSubmitted] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: me } = await supabase.from("profiles").select("own_proposal_submitted").eq("id", user.id).single();
    setOwnProposalSubmitted(!!me?.own_proposal_submitted);

    const { data: dirProfiles } = await supabase
      .from("directory_profiles")
      .select("id, full_name, age, city, country, sect, ethnicity, education, profession, marital_status, about_me, avatar_url, reference_code, is_featured")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    setProfiles(dirProfiles || []);

    const { data: userUnlocks } = await supabase
      .from("unlocks")
      .select("directory_profile_id")
      .eq("user_id", user.id);

    setUnlocks(new Set(userUnlocks?.map((u: any) => u.directory_profile_id) || []));
    setLoading(false);
  };

  const openProposal = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    setTarget(p || null);
    setShowModal(true);
  };

  const startPayment = async (type: "unlock" | "bundle") => {
    if (!ownProposalSubmitted) {
      setShowModal(false);
      router.push(`/submit-profile?next=${encodeURIComponent("/directory")}`);
      return;
    }
    setPaymentLoading(true);
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, directoryProfileId: target?.id }),
    });
    const data = await res.json();
    setPaymentLoading(false);
    if (data.url) window.location.href = data.url;
    else toast("Payment setup failed. Please try again.", "error");
  };

  const expressInterest = async () => {
    if (!target) return;
    setInterestLoading(true);
    const res = await fetch("/api/express-interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directoryProfileId: target.id }),
    });
    setInterestLoading(false);
    setShowModal(false);
    if (res.ok) toast("Interest sent — our team will be in touch.", "success");
    else toast("Could not send interest. Try again.", "error");
  };

  const filtered = profiles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase().replace("#", "");
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.profession?.toLowerCase().includes(q) ||
      p.sect?.toLowerCase().includes(q) ||
      p.reference_code?.toLowerCase().replace("#", "").includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-white/90 backdrop-blur-md border-b border-hairline sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5 mb-3">
            <LogoGlyph className="w-6 h-6" />
            <h1 className="text-2xl font-semibold text-ink tracking-tight">Browse</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search name, city, or code (e.g. #A-102)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-hairline text-sm text-ink placeholder:text-muted focus:outline-none focus:border-2 focus:border-ink bg-white"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-5">
        <a
          href="/submit-profile"
          className="flex items-center justify-between rounded-[14px] border border-hairline p-4 mb-2 hover:bg-surface-soft transition-colors"
        >
          <div>
            <p className="font-medium text-ink text-sm">Have a proposal to submit?</p>
            <p className="text-xs text-muted mt-0.5">Add a profile to our directory for review.</p>
          </div>
          <span className="text-sm font-medium text-brand-600 shrink-0">Submit →</span>
        </a>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-8">
            {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-[4/5] rounded-[14px] skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ink font-semibold">No proposals found</p>
            <p className="text-sm text-muted mt-1">Try a different search or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-8">
            {filtered.map((profile) => (
              <DirectoryCard
                key={profile.id}
                profile={profile}
                isUnlocked={unlocks.has(profile.id)}
                onUnlock={openProposal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Proposal action sheet */}
      {showModal && target && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-semibold text-ink">{target.full_name}{target.age ? `, ${target.age}` : ""}</h3>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-muted" /></button>
            </div>
            {target.reference_code && <p className="text-xs text-muted mb-4">Ref {target.reference_code}</p>}

            <p className="text-sm text-body mb-5">
              {ownProposalSubmitted
                ? <>Unlock this person's phone number for <strong className="text-ink">Rs 500</strong>, or send an interest and our team will help arrange it.</>
                : <>To unlock a contact, please first submit your own proposal — it only takes a minute and all details stay private.</>}
            </p>

            <Button className="w-full mb-3" disabled={paymentLoading} onClick={() => startPayment("unlock")}>
              {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Unlock contact — Rs 500
            </Button>
            <Button variant="outline" className="w-full" disabled={interestLoading} onClick={expressInterest}>
              {interestLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
              Express interest
            </Button>
            <button className="w-full text-center text-sm text-muted mt-4 hover:text-ink" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
