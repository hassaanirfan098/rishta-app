"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Heart, Lock, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateAge } from "@/lib/utils";
import { ListSkeleton } from "@/components/Skeletons";
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
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <LogoGlyph className="w-5 h-5 text-brand-600" /> Matches
          </h1>
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setTab("matches")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === "matches" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              Matches {matches.length > 0 && `(${matches.length})`}
            </button>
            <button
              onClick={() => setTab("liked")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${tab === "liked" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              {!isGold && <Lock className="h-3.5 w-3.5" />}
              Liked You {likes.length > 0 && `(${likes.length})`}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {loading ? (
          <ListSkeleton count={5} />
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
            <div className="space-y-3">
              {matches.map((match) => {
                const profile = match.otherProfile;
                if (!profile) return null;
                const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
                return (
                  <div key={match.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                      {profile.avatar_url
                        ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full rounded-full object-cover" />
                        : <span className="text-xl font-bold text-brand-600">{profile.full_name?.charAt(0)}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {profile.full_name}{age && <span className="text-gray-500 font-normal">, {age}</span>}
                      </h3>
                      {profile.city && <p className="text-xs text-gray-500 truncate">{profile.city}</p>}
                      {profile.profession && <p className="text-xs text-gray-400 truncate">{profile.profession}</p>}
                    </div>
                    <Link href={`/chat/${match.id}`} className="shrink-0 w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center hover:bg-brand-200 transition-colors">
                      <MessageCircle className="h-5 w-5 text-brand-600" />
                    </Link>
                  </div>
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
          <div className="space-y-3">
            {likes.map((like) => {
              const profile = like.profile;
              if (!profile) return null;
              const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
              return (
                <div key={like.liker_id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full rounded-full object-cover" />
                      : <span className="text-xl font-bold text-pink-500">{profile.full_name?.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {profile.full_name}{age && <span className="text-gray-500 font-normal">, {age}</span>}
                    </h3>
                    {profile.city && <p className="text-xs text-gray-500 truncate">{profile.city}</p>}
                  </div>
                  <Heart className="h-5 w-5 text-pink-400 shrink-0 fill-pink-400" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
