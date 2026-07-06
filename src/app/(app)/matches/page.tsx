"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Heart, Lock, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateAge } from "@/lib/utils";
import { LogoGlyph } from "@/components/Logo";

export default function MatchesPage() {
  const [tab, setTab] = useState<"matches" | "liked">("matches");
  const [matches, setMatches] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*, is_gold, gold_until")
      .eq("id", user.id)
      .single();
    setCurrentUser(profile);

    const { data: matchData } = await supabase
      .from("matches")
      .select("id, created_at, user1_id, user2_id")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (matchData) {
      const enriched = await Promise.all(
        matchData.map(async (match) => {
          const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const { data: p } = await supabase
            .from("profiles")
            .select("id, full_name, date_of_birth, city, avatar_url, profession")
            .eq("id", otherId).single();
          return { ...match, otherProfile: p };
        })
      );
      setMatches(enriched);
    }

    const { data: likeData } = await supabase
      .from("likes")
      .select("liker_id, created_at")
      .eq("liked_id", user.id)
      .order("created_at", { ascending: false });

    if (likeData) {
      const enriched = await Promise.all(
        likeData.map(async (like) => {
          const { data: p } = await supabase
            .from("profiles")
            .select("id, full_name, date_of_birth, city, avatar_url")
            .eq("id", like.liker_id).single();
          return { ...like, profile: p };
        })
      );
      setLikes(enriched);
    }

    setLoading(false);
  };

  const isGold = currentUser?.is_gold && currentUser?.gold_until && new Date(currentUser.gold_until) > new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white/90 backdrop-blur-md border-b border-hairline sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-2.5 mb-4">
            <LogoGlyph className="w-6 h-6" />
            <h1 className="text-2xl font-semibold text-ink tracking-tight">Matches</h1>
          </div>
          <div className="flex bg-surface-soft rounded-lg p-1">
            <button
              onClick={() => setTab("matches")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === "matches" ? "bg-white text-ink shadow-card" : "text-muted"}`}
            >
              Matches {matches.length > 0 && `(${matches.length})`}
            </button>
            <button
              onClick={() => setTab("liked")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${tab === "liked" ? "bg-white text-ink shadow-card" : "text-muted"}`}
            >
              {!isGold && <Lock className="h-3.5 w-3.5" />}
              Liked You {likes.length > 0 && `(${likes.length})`}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-3xl skeleton" />
            ))}
          </div>
        ) : tab === "matches" ? (
          matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-10 w-10 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">No matches yet</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-xs">When you and someone both like each other, they will appear here</p>
              <Link href="/discover" className="mt-4 bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium">
                Start Discovering
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {matches.map((match) => {
                const profile = match.otherProfile;
                if (!profile) return null;
                const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
                return (
                  <Link
                    key={match.id}
                    href={`/chat/${match.id}`}
                    className="relative aspect-[3/4] rounded-[14px] overflow-hidden shadow-card bg-surface-strong group"
                  >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 text-5xl font-semibold">
                        {profile.full_name?.charAt(0) || ""}
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold text-base truncate drop-shadow">
                        {profile.full_name}{age && <span className="font-medium">, {age}</span>}
                      </h3>
                      {profile.city && <p className="text-white/80 text-xs truncate">{profile.city}</p>}
                    </div>
                    <div className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm group-active:scale-90 transition-transform">
                      <MessageCircle className="h-4.5 w-4.5 text-brand-600" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )
        ) : !isGold ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-6 flex justify-center">
              <div className="flex -space-x-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white" style={{filter:"blur(5px)"}} />
                ))}
              </div>
              {likes.length > 0 && (
                <div className="absolute -top-1 right-6 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{likes.length}</span>
                </div>
              )}
            </div>
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Crown className="h-7 w-7 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {likes.length > 0 ? `${likes.length} ${likes.length === 1 ? "person" : "people"} liked you` : "See who liked you"}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Upgrade to Gold to see who liked you and match instantly
            </p>
            <Link href="/gold" className="bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg">
              Upgrade to Gold
            </Link>
          </div>
        ) : likes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🤍</div>
            <h3 className="text-lg font-semibold text-gray-800">No likes yet</h3>
            <p className="text-sm text-gray-500 mt-2">Complete your profile to get more visibility</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {likes.map((like) => {
              const profile = like.profile;
              if (!profile) return null;
              const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
              return (
                <Link
                  key={like.liker_id}
                  href={`/profile/${profile.id}`}
                  className="relative aspect-[3/4] rounded-[14px] overflow-hidden shadow-card bg-surface-strong group"
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 text-5xl font-semibold">
                      {profile.full_name?.charAt(0) || ""}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-base truncate drop-shadow">
                      {profile.full_name}{age && <span className="font-medium">, {age}</span>}
                    </h3>
                    {profile.city && <p className="text-white/80 text-xs truncate">{profile.city}</p>}
                  </div>
                  <div className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
                    <Heart className="h-4.5 w-4.5 text-brand-500 fill-brand-500" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
