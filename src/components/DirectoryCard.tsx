"use client";

import Image from "next/image";
import { Phone, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  about_me?: string;
  avatar_url?: string;
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
    <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden", className)}>
      {/* Photo */}
      <div className="relative h-52 bg-gradient-to-br from-amber-50 to-amber-100">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.full_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-amber-700">
                {profile.full_name?.charAt(0) || "?"}
              </span>
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant="gold">Directory</Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-900">
            {profile.full_name}
            {profile.age && <span className="font-normal text-gray-500">, {profile.age}</span>}
          </h3>
          {profile.sect && <Badge variant="secondary">{profile.sect}</Badge>}
        </div>

        {(profile.city || profile.country) && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <MapPin className="h-3 w-3" />
            <span>{[profile.city, profile.country].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {profile.profession && (
          <p className="text-sm text-gray-600 mb-1">{profile.profession}</p>
        )}

        {profile.marital_status && (
          <p className="text-xs text-gray-400 mb-3">{profile.marital_status}</p>
        )}

        {/* Contact/Unlock */}
        {isUnlocked && phone ? (
          <div className="flex items-center gap-2 bg-emerald-50 rounded-xl p-3">
            <Phone className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">{phone}</span>
          </div>
        ) : (
          <Button
            className="w-full"
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
