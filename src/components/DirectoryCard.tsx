"use client";

import { Phone, Lock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface DirectoryProfile {
  id: string;
  full_name: string;
  age?: number;
  city?: string;
  country?: string;
  sect?: string;
  education?: string;
  profession?: string;
  marital_status?: string;
  religiosity?: string;
  about_me?: string;
  avatar_url?: string;
  gender?: string;
}

interface DirectoryCardProps {
  profile: DirectoryProfile;
  isUnlocked?: boolean;
  phone?: string;
  onUnlock?: (id: string) => void;
  className?: string;
}

/**
 * Immersive directory card (gold accent = pay-per-unlock tier).
 * Mirrors ProfileCard's full-bleed layout with an Unlock CTA.
 */
export function DirectoryCard({ profile, isUnlocked, phone, onUnlock, className }: DirectoryCardProps) {
  const chips = [
    profile.sect && { icon: "🕌", label: profile.sect },
    profile.religiosity && { icon: "✨", label: profile.religiosity },
    profile.profession && { icon: "💼", label: profile.profession },
    profile.education && { icon: "🎓", label: profile.education },
  ].filter(Boolean) as { icon: string; label: string }[];

  return (
    <div
      className={cn(
        "relative w-full rounded-[28px] overflow-hidden shadow-xl bg-brand-900",
        "h-[72vh] min-h-[460px] max-h-[640px]",
        className
      )}
    >
      {/* Photo / fallback */}
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatar_url} alt={profile.full_name} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gold-300 to-gold-600 text-[7rem]">
          {profile.gender === "male" ? "👨" : "👩"}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Directory badge */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-gold-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
        <Lock className="h-3 w-3" />
        Directory
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-white text-3xl font-extrabold tracking-tight leading-none drop-shadow">
          {profile.full_name}
          {profile.age ? <span className="font-semibold">, {profile.age}</span> : ""}
        </h3>
        {(profile.city || profile.country) && (
          <p className="text-white/85 text-sm mt-1.5 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {[profile.city, profile.country].filter(Boolean).join(", ")}
          </p>
        )}

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
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

        <div className="mt-5">
          {isUnlocked && phone ? (
            <div className="flex items-center justify-center gap-2 bg-white rounded-full py-3.5 font-bold text-brand-700">
              <Phone className="h-4 w-4" />
              {phone}
            </div>
          ) : (
            <button
              onClick={() => onUnlock?.(profile.id)}
              className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 bg-gradient-to-r from-gold-400 to-gold-600 text-white font-bold shadow-lg active:scale-95 transition-transform"
            >
              <Lock className="h-4 w-4" />
              Unlock to Call — Rs 500
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
