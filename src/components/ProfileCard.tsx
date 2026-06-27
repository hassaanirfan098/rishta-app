"use client";

import Image from "next/image";
import { Heart, MessageCircle, MapPin, GraduationCap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  about_me?: string;
  avatar_url?: string;
  is_verified?: boolean;
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

  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden", className)}>
      {/* Photo */}
      <div className="relative h-64 bg-gradient-to-br from-emerald-50 to-emerald-100">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.full_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-emerald-200 flex items-center justify-center">
              <span className="text-3xl font-bold text-emerald-600">
                {profile.full_name?.charAt(0) || "?"}
              </span>
            </div>
          </div>
        )}
        {profile.is_verified && (
          <div className="absolute top-3 right-3 bg-emerald-600 text-white rounded-full p-1">
            <Star className="h-3 w-3 fill-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {profile.full_name}
              {age && <span className="font-normal text-gray-500">, {age}</span>}
            </h3>
            {(profile.city || profile.country) && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <MapPin className="h-3 w-3" />
                <span>{[profile.city, profile.country].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
          {profile.sect && (
            <Badge variant="secondary" className="shrink-0">{profile.sect}</Badge>
          )}
        </div>

        {profile.profession && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
            <span>{profile.profession}</span>
            {profile.education && <span className="text-gray-400">• {profile.education}</span>}
          </div>
        )}

        {profile.about_me && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{profile.about_me}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          {isMatch ? (
            <Button
              className="flex-1"
              onClick={() => onMessage?.(profile.id)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          ) : (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onLike?.(profile.id)}
            >
              <Heart className="h-4 w-4 mr-2" />
              Like
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
