"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MessageCircle, Search, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/discover", icon: Search, label: "Discover" },
  { href: "/matches", icon: Heart, label: "Matches" },
  { href: "/chat", icon: MessageCircle, label: "Chat", badge: true },
  { href: "/directory", icon: BookOpen, label: "Directory" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    let channel: any;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fetchUnread = async () => {
        const { data: myMatches } = await supabase
          .from("matches")
          .select("id")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        if (!myMatches?.length) { setUnread(0); return; }

        const matchIds = myMatches.map((m: any) => m.id);
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .in("match_id", matchIds)
          .neq("sender_id", user.id)
          .is("read_at", null);

        setUnread(count || 0);
      };

      fetchUnread();

      channel = supabase
        .channel("unread-count")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, fetchUnread)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, fetchUnread)
        .subscribe();
    };

    load();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={badge && unread > 0 ? `${label}, ${unread} unread` : label}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-0 relative",
                active ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn("h-5 w-5 transition-all", active && "scale-110")}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {badge && unread > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
