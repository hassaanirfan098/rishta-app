"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { ProfileCard } from "@/components/ProfileCard";
import { DirectoryCard } from "@/components/DirectoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

interface Filters {
  sect: string;
  ethnicity: string;
  ageMin: string;
  ageMax: string;
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
    city: "",
    marital_status: "Any",
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockTarget, setUnlockTarget] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setCurrentUser(profile);

    // Load opposite gender approved profiles
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("is_approved", true)
      .neq("id", user.id);

    if (profile?.gender) {
      query = query.neq("gender", profile.gender);
    }

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
  };

  const handleMessage = (profileId: string) => {
    // Find match and navigate
    router.push("/matches");
  };

  const handleUnlock = (profileId: string) => {
    setUnlockTarget(profileId);
    setShowUnlockModal(true);
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
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              <span className="text-emerald-600">ر</span> Discover
            </h1>
            <p className="text-xs text-gray-400">Find your match</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-emerald-50 text-emerald-600" : ""}
          >
            <SlidersHorizontal className="h-5 w-5" />
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
                  <Input
                    className="h-9 text-xs"
                    type="number"
                    value={filters.ageMin}
                    onChange={(e) => setFilters((f) => ({ ...f, ageMin: e.target.value }))}
                    min={18} max={80}
                  />
                  <span className="flex items-center text-gray-400 text-xs">–</span>
                  <Input
                    className="h-9 text-xs"
                    type="number"
                    value={filters.ageMax}
                    onChange={(e) => setFilters((f) => ({ ...f, ageMax: e.target.value }))}
                    min={18} max={80}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Finding matches...</p>
            </div>
          </div>
        ) : combined.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🤍</div>
            <h3 className="text-lg font-semibold text-gray-800">No profiles yet</h3>
            <p className="text-sm text-gray-500 mt-2">
              Complete your profile to start discovering matches
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {combined.map((item, idx) =>
              item.type === "member" ? (
                <ProfileCard
                  key={item.data.id}
                  profile={item.data}
                  onLike={handleLike}
                  onMessage={handleMessage}
                />
              ) : (
                <DirectoryCard
                  key={item.data.id}
                  profile={item.data}
                  isUnlocked={unlocks.has(item.data.id)}
                  onUnlock={handleUnlock}
                />
              )
            )}
          </div>
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

            <div className="bg-emerald-50 rounded-2xl p-4 mb-5">
              <p className="text-sm font-medium text-emerald-800 mb-2">Payment Methods</p>
              <div className="flex gap-3">
                <div className="flex-1 bg-white rounded-xl p-3 text-center border border-emerald-100">
                  <div className="text-2xl mb-1">💚</div>
                  <p className="text-xs font-medium">JazzCash</p>
                </div>
                <div className="flex-1 bg-white rounded-xl p-3 text-center border border-emerald-100">
                  <div className="text-2xl mb-1">🟠</div>
                  <p className="text-xs font-medium">Easypaisa</p>
                </div>
                <div className="flex-1 bg-white rounded-xl p-3 text-center border border-emerald-100">
                  <div className="text-2xl mb-1">💳</div>
                  <p className="text-xs font-medium">Card</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 mb-5">
              <p className="text-xs text-amber-700">
                💡 <span className="font-medium">Bundle deal:</span> Get 30 contacts for Rs 5,000 — save Rs 10,000!
              </p>
            </div>

            <Button className="w-full" onClick={() => alert("Payment integration coming soon!")}>
              Pay Rs 500 — Coming Soon
            </Button>

            <button
              className="w-full text-center text-sm text-gray-400 mt-3 hover:text-gray-600"
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
