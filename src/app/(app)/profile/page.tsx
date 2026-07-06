"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Edit2,
  LogOut,
  BadgeCheck,
  MapPin,
  Briefcase,
  Moon,
  HeartHandshake,
  Users,
  Globe,
  Leaf,
  Sparkles,
  Brain,
  Camera,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { calculateAge } from "@/lib/utils";
import { LogoGlyph } from "@/components/Logo";

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
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

function Chips({ items }: { items: string[] }) {
  if (!items.length) return null;
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

function initials(name: string) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function parseJsonArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val as string[];
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
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
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
          <div className="aspect-[4/5] max-h-[480px] w-full rounded-[20px] skeleton" />
          <div className="h-5 w-1/2 rounded skeleton" />
          <div className="h-40 rounded-[14px] skeleton" />
        </div>
      </div>
    );
  }

  const age = profile?.date_of_birth ? calculateAge(profile.date_of_birth as string) : null;
  const interests = parseJsonArray(profile?.interests);
  const personalityTraits = parseJsonArray(profile?.personality_traits);
  const faithValues = parseJsonArray(profile?.faith_values);
  const avatarUrl = profile?.avatar_url as string | undefined;
  const name = (profile?.full_name as string) || "Your Name";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-hairline sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoGlyph className="w-6 h-6" />
            <h1 className="text-2xl font-semibold text-ink tracking-tight">Profile</h1>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" aria-label="Edit profile" onClick={() => router.push("/settings")}>
              <Edit2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleSignOut}>
              <LogOut className="h-4.5 w-4.5 text-muted" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 pb-12 space-y-5">
        {/* Hero */}
        <div className="relative aspect-[4/5] max-h-[480px] w-full rounded-[20px] overflow-hidden bg-surface-strong shadow-card">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 text-6xl font-semibold">
              {initials(name)}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            {profile?.is_verified && (
              <span className="flex items-center gap-1 bg-white text-ink text-xs font-medium pl-1.5 pr-2.5 py-1 rounded-full shadow-card">
                <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />
                Verified
              </span>
            )}
            {!profile?.is_approved && <Badge variant="secondary">Pending approval</Badge>}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h2 className="text-white text-3xl font-semibold tracking-tight leading-none">
              {name}
              {age ? <span className="font-normal text-white/85">, {age}</span> : ""}
            </h2>
            {!!(profile?.city || profile?.country) && (
              <p className="text-white/80 text-sm mt-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {[(profile?.city as string | undefined), (profile?.country as string | undefined)].filter(Boolean).join(", ")}
              </p>
            )}
            {profile?.profession && <p className="text-white/70 text-sm mt-1">{profile.profession as string}</p>}
          </div>
        </div>

        {/* Onboarding CTA */}
        {!profile?.onboarding_complete && (
          <div className="rounded-[14px] border border-hairline p-5">
            <p className="text-sm font-semibold text-ink">Complete your profile</p>
            <p className="text-sm text-muted mt-1">Profiles with complete info get 3× more matches.</p>
            <Button size="sm" className="mt-4" onClick={() => router.push("/onboarding")}>
              Complete profile
            </Button>
          </div>
        )}

        {/* About */}
        {profile?.about_me && (
          <Section title="About" icon={Sparkles}>
            <p className="text-body text-sm leading-relaxed">{profile.about_me as string}</p>
          </Section>
        )}

        {/* Basics */}
        <Section title="Basics" icon={Users}>
          <Row label="Marital status" value={profile?.marital_status as string} />
          <Row label="Height" value={profile?.height_cm ? `${profile.height_cm} cm` : null} />
          <Row label="Grew up in" value={profile?.grew_up_in as string} />
          <Row label="Nationality" value={profile?.nationality as string} />
          <Row label="Ethnicity" value={profile?.ethnicity as string} />
          <Row label="Caste" value={profile?.caste as string} />
        </Section>

        {/* Career & Education */}
        {(profile?.profession || profile?.education) && (
          <Section title="Career & education" icon={Briefcase}>
            <Row label="Profession" value={profile?.profession as string} />
            <Row label="Education" value={profile?.education as string} />
          </Section>
        )}

        {/* Faith */}
        {(profile?.sect || profile?.religiosity || faithValues.length > 0) && (
          <Section title="Faith" icon={Moon}>
            <Row label="Sect" value={profile?.sect as string} />
            <Row label="Practice" value={profile?.religiosity as string} />
            {faithValues.length > 0 && (
              <div className="pt-3">
                <Chips items={faithValues} />
              </div>
            )}
          </Section>
        )}

        {/* Marriage intentions */}
        {(profile?.marriage_readiness || profile?.knowing_timeline || profile?.marriage_timeline || profile?.wants_children || profile?.has_children || profile?.relocation) && (
          <Section title="Marriage intentions" icon={HeartHandshake}>
            <Row
              label="Readiness"
              value={
                profile?.marriage_readiness === "ready_soon"
                  ? "Ready to marry soon"
                  : profile?.marriage_readiness === "know_first"
                    ? "Wants to get to know first"
                    : (profile?.marriage_readiness as string)
              }
            />
            <Row label="Getting to know" value={profile?.knowing_timeline as string} />
            <Row label="Marriage timeline" value={profile?.marriage_timeline as string} />
            <Row label="Has children" value={profile?.has_children as string} />
            <Row label="Wants children" value={profile?.wants_children as string} />
            <Row label="Relocation" value={profile?.relocation as string} />
          </Section>
        )}

        {/* Lifestyle */}
        {(profile?.diet || profile?.smoking || profile?.drinking) && (
          <Section title="Lifestyle" icon={Leaf}>
            <Row label="Diet" value={profile?.diet as string} />
            <Row label="Smoking" value={profile?.smoking as string} />
            <Row label="Drinking" value={profile?.drinking as string} />
          </Section>
        )}

        {/* Languages / background */}
        {(profile?.language || profile?.born_religion) && (
          <Section title="Background" icon={Globe}>
            <Row label="Language" value={profile?.language as string} />
            <Row label="Born religion" value={profile?.born_religion as string} />
          </Section>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <Section title="Interests" icon={Sparkles}>
            <Chips items={interests} />
          </Section>
        )}

        {/* Personality */}
        {personalityTraits.length > 0 && (
          <Section title="Personality" icon={Brain}>
            <Chips items={personalityTraits} />
          </Section>
        )}

        {/* Photos */}
        <Section title="Photos" icon={Camera}>
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 6).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-full aspect-square rounded-lg object-cover bg-surface-strong" />
            ))}
            {Array.from({ length: Math.max(0, 3 - photos.length) }).map((_, i) => (
              <div key={`ph-${i}`} className="w-full aspect-square rounded-lg bg-surface-soft border border-dashed border-hairline flex items-center justify-center">
                <Camera className="h-5 w-5 text-muted-soft" />
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/settings")}
            className="mt-4 w-full h-11 rounded-lg border border-hairline text-ink text-sm font-medium hover:bg-surface-soft transition-colors"
          >
            Manage photos
          </button>
        </Section>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full h-12 rounded-lg border border-hairline text-muted text-sm font-medium hover:bg-surface-soft hover:text-ink transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
