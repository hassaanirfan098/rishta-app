"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { calculateAge } from "@/lib/utils";

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const supabase = createClient();

  useEffect(() => {
    loadProfiles();
  }, [filter]);

  const loadProfiles = async () => {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("onboarding_complete", true)
      .order("created_at", { ascending: false });

    if (filter === "pending") query = query.eq("is_approved", false);
    if (filter === "approved") query = query.eq("is_approved", true);

    const { data } = await query;
    setProfiles(data || []);
    setLoading(false);
  };

  const approve = async (id: string) => {
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: id, action: "approve" }),
    });
    if (res.ok) setProfiles((p) => filter === "pending" ? p.filter((x) => x.id !== id) : p.map((x) => x.id === id ? { ...x, is_approved: true } : x));
  };

  const reject = async (id: string) => {
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: id, action: "revoke" }),
    });
    if (res.ok) setProfiles((p) => filter === "approved" ? p.filter((x) => x.id !== id) : p.map((x) => x.id === id ? { ...x, is_approved: false } : x));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Member Profiles</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve member applications</p>
        </div>
        <div className="flex gap-2">
          {(["pending", "approved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-emerald-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-gray-500">No {filter} profiles</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {profiles.map((profile) => {
                const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
                return (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="font-bold text-emerald-600 text-sm">
                              {profile.full_name?.charAt(0) || "?"}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{profile.full_name}</p>
                          <p className="text-xs text-gray-500">
                            {profile.gender} {age ? `• ${age} yrs` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{profile.city}, {profile.country}</p>
                      <p className="text-xs text-gray-500">{profile.sect} • {profile.profession}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={profile.is_approved ? "default" : "secondary"}>
                        {profile.is_approved ? "Approved" : "Pending"}
                      </Badge>
                      {profile.is_verified && (
                        <Badge variant="outline" className="ml-1">Verified</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!profile.is_approved && (
                          <Button
                            size="sm"
                            onClick={() => approve(profile.id)}
                            className="h-8 px-3 bg-emerald-600"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                        )}
                        {profile.is_approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reject(profile.id)}
                            className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
