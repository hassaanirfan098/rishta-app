"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Heart, MessageCircle, Flag, Loader2, X,
  Users, Moon, Briefcase, HeartHandshake, Leaf, Sparkles, Brain,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateAge } from "@/lib/utils";

function Section({ title, icon: Icon, children }: {
  title: string; icon: LucideIcon; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[14px] p-5 border border-hairline">
      <h3 className="font-semibold text-ink text-base mb-4 flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-lg bg-surface-soft flex items-center justify-center">
          <Icon className="h-4 w-4 text-ink" />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-hairline-soft last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm text-ink text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function Chips({ items }: { items?: string[] | null }) {
  if (!items?.length) return <p className="text-sm text-muted-soft">Not specified</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="px-3 py-1.5 rounded-full border border-hairline text-sm text-ink">
          {item}
        </span>
      ))}
    </div>
  );
}

function initialsOf(name: string) {
  return (name || "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const REPORT_REASONS = ["Fake profile", "Inappropriate content", "Harassment", "Scam or fraud", "Other"];

export default function ProfileViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const supabase = createClient();

  useEffect(() => { loadProfile(); }, [id]);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    const { data: p } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (!p) { router.push("/discover"); return; }
    setProfile(p);

    const { data: photoData } = await supabase.from("profile_photos").select("url").eq("profile_id", id).order("order_index");
    const urls = photoData?.map((x: any) => x.url) || [];
    if (p.avatar_url && !urls.includes(p.avatar_url)) urls.unshift(p.avatar_url);
    setPhotos(urls);

    const { data: likeData } = await supabase.from("likes").select("id").eq("liker_id", user.id).eq("liked_id", id).single();
    setLiked(!!likeData);

    const { data: match } = await supabase.from("matches").select("id")
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${user.id})`).single();
    setMatchId(match?.id || null);

    setLoading(false);
  };

  const handleLike = async () => {
    if (!currentUser || likeLoading) return;
    setLikeLoading(true);
    if (liked) {
      await supabase.from("likes").delete().eq("liker_id", currentUser.id).eq("liked_id", id);
      setLiked(false);
    } else {
      await supabase.from("likes").insert({ liker_id: currentUser.id, liked_id: id });
      setLiked(true);
      const { data: match } = await supabase.from("matches").select("id")
        .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${currentUser.id})`).single();
      if (match) setMatchId(match.id);
    }
    setLikeLoading(false);
  };

  const handleReport = async () => {
    if (!reportReason) return;
    setReportLoading(true);
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportedId: id, reason: reportReason }),
    });
    setReportLoading(false);
    setReportDone(true);
  };

  const handleBlock = async () => {
    await fetch("/api/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedId: id }),
    });
    setShowReportModal(false);
    router.back();
  };

  const heightDisplay = (cm?: number) => {
    if (!cm) return null;
    const totalIn = Math.round(cm / 2.54);
    return `${Math.floor(totalIn / 12)}'${totalIn % 12}" (${cm} cm)`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;
  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const mainPhoto = photos[photoIdx] || profile.avatar_url;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Hero photo */}
      <div className="relative h-[420px] bg-gradient-to-br from-brand-200 to-brand-300">
        {mainPhoto ? (
          <img src={mainPhoto} alt={profile.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 text-6xl font-semibold">
            {initialsOf(profile.full_name)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <button aria-label="Go back" onClick={() => router.back()} className="absolute top-12 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        <button aria-label="Report or block" onClick={() => setShowReportModal(true)} className="absolute top-12 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Flag className="h-4 w-4 text-white" />
        </button>

        {photos.length > 1 && (
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 px-4">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setPhotoIdx(i)} className={`h-1 rounded-full transition-all ${i === photoIdx ? "bg-white w-6" : "bg-white/50 w-3"}`} />
            ))}
          </div>
        )}

        {photos.length > 1 && (
          <>
            <button aria-label="Previous photo" className="absolute inset-y-0 left-0 w-1/3" onClick={() => setPhotoIdx((i) => Math.max(0, i - 1))} />
            <button aria-label="Next photo" className="absolute inset-y-0 right-0 w-1/3" onClick={() => setPhotoIdx((i) => Math.min(photos.length - 1, i + 1))} />
          </>
        )}

        <div className="absolute bottom-5 left-5 right-5">
          <h1 className="text-white text-3xl font-extrabold tracking-tight leading-none drop-shadow">
            {profile.full_name}{age ? <span className="font-semibold">, {age}</span> : ""}
            {profile.is_verified && <span className="ml-2 align-middle text-xs bg-white/90 text-brand-700 px-2 py-0.5 rounded-full font-bold">✓</span>}
          </h1>
          {(profile.city || profile.country) && (
            <p className="text-white/80 text-sm mt-0.5">📍 {[profile.city, profile.country].filter(Boolean).join(", ")}</p>
          )}
          {profile.profession && <p className="text-white/70 text-sm">💼 {profile.profession}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {profile.about_me && (
          <Section title="About" icon={Sparkles}>
            <p className="text-gray-700 text-sm leading-relaxed">"{profile.about_me}"</p>
          </Section>
        )}
        <Section title="Basics" icon={Users}>
          <Row label="Age" value={age ? `${age} years` : null} />
          <Row label="Height" value={heightDisplay(profile.height_cm)} />
          <Row label="Marital Status" value={profile.marital_status} />
          <Row label="Nationality" value={profile.nationality} />
          <Row label="Ethnicity" value={Array.isArray(profile.ethnicity) ? profile.ethnicity.join(", ") : profile.ethnicity} />
          <Row label="Grew up in" value={profile.grew_up_in} />
        </Section>
        <Section title="Faith" icon={Moon}>
          <Row label="Sect" value={profile.sect} />
          <Row label="Religiosity" value={profile.religiosity} />
          <Row label="Born religion" value={profile.born_religion} />
          <Row label="Diet" value={profile.diet} />
          {profile.faith_values?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1.5">Faith values</p>
              <Chips items={profile.faith_values} />
            </div>
          )}
        </Section>
        <Section title="Career & education" icon={Briefcase}>
          <Row label="Profession" value={profile.profession} />
          <Row label="Education" value={profile.education} />
        </Section>
        <Section title="Marriage intentions" icon={HeartHandshake}>
          <Row label="Marriage readiness" value={profile.marriage_readiness} />
          <Row label="Knowing timeline" value={profile.knowing_timeline} />
          <Row label="Marriage timeline" value={profile.marriage_timeline} />
          <Row label="Relocation" value={profile.relocation} />
        </Section>
        <Section title="Family" icon={Users}>
          <Row label="Has children" value={profile.has_children} />
          <Row label="Wants children" value={profile.wants_children} />
        </Section>
        <Section title="Lifestyle" icon={Leaf}>
          <Row label="Smoking" value={profile.smoking} />
          <Row label="Drinking" value={profile.drinking} />
        </Section>
        {profile.interests?.length > 0 && (
          <Section title="Interests" icon={Sparkles}>
            <Chips items={profile.interests} />
          </Section>
        )}
        {profile.personality_traits?.length > 0 && (
          <Section title="Personality" icon={Brain}>
            <Chips items={profile.personality_traits} />
          </Section>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-3 max-w-lg mx-auto safe-area-inset-bottom">
        {matchId ? (
          <button onClick={() => router.push(`/chat/${matchId}`)} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors">
            <MessageCircle className="h-5 w-5" />
            Send Message
          </button>
        ) : (
          <>
            <button onClick={() => router.back()} className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-300 hover:text-red-400 transition-colors">
              ✕
            </button>
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex-1 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all ${liked ? "bg-pink-100 text-pink-600 border-2 border-pink-200" : "bg-gradient-to-r from-brand-500 to-brand-500 text-white shadow-md"}`}
            >
              {likeLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={`h-5 w-5 ${liked ? "fill-pink-500" : ""}`} />}
              {liked ? "Liked" : "Like"}
            </button>
          </>
        )}
      </div>

      {/* Report / Block Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Report or Block</h3>
              <button onClick={() => { setShowReportModal(false); setReportDone(false); setReportReason(""); }}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            {reportDone ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold text-gray-800">Report submitted</p>
                <p className="text-sm text-gray-500 mt-1">Thank you. Our team will review this profile.</p>
                <button onClick={() => { setShowReportModal(false); setReportDone(false); setReportReason(""); }} className="mt-4 text-sm text-brand-600 font-medium">Close</button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">Select a reason to report this profile:</p>
                <div className="space-y-2 mb-5">
                  {REPORT_REASONS.map((r) => (
                    <button key={r} onClick={() => setReportReason(r)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${reportReason === r ? "border-red-400 bg-red-50 text-red-700" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>{r}</button>
                  ))}
                </div>
                <button onClick={handleReport} disabled={!reportReason || reportLoading} className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold disabled:opacity-40 transition-colors mb-3">
                  {reportLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Submit Report"}
                </button>
                <button onClick={handleBlock} className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">
                  🚫 Block this person
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
