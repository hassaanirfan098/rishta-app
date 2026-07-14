"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock, Heart, MapPin, Loader2, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";

function initials(name: string) {
  return (name || "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px] border border-hairline p-5">
      <h3 className="font-semibold text-ink mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-hairline-soft last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm text-ink text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default function DirectoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: p } = await supabase.from("directory_profiles").select("*").eq("id", id).single();
      if (!p) { router.push("/directory"); return; }
      setProfile(p);

      const { data: unlock } = await supabase
        .from("unlocks").select("id").eq("user_id", user.id).eq("directory_profile_id", id).single();

      if (unlock) {
        setIsUnlocked(true);
        const { data: ph } = await supabase.rpc("get_directory_phone", { p_profile_id: id });
        setPhone((ph as string) || null);
      }

      setLoading(false);
    };
    load();
  }, [id]);

  const startPayment = async () => {
    setPaymentLoading(true);
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "unlock", directoryProfileId: id }),
    });
    const data = await res.json();
    setPaymentLoading(false);
    if (data.url) window.location.href = data.url;
    else toast("Payment setup failed. Please try again.", "error");
  };

  const expressInterest = async () => {
    setInterestLoading(true);
    const res = await fetch("/api/express-interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directoryProfileId: id }),
    });
    setInterestLoading(false);
    if (res.ok) toast("Interest sent — our team will be in touch.", "success");
    else toast("Could not send interest. Try again.", "error");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-brand-600 animate-spin" />
      </div>
    );
  }
  if (!profile) return null;

  const siblings = Array.isArray(profile.siblings) ? profile.siblings : [];

  return (
    <div className="min-h-screen bg-white pb-32">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-hairline">
        <div className="max-w-lg mx-auto px-5 h-16 flex items-center gap-3">
          <button onClick={() => router.back()} aria-label="Go back" className="text-muted hover:text-ink"><ArrowLeft className="h-5 w-5" /></button>
          <span className="font-semibold text-ink truncate">{profile.full_name}</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">
        {/* Photo + headline */}
        <div className="relative w-full aspect-[4/5] rounded-[20px] overflow-hidden bg-surface-strong">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold-100 to-gold-300 text-gold-700 text-6xl font-semibold">
              {initials(profile.full_name)}
            </div>
          )}
          <span className="absolute top-4 left-4 flex items-center gap-1 bg-white text-ink text-xs font-medium pl-1.5 pr-2.5 py-1 rounded-full shadow-card">
            <Lock className="h-3 w-3 text-gold-600" /> Directory
          </span>
          {profile.is_featured && (
            <span className="absolute top-4 right-4 bg-gold-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-card">Featured</span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            {profile.full_name}{profile.age ? <span className="font-normal text-muted">, {profile.age}</span> : ""}
          </h1>
          {(profile.city || profile.country) && (
            <p className="text-sm text-muted mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {[profile.city, profile.locality, profile.country].filter(Boolean).join(", ")}
            </p>
          )}
          {profile.reference_code && <p className="text-xs text-muted mt-1">Ref {profile.reference_code}</p>}
        </div>

        <Section title="Basic Info">
          <Row label="Height" value={profile.height_display} />
          <Row label="Marital status" value={profile.marital_status} />
          <Row label="Disability" value={profile.disability} />
        </Section>

        <Section title="Education & Career">
          <Row label="Qualification" value={profile.education} />
          <Row label="Institution" value={profile.institution} />
          <Row label="Profession" value={profile.profession} />
          <Row label="Work location" value={profile.work_location} />
          <Row label="Future plans" value={profile.future_plans} />
          <Row label="Income" value={profile.income} />
        </Section>

        <Section title="Religion & Background">
          <Row label="Religion" value={profile.religion} />
          <Row label="Sect" value={profile.sect} />
          <Row label="Caste" value={profile.caste} />
          <Row label="Nationality" value={profile.nationality} />
        </Section>

        <Section title="Property">
          <Row label="Ownership" value={profile.property_ownership} />
          <Row label="Size" value={profile.property_size} />
          <Row label="Vehicle" value={profile.vehicle} />
          <Row label="Additional" value={profile.property_additional} />
        </Section>

        {(profile.father_occupation || profile.mother_occupation || siblings.length > 0) && (
          <Section title="Family">
            <Row label="Father's occupation" value={profile.father_occupation} />
            <Row label="Mother's occupation" value={profile.mother_occupation} />
            {siblings.length > 0 && (
              <div className="mt-3 space-y-2">
                {siblings.map((s: any, i: number) => (
                  <div key={i} className="text-sm text-body bg-surface-soft rounded-lg px-3 py-2">
                    {s.relation}{s.ageBracket ? `, ${s.ageBracket}` : ""}{s.maritalStatus ? ` · ${s.maritalStatus}` : ""}{s.professionEducation ? ` · ${s.professionEducation}` : ""}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {(profile.pref_age_min || profile.pref_city || profile.pref_sect || profile.pref_other) && (
          <Section title="Looking For">
            <Row label="Age range" value={profile.pref_age_min || profile.pref_age_max ? `${profile.pref_age_min || "?"}–${profile.pref_age_max || "?"}` : null} />
            <Row label="Min height" value={profile.pref_height_min} />
            <Row label="City" value={profile.pref_city} />
            <Row label="Caste" value={profile.pref_caste} />
            <Row label="Sect" value={profile.pref_sect} />
            <Row label="Qualification" value={profile.pref_qualification} />
            <Row label="Habits" value={profile.pref_habits} />
            <Row label="Divorced/widowed" value={profile.pref_divorced_widowed} />
            <Row label="Working woman" value={profile.pref_working_woman} />
            {profile.pref_other && <p className="text-sm text-body mt-3">{profile.pref_other}</p>}
          </Section>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-hairline px-5 py-4 max-w-lg mx-auto">
        {isUnlocked ? (
          <div className="flex items-center justify-center gap-2 h-12 rounded-lg bg-surface-soft text-ink font-medium">
            <Phone className="h-4 w-4 text-brand-600" /> {phone || "Contact unlocked"}
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={expressInterest} disabled={interestLoading} className="flex-1 h-12 rounded-lg border border-hairline text-ink font-medium hover:bg-surface-soft transition-colors flex items-center justify-center gap-2">
              {interestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />} Interested
            </button>
            <button onClick={startPayment} disabled={paymentLoading} className="flex-1 h-12 rounded-lg bg-gold-500 hover:bg-gold-600 text-white font-medium transition-colors flex items-center justify-center gap-2">
              {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Unlock — Rs 500
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
