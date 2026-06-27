"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, Flag, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { calculateAge } from "@/lib/utils";

function Section({ title, emoji, children, bg = "bg-gray-50", border = "border-gray-100" }: {
  title: string; emoji: string; children: React.ReactNode; bg?: string; border?: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 border ${border}`}>
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[55%]">{value}</span>
    </div>
  );
}

function Chips({ items }: { items?: string[] | null }) {
  if (!items?.length) return <p className="text-sm text-gray-400">Not specified</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="px-3 py-1.5 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 font-medium">
          {item}
        </span>
      ))}
    </div>
  );
}

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
  const supabase = createClient();

  useEffect(() => { loadProfile(); }, [id]);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (!p) { router.push("/discover"); return; }
    setProfile(p);

    // Load photos
    const { data: photoData } = await supabase
      .from("profile_photos")
      .select("url")
      .eq("profile_id", id)
      .order("order_index");
    const urls = photoData?.map((x: any) => x.url) || [];
    if (p.avatar_url && !urls.includes(p.avatar_url)) urls.unshift(p.avatar_url);
    setPhotos(urls);

    // Check if already liked
    const { data: likeData } = await supabase
      .from("likes")
      .select("id")
      .eq("liker_id", user.id)
      .eq("liked_id", id)
      .single();
    setLiked(!!likeData);

    // Check for existing match
    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${user.id})`)
      .single();
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

      // Check for new match
      const { data: match } = await supabase
        .from("matches")
        .select("id")
        .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${id}),and(user1_id.eq.${id},user2_id.eq.${currentUser.id})`)
        .single();
      if (match) setMatchId(match.id);
    }
    setLikeLoading(false);
  };

  const heightDisplay = (cm?: number) => {
    if (!cm) return null;
    const totalIn = Math.round(cm / 2.54);
    return `${Math.floor(totalIn / 12)}'${totalIn % 12}" (${cm} cm)`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;
  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const mainPhoto = photos[photoIdx] || profile.avatar_url;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Hero photo */}
      <div className="relative h-[420px] bg-gradient-to-br from-emerald-200 to-teal-300">
        {mainPhoto ? (
          <img src={mainPhoto} alt={profile.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">
            {profile.gender === "male" ? "👨" : "👩"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-12 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        {/* Report button */}
        <button className="absolute top-12 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Flag className="h-4 w-4 text-white" />
        </button>

        {/* Photo dots */}
        {photos.length > 1 && (
          <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 px-4">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIdx(i)}
                className={`h-1 rounded-full transition-all ${i === photoIdx ? "bg-white w-6" : "bg-white/50 w-3"}`}
              />
            ))}
          </div>
        )}

        {/* Tap zones to cycle photos */}
        {photos.length > 1 && (
          <>
            <button className="absolute inset-y-0 left-0 w-1/3" onClick={() => setPhotoIdx((i) => Math.max(0, i - 1))} />
            <button className="absolute inset-y-0 right-0 w-1/3" onClick={() => setPhotoIdx((i) => Math.min(photos.length - 1, i + 1))} />
          </>
        )}

        {/* Name overlay */}
        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-white text-2xl font-bold">
                {profile.full_name}{age ? `, ${age}` : ""}
                {profile.is_verified && <span className="ml-2 text-sm bg-blue-500 px-2 py-0.5 rounded-full">✓</span>}
              </h1>
              {(profile.city || profile.country) && (
                <p className="text-white/80 text-sm mt-0.5">📍 {[profile.city, profile.country].filter(Boolean).join(", ")}</p>
              )}
              {profile.profession && <p className="text-white/70 text-sm">💼 {profile.profession}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* About */}
        {profile.about_me && (
          <Section title="About" emoji="💬" bg="bg-emerald-50" border="border-emerald-100">
            <p className="text-gray-700 text-sm leading-relaxed">"{profile.about_me}"</p>
          </Section>
        )}

        {/* Basics */}
        <Section title="Basics" emoji="👤" bg="bg-sky-50" border="border-sky-100">
          <Row label="Age" value={age ? `${age} years` : null} />
          <Row label="Height" value={heightDisplay(profile.height_cm)} />
          <Row label="Marital Status" value={profile.marital_status} />
          <Row label="Nationality" value={profile.nationality} />
          <Row label="Ethnicity" value={Array.isArray(profile.ethnicity) ? profile.ethnicity.join(", ") : profile.ethnicity} />
          <Row label="Grew up in" value={profile.grew_up_in} />
        </Section>

        {/* Faith */}
        <Section title="Faith" emoji="🕌" bg="bg-amber-50" border="border-amber-100">
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

        {/* Career */}
        <Section title="Career & Education" emoji="🎓" bg="bg-purple-50" border="border-purple-100">
          <Row label="Profession" value={profile.profession} />
          <Row label="Education" value={profile.education} />
        </Section>

        {/* Relationship Goals */}
        <Section title="Relationship Goals" emoji="💍" bg="bg-rose-50" border="border-rose-100">
          <Row label="Marriage readiness" value={profile.marriage_readiness} />
          <Row label="Knowing timeline" value={profile.knowing_timeline} />
          <Row label="Marriage timeline" value={profile.marriage_timeline} />
          <Row label="Relocation" value={profile.relocation} />
        </Section>

        {/* Family */}
        <Section title="Family" emoji="👨‍👩‍👧" bg="bg-pink-50" border="border-pink-100">
          <Row label="Has children" value={profile.has_children} />
          <Row label="Wants children" value={profile.wants_children} />
        </Section>

        {/* Lifestyle */}
        <Section title="Lifestyle" emoji="🌿" bg="bg-blue-50" border="border-blue-100">
          <Row label="Smoking" value={profile.smoking} />
          <Row label="Drinking" value={profile.drinking} />
        </Section>

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <Section title="Interests" emoji="✨" bg="bg-fuchsia-50" border="border-fuchsia-100">
            <Chips items={profile.interests} />
          </Section>
        )}

        {/* Personality */}
        {profile.personality_traits?.length > 0 && (
          <Section title="Personality" emoji="🧠" bg="bg-indigo-50" border="border-indigo-100">
            <Chips items={profile.personality_traits} />
          </Section>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-3 max-w-lg mx-auto safe-area-inset-bottom">
        {matchId ? (
          <button
            onClick={() => router.push(`/chat/${matchId}`)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Send Message
          </button>
        ) : (
          <>
            <button
              onClick={() => router.back()}
              className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-300 hover:text-red-400 transition-colors"
            >
              ✕
            </button>
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex-1 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                liked
                  ? "bg-pink-100 text-pink-600 border-2 border-pink-200"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
              }`}
            >
              {likeLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={`h-5 w-5 ${liked ? "fill-pink-500" : ""}`} />}
              {liked ? "Liked" : "Like"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
