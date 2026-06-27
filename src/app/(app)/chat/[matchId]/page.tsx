"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
}

export default function ChatRoomPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherProfile, setOtherProfile] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => { init(); }, [matchId]);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    const { data: match } = await supabase.from("matches").select("*").eq("id", matchId).single();
    if (!match) { router.push("/matches"); return; }
    if (match.user1_id !== user.id && match.user2_id !== user.id) { router.push("/matches"); return; }

    const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;
    const { data: profile } = await supabase.from("profiles").select("id, full_name, avatar_url").eq("id", otherId).single();
    setOtherProfile(profile);

    const { data: msgs } = await supabase.from("messages").select("*").eq("match_id", matchId).order("created_at", { ascending: true });
    setMessages(msgs || []);
    setLoading(false);

    // Mark unread messages from the other person as read
    await supabase.from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("match_id", matchId)
      .eq("sender_id", otherId)
      .is("read_at", null);

    // Subscribe to realtime
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` }, async (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => [...prev, msg]);
        // Mark as read if from other person
        if (msg.sender_id !== user.id) {
          await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", msg.id);
          setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, read_at: new Date().toISOString() } : m));
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `match_id=eq.${matchId}` }, (payload) => {
        const updated = payload.new as Message;
        setMessages((prev) => prev.map((m) => m.id === updated.id ? updated : m));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");
    await supabase.from("messages").insert({ match_id: matchId, sender_id: currentUserId, content });
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });

  // Find last own message that is read
  const lastReadOwnMsgId = [...messages].reverse().find((m) => m.sender_id === currentUserId && m.read_at)?.id;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 flex items-center gap-3 px-4 py-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        {otherProfile && (
          <>
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
              {otherProfile.avatar_url ? (
                <img src={otherProfile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="font-bold text-emerald-600 text-sm">{otherProfile.full_name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">{otherProfile.full_name}</h2>
              <p className="text-xs text-emerald-500">Matched</p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🤝</div>
            <p className="text-gray-500 text-sm">You matched! Say salaam to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            const showSeen = isOwn && msg.id === lastReadOwnMsgId;
            return (
              <div key={msg.id} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isOwn ? "text-emerald-200" : "text-gray-400"} text-right`}>{formatTime(msg.created_at)}</p>
                </div>
                {showSeen && (
                  <div className="flex items-center gap-1 mt-0.5 mr-1">
                    <CheckCheck className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] text-emerald-500">Seen</span>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2 items-end safe-area-inset-bottom">
        <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5">
          <textarea
            className="w-full bg-transparent text-sm text-gray-900 resize-none focus:outline-none max-h-24"
            placeholder="Type a message..."
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!newMessage.trim() || sending}
          className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-emerald-700 transition-colors shrink-0"
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
