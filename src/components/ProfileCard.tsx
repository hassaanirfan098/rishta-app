"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Heart, BadgeCheck, MapPin } from "lucide-react";
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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Airbnb-style photo-first card: clean photo plate with soft rounding, meta
 * in ink beneath on white, calm actions. No emoji — a name-initial gradient
 * stands in when there's no photo.
 */
export function ProfileCard({ profile, isMatch, onLike, onMessage, className }: ProfileCardProps) {
  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const router = useRouter();
  const [swipe, setSwipe] = useState<"like" | "pass" | null>(null);

  const meta = [profile.sect, profile.profession].filter(Boolean).join(" · ");
  const open = () => router.push(`/profile/${profile.id}`);

  return (
    <div
      className={cn(
        "transition-all duration-300",
        swipe === "like" && "translate-x-8 opacity-0",
        swipe === "pass" && "-translate-x-8 opacity-0",
        className
      )}
    >
      {/* Photo plate */}
      <button
        onClick={open}
        aria-label={`View ${profile.full_name}'s profile`}
        className="relative block w-full aspect-[4/5] rounded-[14px] overflow-hidden bg-surface-strong"
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 text-5xl font-semibold">
            {initials(profile.full_name)}
          </div>
        )}
        {profile.is_verified && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-white text-ink text-xs font-medium pl-1.5 pr-2.5 py-1 rounded-full shadow-card">
            <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />
            Verified
          </span>
        )}
      </button>

      {/* Meta */}
      <button onClick={open} className="block text-left w-full pt-3">
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-lg font-semibold text-ink leading-tight">
            {profile.full_name}
            {age ? <span className="text-muted font-normal">, {age}</span> : ""}
          </h3>
        </div>
        {(profile.city || profile.country) && (
          <p className="text-sm text-muted mt-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {[profile.city, profile.country].filter(Boolean).join(", ")}
          </p>
        )}
        {meta && <p className="text-sm text-muted mt-0.5">{meta}</p>}
      </button>

      {/* Actions */}
      <div className="pt-3.5">
        {isMatch ? (
          <button
            onClick={() => onMessage?.(profile.id)}
            className="w-full h-12 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors"
          >
            Message
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              aria-label="Pass"
              onClick={() => {
                setSwipe("pass");
                setTimeout(() => setSwipe(null), 320);
              }}
              className="flex-1 h-12 rounded-lg border border-hairline text-ink font-medium hover:bg-surface-soft transition-colors flex items-center justify-center gap-2"
            >
              <X className="h-4.5 w-4.5" />
              Pass
            </button>
            <button
              aria-label="Like"
              onClick={() => {
                setSwipe("like");
                setTimeout(() => {
                  onLike?.(profile.id);
                  setSwipe(null);
                }, 320);
              }}
              className="flex-1 h-12 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Heart className="h-4.5 w-4.5 fill-white" />
              Like
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
