"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, HeartHandshake, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/directory", icon: BookOpen, label: "Browse" },
  { href: "/personalized", icon: HeartHandshake, label: "Personalized" },
  { href: "/requests", icon: ClipboardList, label: "Requests" },
  { href: "/settings", icon: User, label: "Account" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-hairline safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-0",
                active ? "text-brand-600" : "text-muted hover:text-ink"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-all", active && "scale-110")} strokeWidth={active ? 2.4 : 1.9} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
