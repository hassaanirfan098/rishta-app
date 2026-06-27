"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { calculateAge } from "@/lib/utils";

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

export function ProfileCard({ profile, isMatch, onLike, onMessage, className }: ProfileCardProps) {
  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const router = useRouter();

  return (
    <div className={cn("bg-white rounded-3xl shadow-lg overflow-hidden", className)}>
      {/* Photo with gradient overlay */}
      <div className="relative h-72 bg-gradient-to-br from-emerald-200 to-teal-300 cursor-pointer" onClick={() => router.push(`/profile/${profile.id}`)}>
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
                {profile.full_name}{age ? `, ${age}` : ""}
              </h3>
              {(profile.city || profile.country) && (
                <p className="text-white/80 text-sm">
                  📍 {[profile.city, profile.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            {isMatch ? (
              <button
                onClick={() => onMessage?.(profile.id)}
                className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white"
              >
                💬 Message
              </button>
            ) : null}
          </div>
        </div>
        {/* Verified badge */}
        {profile.is_verified && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
            ✓ Verified
          </div>
        )}
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

      {/* Action buttons */}
      <div className="px-4 pb-4 flex gap-3">
        <button
          onClick={() => {/* pass action */}}
          className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-red-300 hover:text-red-500 transition-all active:scale-95"
        >
          ✕ Pass
        </button>
        <button
          onClick={() => onLike?.(profile.id)}
          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          💚 Like
        </button>
      </div>
    </div>
  );
}
