"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
          const [profileResult, lastMsgResult, unreadResult] = await Promise.all([
            supabase.from("profiles").select("id, full_name, avatar_url, date_of_birth").eq("id", otherId).single(),
            supabase.from("messages").select("content, created_at").eq("match_id", match.id).order("created_at", { ascending: false }).limit(1).single(),
            supabase.from("messages").select("id", { count: "exact", head: true }).eq("match_id", match.id).neq("sender_id", user.id).is("read_at", null),
          ]);
          return {
            ...match,
            otherProfile: profileResult.data,
            lastMessage: lastMsgResult.data,
            unreadCount: unreadResult.count || 0,
          };
        })
      );
      setConversations(enriched);
    }
    setLoading(false);
  };

  const active = conversations.filter((c) => c.otherProfile);
  const slots = active.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LogoGlyph className="w-5 h-5 text-emerald-600" /> Your Chats
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <ListSkeleton count={6} />
        ) : active.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
              <LogoGlyph className="w-11 h-11 text-emerald-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No conversations yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Match with someone and say salaam — your chats will show up here.
            </p>
            <Link href="/discover" className="mt-5 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Start Discovering
            </Link>
          </div>
        ) : (
          <>
            {/* Active conversation slots */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Active conversations ({active.length})</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {slots.map((convo) => {
                  const profile = convo.otherProfile;
                  return (
                    <Link key={convo.id} href={`/chat/${convo.id}`} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-emerald-600">{profile.full_name?.charAt(0)}</span>
                          )}
                        </div>
                        {convo.unreadCount > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 ring-2 ring-white">
                            {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 truncate w-full text-center">{profile.full_name?.split(" ")[0]}</span>
                    </Link>
                  );
                })}
                {active.length > 5 && (
                  <Link href="#conversation-list" className="flex flex-col items-center gap-1.5 shrink-0 w-16">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                      +{active.length - 5}
                    </div>
                    <span className="text-[11px] text-gray-500">more</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Full list */}
            <div id="conversation-list" className="space-y-2 scroll-mt-20">
              {active.map((convo) => {
                const profile = convo.otherProfile;
                return (
                  <Link
                    key={convo.id}
                    href={`/chat/${convo.id}`}
                    className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all min-h-[44px]"
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-emerald-600">{profile.full_name?.charAt(0)}</span>
                        )}
                      </div>
                      {convo.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 ring-2 ring-white">
                          {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className={`truncate ${convo.unreadCount > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-900"}`}>
                          {profile.full_name}
                        </h3>
                        {convo.lastMessage && (
                          <span className="text-xs text-gray-400 shrink-0">
                            {new Date(convo.lastMessage.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${convo.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                        {convo.lastMessage?.content || "Say salaam! 👋"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
