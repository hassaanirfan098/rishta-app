"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Heart, BadgeCheck, MapPin, MessageCircle } from "lucide-react";
import { cn, calculateAge } from "@/lib/utils";

interface Profile {
  id: string;
  full_name: string;
  date_of_birth?: string;
  city?: string;
  country?: string;
  sect?: string;
  education?: string;
  profession?: string;
  marital_status?: string;
  religiosity?: string;
  about_me?: string;
  avatar_url?: string;
  is_verified?: boolean;
  gender?: string;
  type?: string;
}

interface ProfileCardProps {
  profile: Profile;
  isMatch?: boolean;
  onLike?: (id: string) => void;
  onMessage?: (id: string) => void;
  className?: string;
}

/**
 * Muzz-style full-bleed immersive discovery card, plum + gold.
 * Photo fills the card; name/age/chips overlay the bottom; circular
 * Pass / Like actions float at the base.
 */
export function ProfileCard({ profile, isMatch, onLike, onMessage, className }: ProfileCardProps) {
  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const router = useRouter();
  const [swipe, setSwipe] = useState<"like" | "pass" | null>(null);

  const chips = [
    profile.sect && { icon: "🕌", label: profile.sect },
    profile.religiosity && { icon: "✨", label: profile.religiosity },
    profile.profession && { icon: "💼", label: profile.profession },
    profile.education && { icon: "🎓", label: profile.education },
  ].filter(Boolean) as { icon: string; label: string }[];

  const open = () => router.push(`/profile/${profile.id}`);

  return (
    <div
      className={cn(
        "relative w-full rounded-[28px] overflow-hidden shadow-xl bg-brand-900 select-none transition-all duration-300",
        "h-[72vh] min-h-[460px] max-h-[640px]",
        swipe === "like" && "translate-x-10 rotate-3 opacity-0",
        swipe === "pass" && "-translate-x-10 -rotate-3 opacity-0",
        className
      )}
    >
      {/* Photo / fallback */}
      <button onClick={open} className="absolute inset-0 w-full h-full cursor-pointer" aria-label={`View ${profile.full_name}'s profile`}>
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-700 text-[7rem]">
            {profile.gender === "male" ? "👨" : "👩"}
          </div>
        )}
      </button>

      {/* Bottom scrim */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Verified pill */}
      {profile.is_verified && (
        <div className="absolute top-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur text-brand-700 text-xs font-bold pl-1.5 pr-2.5 py-1 rounded-full shadow-sm">
          <BadgeCheck className="h-3.5 w-3.5 text-gold-600" />
          Verified
        </div>
      )}

      {/* Overlaid content */}
      <div className="absolute inset-x-0 bottom-0 p-5 pointer-events-none">
        <button onClick={open} className="block text-left pointer-events-auto">
          <h3 className="text-white text-3xl font-extrabold tracking-tight leading-none drop-shadow">
            {profile.full_name}
            {age ? <span className="font-semibold">, {age}</span> : ""}
          </h3>
          {(profile.city || profile.country) && (
            <p className="text-white/85 text-sm mt-1.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {[profile.city, profile.country].filter(Boolean).join(", ")}
            </p>
          )}
        </button>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 pointer-events-auto">
            {chips.slice(0, 3).map((c) => (
              <span
                key={c.label}
                className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {c.icon} {c.label}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex items-center justify-center gap-5 pointer-events-auto">
          {isMatch ? (
            <button
              onClick={() => onMessage?.(profile.id)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-white text-brand-700 font-bold shadow-lg active:scale-95 transition-transform"
            >
              <MessageCircle className="h-5 w-5" />
              Message
            </button>
          ) : (
            <>
              <button
                aria-label="Pass"
                onClick={() => {
                  setSwipe("pass");
                  setTimeout(() => setSwipe(null), 350);
                }}
                className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
              >
                <X className="h-7 w-7" strokeWidth={2.5} />
              </button>
              <button
                aria-label="Like"
                onClick={() => {
                  setSwipe("like");
                  setTimeout(() => {
                    onLike?.(profile.id);
                    setSwipe(null);
                  }, 350);
                }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-xl shadow-brand-900/40 flex items-center justify-center text-white active:scale-90 transition-transform ring-4 ring-white/20"
              >
                <Heart className="h-9 w-9 fill-white" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
