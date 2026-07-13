"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { SwipeDeck, type DeckItem } from "@/components/SwipeDeck";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { LogoGlyph } from "@/components/Logo";

interface Filters {
  sect: string;
  ethnicity: string;
  ageMin: string;
  ageMax: string;
  heightMin: string;
  heightMax: string;
  city: string;
  marital_status: string;
}

const SECTS = ["Any", "Sunni", "Shia", "Deobandi", "Barelvi", "Ahl-e-Hadith"];
const MARITAL = ["Any", "Never married", "Divorced", "Widowed"];

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [directoryProfiles, setDirectoryProfiles] = useState<any[]>([]);
  const [unlocks, setUnlocks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    sect: "Any",
    ethnicity: "",
    ageMin: "18",
    ageMax: "45",
    heightMin: "",
    heightMax: "",
    city: "",
    marital_status: "Any",
  });
  const [activeFilters, setActiveFilters] = useState<Filters | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    loadData(null);
  }, []);

  const applyFilters = () => {
    setActiveFilters({ ...filters });
    loadData({ ...filters });
    setShowFilters(false);
  };

  const clearFilters = () => {
    const reset: Filters = { sect: "Any", ethnicity: "", ageMin: "18", ageMax: "45", heightMin: "", heightMax: "", city: "", marital_status: "Any" };
    setFilters(reset);
    setActiveFilters(null);
    loadData(null);
    setShowFilters(false);
  };

  const loadData = async (f: Filters | null) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setCurrentUser(profile);

    // Build age range from date_of_birth
    const now = new Date();
    const ageMin = parseInt(f?.ageMin || "18");
    const ageMax = parseInt(f?.ageMax || "45");
    const dobMin = new Date(now.getFullYear() - ageMax - 1, now.getMonth(), now.getDate()).toISOString().split("T")[0];
    const dobMax = new Date(now.getFullYear() - ageMin, now.getMonth(), now.getDate()).toISOString().split("T")[0];

    // Load opposite gender approved profiles
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("is_approved", true)
      .neq("id", user.id);

    if (profile?.gender) query = query.neq("gender", profile.gender);
    if (f?.sect && f.sect !== "Any") query = query.eq("sect", f.sect);
    if (f?.marital_status && f.marital_status !== "Any") query = query.eq("marital_status", f.marital_status);
    if (f?.city) query = query.ilike("city", `%${f.city}%`);
    if (f?.ethnicity) query = query.ilike("ethnicity", `%${f.ethnicity}%`);
    if (f?.ageMin || f?.ageMax) {
      query = query.gte("date_of_birth", dobMin).lte("date_of_birth", dobMax);
    }
    if (f?.heightMin) query = query.gte("height_cm", parseInt(f.heightMin));
    if (f?.heightMax) query = query.lte("height_cm", parseInt(f.heightMax));

    // Boosted profiles first
    query = query.order("boosted_until", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });

    const { data: memberProfiles } = await query.limit(20);
    setProfiles(memberProfiles || []);

    // Load directory profiles
    const { data: dirProfiles } = await supabase
      .from("directory_profiles")
      .select("id, full_name, age, city, country, sect, ethnicity, education, profession, marital_status, about_me, avatar_url")
      .eq("is_active", true)
      .limit(10);

    setDirectoryProfiles(dirProfiles || []);

    // Load user's unlocks
    const { data: userUnlocks } = await supabase
      .from("unlocks")
      .select("directory_profile_id")
      .eq("user_id", user.id);

    setUnlocks(new Set(userUnlocks?.map((u: any) => u.directory_profile_id) || []));
    setLoading(false);
  };

  const handleLike = async (profileId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("likes").insert({ liker_id: user.id, liked_id: profileId });

    // Did this create a mutual match?
    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${user.id})`)
      .single();
    if (match) {
      toast("It's a match! Start a conversation.", "success");
    } else {
      toast("Liked", "success");
    }
  };

  const handleMessage = (profileId: string) => {
    // Find match and navigate
    router.push("/matches");
  };

  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleUnlock = (profileId: string) => {
    setUnlockTarget(profileId);
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

  // Interleave member and directory profiles
  const combined = [];
  const dirCopy = [...directoryProfiles];
  for (let i = 0; i < profiles.length; i++) {
    combined.push({ type: "member", data: profiles[i] });
    if (i % 3 === 2 && dirCopy.length > 0) {
      combined.push({ type: "directory", data: dirCopy.shift() });
    }
  }
  while (dirCopy.length > 0) {
    combined.push({ type: "directory", data: dirCopy.shift() });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pending review banner */}
      {currentUser && !currentUser.is_approved && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2">
          <span className="text-amber-600 text-sm">⏳</span>
          <p className="text-amber-800 text-xs font-medium">Your profile is under review. You can browse while we verify it — usually within 24 hours.</p>
        </div>
      )}
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-hairline sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoGlyph className="w-6 h-6" />
            <h1 className="text-2xl font-semibold text-ink tracking-tight">Discover</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`relative ${showFilters || activeFilters ? "bg-brand-50 text-brand-600" : ""}`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilters && <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full" />}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-100 px-4 py-4 bg-white">
            <div className="max-w-lg mx-auto grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Sect</Label>
                <Select value={filters.sect} onValueChange={(v) => setFilters((f) => ({ ...f, sect: v }))}>
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Marital Status</Label>
                <Select value={filters.marital_status} onValueChange={(v) => setFilters((f) => ({ ...f, marital_status: v }))}>
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">City</Label>
                <Input
                  className="mt-1 h-9 text-xs"
                  placeholder="Any city"
                  value={filters.city}
                  onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">Age Range</Label>
                <div className="flex gap-1 mt-1">
                  <Input className="h-9 text-xs" type="number" value={filters.ageMin} onChange={(e) => setFilters((f) => ({ ...f, ageMin: e.target.value }))} min={18} max={80} />
                  <span className="flex items-center text-gray-400 text-xs">–</span>
                  <Input className="h-9 text-xs" type="number" value={filters.ageMax} onChange={(e) => setFilters((f) => ({ ...f, ageMax: e.target.value }))} min={18} max={80} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Height (cm)</Label>
                <div className="flex gap-1 mt-1">
                  <Input className="h-9 text-xs" type="number" placeholder="Min" value={filters.heightMin} onChange={(e) => setFilters((f) => ({ ...f, heightMin: e.target.value }))} />
                  <span className="flex items-center text-gray-400 text-xs">–</span>
                  <Input className="h-9 text-xs" type="number" placeholder="Max" value={filters.heightMax} onChange={(e) => setFilters((f) => ({ ...f, heightMax: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Ethnicity</Label>
                <Input className="mt-1 h-9 text-xs" placeholder="e.g. Punjabi" value={filters.ethnicity} onChange={(e) => setFilters((f) => ({ ...f, ethnicity: e.target.value }))} />
              </div>
            </div>
            <div className="max-w-lg mx-auto flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={clearFilters}>Clear</Button>
              <Button size="sm" className="flex-1 bg-brand-600 hover:bg-brand-700" onClick={applyFilters}>Apply Filters</Button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-5 py-6">
        {loading ? (
          <div className="max-w-md mx-auto">
            <div className="h-[min(66vh,600px)] min-h-[430px] rounded-[20px] skeleton" />
            <div className="flex items-center justify-center gap-5 pt-6">
              <div className="w-14 h-14 rounded-full skeleton" />
              <div className="w-16 h-16 rounded-full skeleton" />
            </div>
          </div>
        ) : (
          <SwipeDeck
            items={combined as DeckItem[]}
            onLike={handleLike}
            onUnlock={handleUnlock}
            onOpenProfile={(id) => router.push(`/profile/${id}`)}
            emptyState={
              <>
                <h3 className="text-lg font-semibold text-ink">
                  {activeFilters ? "No matches for these filters" : "You're all caught up"}
                </h3>
                <p className="text-sm text-muted mt-2 max-w-xs">
                  {activeFilters
                    ? "Try widening your filters to see more people."
                    : "You've seen everyone for now. New members join every day — check back soon."}
                </p>
                {activeFilters && (
                  <Button variant="outline" size="sm" className="mt-5" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </>
            }
          />
        )}
      </div>

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Unlock Contact</h3>
              <button onClick={() => setShowUnlockModal(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Unlock this person's phone number for a one-time payment of <span className="font-bold text-gray-900">Rs 500</span>.
            </p>

            <div className="bg-brand-50 rounded-2xl p-4 mb-4">
              <p className="text-sm font-medium text-brand-800 mb-2">Accepted Payment Methods</p>
              <div className="flex gap-3">
                <div className="flex-1 bg-white rounded-xl p-3 text-center border border-brand-100">
                  <div className="text-2xl mb-1">💚</div>
                  <p className="text-xs font-medium">JazzCash</p>
                </div>
                <div className="flex-1 bg-white rounded-xl p-3 text-center border border-brand-100">
                  <div className="text-2xl mb-1">🟠</div>
                  <p className="text-xs font-medium">Easypaisa</p>
                </div>
                <div className="flex-1 bg-white rounded-xl p-3 text-center border border-brand-100">
                  <div className="text-2xl mb-1">💳</div>
                  <p className="text-xs font-medium">Visa/MC</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 mb-5">
              <p className="text-xs text-amber-700">
                💡 <span className="font-medium">Bundle deal:</span> Get 30 contacts for Rs 5,000 — save Rs 10,000!
              </p>
            </div>

            <Button
              className="w-full mb-3"
              disabled={paymentLoading}
              onClick={() => startPayment("unlock")}
            >
              {paymentLoading ? "Redirecting..." : "Pay Rs 500 — Unlock Contact"}
            </Button>

            <Button
              variant="outline"
              className="w-full mb-3 border-amber-300 text-amber-700 hover:bg-amber-50"
              disabled={paymentLoading}
              onClick={() => startPayment("bundle")}
            >
              Get 30 Contacts for Rs 5,000
            </Button>

            <button
              className="w-full text-center text-sm text-gray-400 mt-1 hover:text-gray-600"
              onClick={() => setShowUnlockModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
