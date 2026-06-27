"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateAge } from "@/lib/utils";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("matches")
      .select(`
        id,
        created_at,
        user1_id,
        user2_id
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch the "other" profile for each match
      const enriched = await Promise.all(
        data.map(async (match) => {
          const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, date_of_birth, city, avatar_url, profession")
            .eq("id", otherId)
            .single();
          return { ...match, otherProfile: profile };
        })
      );
      setMatches(enriched);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            <span className="text-emerald-600">ر</span> Matches
          </h1>
          <p className="text-xs text-gray-400">Mutual connections</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-10 w-10 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No matches yet</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              When you and someone both like each other, they'll appear here
            </p>
            <Link
              href="/discover"
              className="mt-4 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium"
            >
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
                <div
                  key={match.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4"
                >
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-emerald-600">
                        {profile.full_name?.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {profile.full_name}
                      {age && <span className="text-gray-500 font-normal">, {age}</span>}
                    </h3>
                    {profile.city && (
                      <p className="text-xs text-gray-500 truncate">{profile.city}</p>
                    )}
                    {profile.profession && (
                      <p className="text-xs text-gray-400 truncate">{profile.profession}</p>
                    )}
                  </div>

                  {/* Action */}
                  <Link
                    href={`/chat/${match.id}`}
                    className="shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 text-emerald-600" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
