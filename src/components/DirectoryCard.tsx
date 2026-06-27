"use client";

import { Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function DirectoryCard({ profile, isUnlocked, phone, onUnlock, className }: DirectoryCardProps) {
  return (
    <div className={cn("bg-white rounded-3xl shadow-lg overflow-hidden", className)}>
      {/* Photo with gradient overlay */}
      <div className="relative h-72 bg-gradient-to-br from-amber-200 to-orange-300">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">
            {profile.gender === "male" ? "👨" : "👩"}
          </div>
        )}
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* Name + age on photo */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-white text-xl font-bold">
                {profile.full_name}{profile.age ? `, ${profile.age}` : ""}
              </h3>
              {(profile.city || profile.country) && (
                <p className="text-white/80 text-sm">
                  📍 {[profile.city, profile.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
              📞 Unlock
            </span>
          </div>
        </div>
        {/* Directory badge */}
        <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          Directory
        </div>
      </div>

      {/* Info pills row */}
      <div className="px-4 py-3 flex flex-wrap gap-2">
        {profile.sect && (
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
            🕌 {profile.sect}
          </span>
        )}
        {profile.marital_status && (
          <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-medium">
            💚 {profile.marital_status}
          </span>
        )}
        {profile.education && (
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            🎓 {profile.education}
          </span>
        )}
        {profile.profession && (
          <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
            💼 {profile.profession}
          </span>
        )}
        {profile.religiosity && (
          <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
            ✨ {profile.religiosity}
          </span>
        )}
      </div>

      {/* About me snippet */}
      {profile.about_me && (
        <div className="px-4 pb-3">
          <p className="text-gray-600 text-sm line-clamp-2">"{profile.about_me}"</p>
        </div>
      )}

      {/* Contact/Unlock */}
      <div className="px-4 pb-4">
        {isUnlocked && phone ? (
          <div className="flex items-center gap-2 bg-emerald-50 rounded-2xl p-3">
            <Phone className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">{phone}</span>
          </div>
        ) : (
          <Button
            className="w-full rounded-2xl py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-md active:scale-95 transition-all"
            onClick={() => onUnlock?.(profile.id)}
          >
            <Lock className="h-4 w-4 mr-2" />
            Unlock to Call — Rs 500
          </Button>
        )}
      </div>
    </div>
  );
}
