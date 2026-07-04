"use client";

import { useState, useEffect } from "react";
import { Check, X, Loader2, User } from "lucide-react";

function calculateAge(dob: string) {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { loadProfiles(); }, [filter]);

  const loadProfiles = async () => {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/profiles?filter=${filter}`);
    if (res.status === 403) {
      setError("You don't have admin access. Make sure your account has is_admin = true in the database.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (data.error) { setError(data.error); setLoading(false); return; }
    setProfiles(data.profiles || []);
    setLoading(false);
  };

  const doAction = async (id: string, action: "approve" | "revoke") => {
    setActionLoading(id);
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: id, action }),
    });
    if (res.ok) {
      if (filter !== "all") {
        setProfiles((p) => p.filter((x) => x.id !== id));
      } else {
        setProfiles((p) => p.map((x) => x.id === id ? { ...x, is_approved: action === "approve" } : x));
      }
    }
    setActionLoading(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
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
                filter === f ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No {filter} profiles</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === "pending" ? "All profiles have been reviewed." : "No profiles match this filter."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {profiles.map((profile) => {
            const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
            return (
              <div key={profile.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-brand-600">
                      {profile.full_name?.charAt(0) || "?"}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{profile.full_name || "Unnamed"}</h3>
                    {age && <span className="text-gray-500 text-sm">{age} yrs</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      profile.gender === "male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                    }`}>
                      {profile.gender === "male" ? "👨 Male" : "👩 Female"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      profile.is_approved ? "bg-brand-100 text-brand-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {profile.is_approved ? "✓ Approved" : "⏳ Pending"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    {profile.city && <span className="text-sm text-gray-500">📍 {profile.city}{profile.country ? `, ${profile.country}` : ""}</span>}
                    {profile.sect && <span className="text-sm text-gray-500">🕌 {profile.sect}</span>}
                    {profile.profession && <span className="text-sm text-gray-500">💼 {profile.profession}</span>}
                    {profile.education && <span className="text-sm text-gray-500">🎓 {profile.education}</span>}
                  </div>
                  {profile.about_me && (
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">"{profile.about_me}"</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {!profile.is_approved ? (
                    <button
                      onClick={() => doAction(profile.id, "approve")}
                      disabled={actionLoading === profile.id}
                      className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {actionLoading === profile.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => doAction(profile.id, "revoke")}
                      disabled={actionLoading === profile.id}
                      className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {actionLoading === profile.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
