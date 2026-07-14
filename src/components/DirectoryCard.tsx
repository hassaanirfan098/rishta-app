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
  is_featured?: boolean;
  reference_code?: string;
}

interface DirectoryCardProps {
  profile: DirectoryProfile;
  isUnlocked?: boolean;
  phone?: string;
  onUnlock?: (id: string) => void;
  className?: string;
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/**
 * Directory card in the same Airbnb photo-first style, with a gold "Directory"
 * tag and an Unlock CTA (gold = the pay-per-unlock sub-accent).
 */
export function DirectoryCard({ profile, isUnlocked, phone, onUnlock, className }: DirectoryCardProps) {
  const meta = [profile.sect, profile.profession].filter(Boolean).join(" · ");

  return (
    <div className={cn(className)}>
      <div className="relative w-full aspect-[4/5] rounded-[14px] overflow-hidden bg-surface-strong">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold-100 to-gold-300 text-gold-700 text-5xl font-semibold">
            {initials(profile.full_name)}
          </div>
        )}
        <span className="absolute top-3 left-3 flex items-center gap-1 bg-white text-ink text-xs font-medium pl-1.5 pr-2.5 py-1 rounded-full shadow-card">
          <Lock className="h-3 w-3 text-gold-600" />
          Directory
        </span>
        {profile.is_featured && (
          <span className="absolute top-3 right-3 bg-gold-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-card">
            Featured
          </span>
        )}
        {profile.reference_code && (
          <span className="absolute bottom-3 left-3 bg-black/45 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
            {profile.reference_code}
          </span>
        )}
      </div>

      <div className="pt-3">
        <h3 className="text-lg font-semibold text-ink leading-tight">
          {profile.full_name}
          {profile.age ? <span className="text-muted font-normal">, {profile.age}</span> : ""}
        </h3>
        {(profile.city || profile.country) && (
          <p className="text-sm text-muted mt-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {[profile.city, profile.country].filter(Boolean).join(", ")}
          </p>
        )}
        {meta && <p className="text-sm text-muted mt-0.5">{meta}</p>}
      </div>

      <div className="pt-3.5">
        {isUnlocked ? (
          <div className="flex items-center justify-center gap-2 h-12 rounded-lg bg-surface-soft text-ink font-medium">
            <Phone className="h-4 w-4 text-brand-600" />
            {phone || "Contact unlocked"}
          </div>
        ) : (
          <button
            onClick={() => onUnlock?.(profile.id)}
            className="w-full h-12 rounded-lg bg-gold-500 hover:bg-gold-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Unlock to Call — Rs 500
          </button>
        )}
      </div>
    </div>
  );
}
