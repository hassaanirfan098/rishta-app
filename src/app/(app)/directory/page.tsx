"use client";

import { useState, useEffect } from "react";
import { Search, X, Package, Loader2 } from "lucide-react";
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
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: dirProfiles } = await supabase
      .from("directory_profiles")
      .select("id, full_name, age, city, country, sect, ethnicity, education, profession, marital_status, about_me, avatar_url")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setProfiles(dirProfiles || []);

    const { data: userUnlocks } = await supabase
      .from("unlocks")
      .select("directory_profile_id")
      .eq("user_id", user.id);

    setUnlocks(new Set(userUnlocks?.map((u: any) => u.directory_profile_id) || []));
    setLoading(false);
  };

  const handleUnlock = (id: string) => {
    setUnlockTarget(id);
    setShowUnlockModal(true);
  };

  const startPayment = async (type: "unlock" | "bundle") => {
    setPaymentLoading(true);
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, directoryProfileId: unlockTarget }),
    });
    const data = await res.json();
    setPaymentLoading(false);
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast("Payment setup failed. Please try again.", "error");
    }
  };

  const filtered = profiles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.profession?.toLowerCase().includes(q) ||
      p.sect?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <LogoGlyph className="w-5 h-5 text-brand-600" /> Directory
          </h1>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, city, profession..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pb-3">
          <button
            onClick={() => { setUnlockTarget(null); setShowUnlockModal(true); }}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-4 flex items-center gap-3"
          >
            <Package className="h-8 w-8 text-brand-100 shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white font-semibold text-sm">30 Contacts Bundle</p>
              <p className="text-brand-100 text-xs">Rs 5,000 — save Rs 10,000</p>
            </div>
            <span className="bg-white text-brand-700 text-xs font-bold px-3 py-1.5 rounded-xl shrink-0">Buy Bundle</span>
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-500">No profiles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((profile) => (
              <DirectoryCard
                key={profile.id}
                profile={profile}
                isUnlocked={unlocks.has(profile.id)}
                onUnlock={handleUnlock}
              />
            ))}
          </div>
        )}
      </div>

      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{unlockTarget ? "Unlock Contact" : "Buy Bundle"}</h3>
              <button onClick={() => setShowUnlockModal(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-5">
              {unlockTarget
                ? <>Get this person's phone number for <strong className="text-gray-900">Rs 500</strong>. Or get 30 contacts for <strong className="text-gray-900">Rs 5,000</strong>.</>
                : <>Get 30 contact unlocks for <strong className="text-gray-900">Rs 5,000</strong> — save Rs 10,000!</>
              }
            </p>

            <div className="bg-brand-50 rounded-2xl p-3 mb-5">
              <p className="text-xs font-medium text-brand-800 mb-2">Accepted payments</p>
              <div className="flex gap-2">
                {[{ icon: "💚", name: "JazzCash" }, { icon: "🟠", name: "Easypaisa" }, { icon: "💳", name: "Visa/MC" }].map((m) => (
                  <div key={m.name} className="flex-1 bg-white rounded-xl p-2 text-center border border-brand-100">
                    <div className="text-xl mb-0.5">{m.icon}</div>
                    <p className="text-[10px] font-medium">{m.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {unlockTarget && (
              <Button className="w-full mb-3" disabled={paymentLoading} onClick={() => startPayment("unlock")}>
                {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Pay Rs 500 — Unlock Contact
              </Button>
            )}
            <Button variant="outline" className="w-full border-brand-300 text-brand-700 hover:bg-brand-50" disabled={paymentLoading} onClick={() => startPayment("bundle")}>
              {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Buy 30 Contacts — Rs 5,000
            </Button>

            <button className="w-full text-center text-sm text-gray-400 mt-3 hover:text-gray-600" onClick={() => setShowUnlockModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
