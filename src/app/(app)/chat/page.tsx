"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateAge } from "@/lib/utils";
import { ListSkeleton } from "@/components/Skeletons";
import { LogoGlyph } from "@/components/Logo";

export default function ChatListPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: matches } = await supabase
      .from("matches")
      .select("id, user1_id, user2_id, created_at")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (matches) {
      const enriched = await Promise.all(
        matches.map(async (match) => {
          const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const [profileResult, lastMsgResult] = await Promise.all([
            supabase.from("profiles").select("id, full_name, avatar_url, date_of_birth").eq("id", otherId).single(),
            supabase.from("messages").select("content, created_at").eq("match_id", match.id).order("created_at", { ascending: false }).limit(1).single(),
          ]);
          return {
            ...match,
            otherProfile: profileResult.data,
            lastMessage: lastMsgResult.data,
          };
        })
      );
      setConversations(enriched);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LogoGlyph className="w-5 h-5 text-brand-600" /> Messages
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <ListSkeleton count={6} />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-brand-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No conversations</h3>
            <p className="text-sm text-gray-500 mt-1">Match with someone to start chatting</p>
            <Link href="/discover" className="mt-4 text-sm text-brand-600 font-medium">
              Discover profiles →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((convo) => {
              const profile = convo.otherProfile;
              if (!profile) return null;

              return (
                <Link
                  key={convo.id}
                  href={`/chat/${convo.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="font-bold text-brand-600">{profile.full_name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">{profile.full_name}</h3>
                      {convo.lastMessage && (
                        <span className="text-xs text-gray-400 shrink-0 ml-2">
                          {new Date(convo.lastMessage.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {convo.lastMessage?.content || "Say salaam! 👋"}
                    </p>
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
