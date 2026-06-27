"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit2, LogOut, Shield, Star, MapPin, GraduationCap, Briefcase, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { calculateAge } from "@/lib/utils";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const age = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            <span className="text-emerald-600">ر</span> Profile
          </h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
              <Edit2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Profile Hero */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="h-32 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="px-5 pb-5">
            <div className="-mt-12 mb-3 flex items-end justify-between">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center overflow-hidden shadow-md">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-emerald-600">
                    {profile?.full_name?.charAt(0) || "?"}
                  </span>
                )}
              </div>
              <div className="flex gap-2 pb-1">
                {profile?.is_verified && (
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 text-xs font-medium">
                    <Shield className="h-3 w-3" />
                    Verified
                  </div>
                )}
                {!profile?.is_approved && (
                  <Badge variant="secondary">Pending Approval</Badge>
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              {profile?.full_name || "Your Name"}
              {age && <span className="font-normal text-gray-500 text-lg">, {age}</span>}
            </h2>

            <div className="flex flex-wrap gap-3 mt-3">
              {profile?.city && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.city}{profile.country ? `, ${profile.country}` : ""}
                </div>
              )}
              {profile?.profession && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Briefcase className="h-3.5 w-3.5" />
                  {profile.profession}
                </div>
              )}
            </div>

            {profile?.about_me && (
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{profile.about_me}</p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">Profile Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Sect", value: profile?.sect },
              { label: "Religiosity", value: profile?.religiosity },
              { label: "Ethnicity", value: profile?.ethnicity },
              { label: "Caste/Biraderi", value: profile?.caste },
              { label: "Education", value: profile?.education },
              { label: "Marital Status", value: profile?.marital_status },
              { label: "Height", value: profile?.height_cm ? `${profile.height_cm} cm` : null },
              { label: "Language", value: profile?.language },
            ].map(({ label, value }) =>
              value ? (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm text-gray-800 font-medium">{value}</p>
                </div>
              ) : null
            )}
          </div>
        </div>

        {/* Onboarding completion CTA */}
        {!profile?.onboarding_complete && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
            <p className="text-sm text-amber-800 font-medium">Complete your profile</p>
            <p className="text-xs text-amber-600 mt-1">Profiles with complete info get 3x more matches</p>
            <Button
              className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
              size="sm"
              onClick={() => router.push("/onboarding")}
            >
              Complete Profile
            </Button>
          </div>
        )}

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
