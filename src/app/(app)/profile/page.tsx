"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit2, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { calculateAge } from "@/lib/utils";
import { LogoGlyph } from "@/components/Logo";

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
  bg?: string;
  border?: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
      <h3 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-2xl bg-brand-50 flex items-center justify-center text-lg">{emoji}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1.5 rounded-xl border-2 border-brand-200 bg-white text-brand-700 text-sm font-medium">
      {children}
    </span>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    green: "bg-brand-100 text-brand-800 border-brand-200",
    red: "bg-red-100 text-red-800 border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <span className={`px-3 py-1.5 rounded-xl border-2 text-sm font-semibold ${colors[color] || colors.gray}`}>
      {label}
    </span>
  );
}

const INTEREST_EMOJIS: Record<string, string> = {
  "Photography": "📸", "Painting": "🎨", "Drawing": "✏️", "Calligraphy": "🖋️",
  "Pottery": "🏺", "Sculpture": "🗿", "DIY & Crafts": "🔨", "Knitting": "🧶",
  "Sewing": "🧵", "Interior Design": "🏠", "Architecture": "🏛️", "Fashion": "👗",
  "Jewellery Making": "💍", "Cooking": "👨‍🍳", "Baking": "🍰", "Food Photography": "📸",
  "Trying New Cuisines": "🌍", "Coffee": "☕", "Tea": "🍵", "BBQ": "🔥",
  "Meal Prep": "📦", "Food Blogging": "📝", "Gym": "💪", "Running": "🏃",
  "Cycling": "🚴", "Swimming": "🏊", "Hiking": "🥾", "Football/Soccer": "⚽",
  "Cricket": "🏏", "Badminton": "🏸", "Tennis": "🎾", "Squash": "🏉",
  "Martial Arts": "🥋", "Yoga": "🧘", "Rock Climbing": "🧗", "Horse Riding": "🐴",
  "Reading": "📚", "Writing": "✍️", "Poetry": "📜", "Blogging": "💻",
  "Movies": "🎬", "TV Series": "📺", "Anime": "🎌", "Gaming": "🎮",
  "Board Games": "♟️", "Escape Rooms": "🔐", "Comedy": "😂", "Stand-up": "🎤",
  "Nasheed": "🎵", "Qawwali": "🎶", "Instruments": "🎸", "Singing": "🎤",
  "Theatre": "🎭", "Dancing": "💃", "Travelling": "✈️", "Backpacking": "🎒",
  "Road Trips": "🚗", "Camping": "⛺", "Nature": "🌿", "Museums": "🏛️",
  "Cultural Experiences": "🌍", "Learning Languages": "🗣️", "Coding": "💻",
  "Robotics": "🤖", "AI & Technology": "🤖", "Science": "🔬", "Astronomy": "🔭",
  "Finance & Investing": "📈", "Islamic History": "📜", "Quranic Studies": "📖",
  "Dawah": "🤲", "Charity & Volunteering": "❤️", "Spiritual Retreats": "🕌",
  "Halal Travel": "✈️", "Parenting": "👨‍👩‍👧", "Gardening": "🌱", "Home Decor": "🏡",
  "Minimalism": "🪴", "Sustainability": "♻️", "Animals & Pets": "🐾",
  "Child Education": "📚", "Entrepreneurship": "💼", "Public Speaking": "🎤",
  "Leadership": "👑", "Mentoring": "🤝", "Social Work": "❤️",
};

const PERSONALITY_EMOJIS: Record<string, string> = {
  "Adventurous": "🏔️", "Ambitious": "🚀", "Analytical": "🔍", "Animal Lover": "🐾",
  "Artistic": "🎨", "Bookworm": "📚", "Carefree": "🌸", "Caring": "💚",
  "Charismatic": "✨", "Cheerful": "😊", "Creative": "🎨", "Curious": "🔍",
  "Dependable": "🤝", "Detail-oriented": "🔬", "Disciplined": "⚡", "Empathetic": "💛",
  "Family-oriented": "👨‍👩‍👧", "Funny/Humorous": "😂", "Generous": "💝", "Gentle": "🌸",
  "Hardworking": "💪", "Homebody": "🏠", "Imaginative": "💭", "Independent": "🦅",
  "Intellectual": "🧠", "Introvert": "🌙", "Extrovert": "☀️", "Kind-hearted": "💚",
  "Leader": "👑", "Loyal": "🤝", "Methodical": "📋", "Nurturing": "🌱",
  "Open-minded": "🌈", "Optimistic": "☀️", "Outgoing": "🎉", "Passionate": "🔥",
  "Patient": "🕊️", "Perfectionist": "✨", "Playful": "🎮", "Practical": "🔧",
  "Protective": "🛡️", "Quiet": "🌿", "Reliable": "⚓", "Romantic": "🌹",
  "Sarcastic (friendly)": "😏", "Sensitive": "💛", "Sincere": "💎", "Social": "👥",
  "Spiritual": "🕌", "Spontaneous": "⚡", "Straightforward": "💬", "Thoughtful": "🌷",
  "Traditional": "📜", "Witty": "😄",
};

function parseJsonArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      // not JSON, treat as comma-separated
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Record<string, string | boolean | string[] | null | undefined> | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);

      // Gallery lives in profile_photos (written by onboarding + settings)
      const { data: photoRows } = await supabase
        .from("profile_photos")
        .select("url")
        .eq("profile_id", user.id)
        .order("order_index");
      const urls = (photoRows || []).map((r: { url: string }) => r.url);
      if (data?.avatar_url && !urls.includes(data.avatar_url)) urls.unshift(data.avatar_url);
      setPhotos(urls);

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
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const age = profile?.date_of_birth ? calculateAge(profile.date_of_birth as string) : null;
  const interests = parseJsonArray(profile?.interests);
  const personalityTraits = parseJsonArray(profile?.personality_traits);
  const faithValues = parseJsonArray(profile?.faith_values);
  const avatarUrl = profile?.avatar_url as string | undefined;
  const gender = profile?.gender as string | undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoGlyph className="w-7 h-7" />
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Profile</h1>
          </div>
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

      <div className="max-w-lg mx-auto pb-10">
        {/* Hero */}
        <div className="relative h-[440px] bg-gradient-to-br from-brand-300 to-brand-600 sm:rounded-b-[32px] overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[7rem]">
              {gender === "male" ? "👨" : "👩"}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            {profile?.is_verified && (
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur text-brand-700 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm">
                <Shield className="h-3 w-3 text-gold-600" />
                Verified
              </div>
            )}
            {!profile?.is_approved && (
              <Badge variant="secondary">Pending Approval</Badge>
            )}
          </div>
          <div className="absolute bottom-5 left-5 right-5">
            <h2 className="text-white text-3xl font-extrabold tracking-tight leading-none drop-shadow">
              {(profile?.full_name as string) || "Your Name"}{age ? <span className="font-semibold">, {age}</span> : ""}
            </h2>
            {!!(profile?.city || profile?.country) && (
              <p className="text-white/85 text-sm mt-2 flex items-center gap-1">
                <span>📍</span>
                {[(profile?.city as string | undefined), (profile?.country as string | undefined)].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Content sections */}
        <div className="px-4 py-5 space-y-4">

          {/* Onboarding CTA */}
          {!profile?.onboarding_complete && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
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

          {/* About Me */}
          {profile?.about_me && (
            <Section title="About Me" emoji="✨">
              <div className="border-l-4 border-brand-400 pl-4">
                <p className="text-gray-700 text-sm leading-relaxed italic">
                  "{profile.about_me as string}"
                </p>
              </div>
            </Section>
          )}

          {/* Location */}
          {(profile?.city || profile?.country || profile?.grew_up_in) && (
            <Section title="Location" emoji="📍" bg="bg-sky-50" border="border-sky-100">
              <div className="space-y-2">
                {(profile?.city || profile?.country) && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-base">🏙️</span>
                    <span>Based in {[profile?.city, profile?.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {profile?.grew_up_in && profile.grew_up_in !== profile?.country && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-base">🌱</span>
                    <span>Grew up in {profile.grew_up_in as string}</span>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Career & Education */}
          {(profile?.profession || profile?.education) && (
            <Section title="Career & Education" emoji="💼" bg="bg-purple-50" border="border-purple-100">
              <div className="flex flex-wrap gap-3">
                {profile?.profession && (
                  <div className="flex-1 min-w-[120px] bg-white rounded-xl p-3 border border-purple-100">
                    <p className="text-xs text-gray-400 mb-1">Profession</p>
                    <p className="font-semibold text-gray-800 text-sm">💼 {profile.profession as string}</p>
                  </div>
                )}
                {profile?.education && (
                  <div className="flex-1 min-w-[120px] bg-white rounded-xl p-3 border border-purple-100">
                    <p className="text-xs text-gray-400 mb-1">Education</p>
                    <p className="font-semibold text-gray-800 text-sm">🎓 {profile.education as string}</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Faith & Religion */}
          {(profile?.sect || profile?.religiosity || faithValues.length > 0) && (
            <Section title="Faith & Religion" emoji="🕌" bg="bg-amber-50" border="border-amber-100">
              <div className="space-y-3">
                {profile?.sect && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-20 flex-shrink-0">Sect:</span>
                    <span className="font-semibold text-gray-800 text-sm">☀️ {profile.sect as string}</span>
                  </div>
                )}
                {profile?.religiosity && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-20 flex-shrink-0">Practice:</span>
                    <span className="font-semibold text-gray-800 text-sm">✨ {profile.religiosity as string}</span>
                  </div>
                )}
                {faithValues.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Faith values:</p>
                    <div className="flex flex-wrap gap-2">
                      {faithValues.map((v) => (
                        <Chip key={v}>{v}</Chip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Relationship Goals */}
          {(profile?.marriage_readiness || profile?.knowing_timeline || profile?.marriage_timeline) && (
            <Section title="Relationship Goals" emoji="💍" bg="bg-rose-50" border="border-rose-100">
              <div className="space-y-3">
                {profile?.marriage_readiness && (
                  <div className="bg-white rounded-xl p-3 border border-rose-100">
                    <p className="text-xs text-gray-400 mb-1">Readiness</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {profile.marriage_readiness === "ready_soon" ? "💍 Ready to get married soon" :
                       profile.marriage_readiness === "know_first" ? "💬 Wants to get to know first" :
                       "👀 Just exploring"}
                    </p>
                  </div>
                )}
                {profile?.knowing_timeline && (
                  <div className="bg-white rounded-xl p-3 border border-rose-100">
                    <p className="text-xs text-gray-400 mb-1">Getting to know each other</p>
                    <p className="font-semibold text-gray-800 text-sm">⏱️ {profile.knowing_timeline as string}</p>
                  </div>
                )}
                {profile?.marriage_timeline && (
                  <div className="bg-white rounded-xl p-3 border border-rose-100">
                    <p className="text-xs text-gray-400 mb-1">Marriage timeline</p>
                    <p className="font-semibold text-gray-800 text-sm">📅 {profile.marriage_timeline as string}</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Family */}
          {(profile?.marital_status || profile?.has_children || profile?.wants_children || profile?.relocation) && (
            <Section title="Family" emoji="👨‍👩‍👧" bg="bg-pink-50" border="border-pink-100">
              <div className="flex flex-wrap gap-2">
                {profile?.marital_status && (
                  <StatusBadge label={`💚 ${profile.marital_status as string}`} color="green" />
                )}
                {profile?.has_children && (
                  <StatusBadge label={`👶 ${profile.has_children as string}`} color="blue" />
                )}
                {profile?.wants_children && (
                  <StatusBadge label={`🌱 Wants: ${profile.wants_children as string}`} color="yellow" />
                )}
                {profile?.relocation && (
                  <StatusBadge label={`✈️ ${profile.relocation as string}`} color="gray" />
                )}
              </div>
            </Section>
          )}

          {/* Background */}
          {(profile?.ethnicity || profile?.nationality || profile?.born_religion || profile?.caste || profile?.language) && (
            <Section title="Background" emoji="🌍" bg="bg-purple-50" border="border-purple-100">
              <div className="space-y-2">
                {profile?.nationality && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-24 flex-shrink-0">Nationality:</span>
                    <span className="font-medium text-gray-800">🌐 {profile.nationality as string}</span>
                  </div>
                )}
                {profile?.ethnicity && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-24 flex-shrink-0">Ethnicity:</span>
                    <span className="font-medium text-gray-800">🧬 {profile.ethnicity as string}</span>
                  </div>
                )}
                {profile?.born_religion && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-24 flex-shrink-0">Religion:</span>
                    <span className="font-medium text-gray-800">☪️ {profile.born_religion as string}</span>
                  </div>
                )}
                {profile?.caste && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-24 flex-shrink-0">Caste:</span>
                    <span className="font-medium text-gray-800">{profile.caste as string}</span>
                  </div>
                )}
                {profile?.language && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 w-24 flex-shrink-0">Language:</span>
                    <span className="font-medium text-gray-800">🗣️ {profile.language as string}</span>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Lifestyle */}
          {(profile?.diet || profile?.smoking || profile?.drinking) && (
            <Section title="Lifestyle" emoji="🏃" bg="bg-blue-50" border="border-blue-100">
              <div className="flex flex-wrap gap-2">
                {profile?.diet && (
                  <StatusBadge
                    label={`🍽️ ${profile.diet as string}`}
                    color={profile.diet === "strictly_halal" ? "green" : profile.diet === "mostly_halal" ? "yellow" : "gray"}
                  />
                )}
                {profile?.smoking && (
                  <StatusBadge
                    label={`🚭 ${profile.smoking as string}`}
                    color={profile.smoking === "Non-smoker" ? "green" : profile.smoking === "Yes I smoke" ? "red" : "yellow"}
                  />
                )}
                {profile?.drinking && (
                  <StatusBadge
                    label={`🥤 ${profile.drinking as string}`}
                    color={profile.drinking === "Never" ? "green" : profile.drinking === "Yes" ? "red" : "yellow"}
                  />
                )}
              </div>
            </Section>
          )}

          {/* Interests */}
          {interests.length > 0 && (
            <Section title="Interests" emoji="❤️" bg="bg-fuchsia-50" border="border-fuchsia-100">
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-xl border-2 border-fuchsia-200 bg-white text-fuchsia-700 text-sm font-medium"
                  >
                    {INTEREST_EMOJIS[interest] && `${INTEREST_EMOJIS[interest]} `}{interest}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Personality */}
          {personalityTraits.length > 0 && (
            <Section title="Personality" emoji="🧠" bg="bg-indigo-50" border="border-indigo-100">
              <div className="flex flex-wrap gap-2">
                {personalityTraits.map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1.5 rounded-xl border-2 border-indigo-200 bg-white text-indigo-700 text-sm font-medium"
                  >
                    {PERSONALITY_EMOJIS[trait] && `${PERSONALITY_EMOJIS[trait]} `}{trait}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* More Photos */}
          <Section title="Photos" emoji="📸" bg="bg-gray-50" border="border-gray-200">
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 6).map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="w-full aspect-square rounded-xl object-cover"
                />
              ))}
              {/* Placeholder slots */}
              {Array.from({ length: Math.max(0, 3 - photos.length) }).map((_, i) => (
                <div key={`placeholder-${i}`} className="w-full aspect-square rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-300">📷</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/settings")}
              className="mt-3 w-full py-2.5 rounded-full border-2 border-brand-100 text-brand-700 text-sm font-semibold hover:bg-brand-50 transition-colors"
            >
              Manage photos
            </button>
          </Section>

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
    </div>
  );
}
