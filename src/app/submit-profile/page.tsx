"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Check, Loader2, Plus, X, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-ink">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "h-12 w-full rounded-lg border border-hairline bg-white px-4 text-base text-ink placeholder:text-muted focus:outline-none focus:border-2 focus:border-ink transition-colors";
const selectCls = inputCls + " appearance-none";

interface Sibling {
  relation: string;
  ageBracket: string;
  maritalStatus: string;
  professionEducation: string;
}

async function resizePhoto(file: File, maxEdge = 640): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width: w, height: h } = img;
      const scale = Math.min(1, maxEdge / Math.max(w, h));
      w = Math.round(w * scale);
      h = Math.round(h * scale);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d")?.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export default function SubmitProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SubmitProfileContent />
    </Suspense>
  );
}

function SubmitProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/directory";
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [f, setF] = useState({
    full_name: "", gender: "", age: "", heightFeet: "", heightInches: "",
    marital_status: "single", disability: "No", phone: "",
    qualification: "", institution: "",
    profession: "", work_location: "", future_plans: "", income: "",
    religion: "Islam", caste: "", sect: "", nationality: "Pakistani",
    property_ownership: "", property_size: "", vehicle: "", property_additional: "",
    city: "", locality: "",
    father_occupation: "", mother_occupation: "",
    pref_age_min: "", pref_age_max: "", pref_height_min: "", pref_city: "", pref_caste: "",
    pref_sect: "", pref_qualification: "", pref_habits: "", pref_divorced_widowed: "", pref_working_woman: "",
    pref_other: "",
  });
  const [siblings, setSiblings] = useState<Sibling[]>([]);
  const [consent, setConsent] = useState(false);

  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const addSibling = () => setSiblings((s) => [...s, { relation: "Brother", ageBracket: "", maritalStatus: "", professionEducation: "" }]);
  const updateSibling = (i: number, k: keyof Sibling, v: string) =>
    setSiblings((s) => s.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));
  const removeSibling = (i: number) => setSiblings((s) => s.filter((_, idx) => idx !== i));

  const handlePhoto = async (file: File) => {
    try {
      setPhoto(await resizePhoto(file));
    } catch {
      setError("Could not read that photo — please try another.");
    }
  };

  const validateStep1 = () => {
    if (!f.full_name.trim()) return "Please enter the full name.";
    if (!f.gender) return "Please select gender.";
    if (!f.phone.trim()) return "Please add a contact number.";
    return null;
  };

  const next = () => {
    setError("");
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    }
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => { setStep((s) => Math.max(1, s - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submit = async () => {
    const err = validateStep1();
    if (err) { setError(err); setStep(1); return; }
    if (!consent) { setError("Please confirm consent to complete your profile."); return; }
    setError("");
    setLoading(true);
    const res = await fetch("/api/directory/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, photo, siblings, consent }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Something went wrong. Please try again."); return; }
    setDone(data.reference_code || "your profile");
  };

  const skip = async () => {
    setSkipping(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ intake_skipped: true }).eq("id", user.id);
    }
    router.push(nextUrl);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-5">
          <Check className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-semibold text-ink">Profile completed</h1>
        <p className="text-muted text-sm mt-2 max-w-xs">
          Thank you. Your reference is <span className="font-medium text-ink">{done}</span>. Our team will review the details before it appears in our directory.
        </p>
        <button onClick={() => router.push(nextUrl)} className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-600 text-white font-medium">
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-hairline">
        <div className="max-w-lg mx-auto px-5 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <LogoMark className="w-8 h-8" />
            <span className="font-semibold text-ink">Complete Your Profile</span>
          </div>
          <button onClick={skip} disabled={skipping} aria-label="Skip for now" className="text-muted hover:text-ink p-1">
            {skipping ? <Loader2 className="h-5 w-5 animate-spin" /> : <X className="h-5 w-5" />}
          </button>
        </div>
        <div className="max-w-lg mx-auto px-5 pb-3 flex gap-1.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-brand-600" : "bg-hairline"}`} />
          ))}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {step === 1 && (
          <>
            <div>
              <h2 className="text-2xl font-semibold text-ink tracking-tight">Basic Info</h2>
              <p className="text-sm text-muted mt-1">Tell us a little about yourself to complete your profile.</p>
            </div>

            <div className="flex items-start gap-2.5 rounded-[14px] bg-brand-50 px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
              <p className="text-xs text-brand-800 leading-relaxed">
                All information you share here is kept completely private and confidential. Nothing is shown publicly — your contact number is never revealed to anyone until you approve an introduction.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-full bg-surface-soft border border-hairline flex items-center justify-center overflow-hidden shrink-0"
              >
                {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <Camera className="h-6 w-6 text-muted" />}
              </button>
              <div>
                <button onClick={() => fileRef.current?.click()} className="text-sm font-medium text-brand-600">
                  {photo ? "Change photo" : "Add photo"}
                </button>
                <p className="text-xs text-muted mt-0.5">
                  Optional — kept private until requested. Not comfortable sharing one? No problem, feel free to skip — we'll use a tasteful placeholder instead.
                </p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Field label="Full name" required><input className={inputCls} value={f.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field></div>
              <Field label="Gender" required>
                <select className={selectCls} value={f.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </Field>
              <Field label="Age"><input type="number" min={16} max={80} className={inputCls} value={f.age} onChange={(e) => set("age", e.target.value)} /></Field>
              <Field label="Height (ft)">
                <select className={selectCls} value={f.heightFeet} onChange={(e) => set("heightFeet", e.target.value)}>
                  <option value="">ft</option>{[4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Height (in)">
                <select className={selectCls} value={f.heightInches} onChange={(e) => set("heightInches", e.target.value)}>
                  <option value="">in</option>{Array.from({ length: 12 }, (_, i) => i).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Marital status">
                <select className={selectCls} value={f.marital_status} onChange={(e) => set("marital_status", e.target.value)}>
                  <option value="single">Single</option><option value="divorced">Divorced</option><option value="widowed">Widowed</option>
                </select>
              </Field>
              <Field label="Disability">
                <select className={selectCls} value={f.disability} onChange={(e) => set("disability", e.target.value)}>
                  <option value="No">No</option><option value="Yes">Yes</option>
                </select>
              </Field>
              <div className="col-span-2">
                <Field label="Contact number (yours or guardian's)" required>
                  <input className={inputCls} placeholder="+92 3XX XXXXXXX" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
                </Field>
                <p className="text-xs text-muted mt-1">Kept private. Never shown publicly — only shared once someone unlocks or you approve an introduction.</p>
              </div>
            </div>

            <h3 className="font-semibold text-ink pt-2">Education</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Qualification"><input className={inputCls} placeholder="BSCS, M.Sc, MBA..." value={f.qualification} onChange={(e) => set("qualification", e.target.value)} /></Field>
              <Field label="Institution"><input className={inputCls} value={f.institution} onChange={(e) => set("institution", e.target.value)} /></Field>
            </div>

            <h3 className="font-semibold text-ink pt-2">Job Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Profession"><input className={inputCls} value={f.profession} onChange={(e) => set("profession", e.target.value)} /></Field>
              <Field label="Work location"><input className={inputCls} value={f.work_location} onChange={(e) => set("work_location", e.target.value)} /></Field>
              <Field label="Future plans"><input className={inputCls} value={f.future_plans} onChange={(e) => set("future_plans", e.target.value)} /></Field>
              <Field label="Income"><input className={inputCls} placeholder="Leave blank if undisclosed" value={f.income} onChange={(e) => set("income", e.target.value)} /></Field>
            </div>

            <h3 className="font-semibold text-ink pt-2">Religion Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Religion"><input className={inputCls} value={f.religion} onChange={(e) => set("religion", e.target.value)} /></Field>
              <Field label="Caste"><input className={inputCls} value={f.caste} onChange={(e) => set("caste", e.target.value)} /></Field>
              <Field label="Sect"><input className={inputCls} value={f.sect} onChange={(e) => set("sect", e.target.value)} /></Field>
              <Field label="Nationality"><input className={inputCls} value={f.nationality} onChange={(e) => set("nationality", e.target.value)} /></Field>
            </div>

            <h3 className="font-semibold text-ink pt-2">Property Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ownership"><input className={inputCls} placeholder="Own home / Rented" value={f.property_ownership} onChange={(e) => set("property_ownership", e.target.value)} /></Field>
              <Field label="Size"><input className={inputCls} placeholder="5 Marla, 4-Storey" value={f.property_size} onChange={(e) => set("property_size", e.target.value)} /></Field>
              <Field label="Vehicle"><input className={inputCls} value={f.vehicle} onChange={(e) => set("vehicle", e.target.value)} /></Field>
              <Field label="Additional property"><input className={inputCls} value={f.property_additional} onChange={(e) => set("property_additional", e.target.value)} /></Field>
            </div>

            <h3 className="font-semibold text-ink pt-2">Address</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="City"><input className={inputCls} value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
              <Field label="Locality"><input className={inputCls} value={f.locality} onChange={(e) => set("locality", e.target.value)} /></Field>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-2xl font-semibold text-ink tracking-tight">Family Details</h2>
              <p className="text-sm text-muted mt-1">Parents and siblings.</p>
            </div>

            <h3 className="font-semibold text-ink">Parents</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Father's occupation"><input className={inputCls} value={f.father_occupation} onChange={(e) => set("father_occupation", e.target.value)} /></Field>
              <Field label="Mother's occupation"><input className={inputCls} value={f.mother_occupation} onChange={(e) => set("mother_occupation", e.target.value)} /></Field>
            </div>

            <div className="pt-2">
              <h3 className="font-semibold text-ink mb-3">Siblings <span className="text-muted font-normal text-sm">— add as many as needed</span></h3>
              <div className="space-y-3">
                {siblings.map((s, i) => (
                  <div key={i} className="relative rounded-[14px] border border-hairline p-4 grid grid-cols-2 gap-3">
                    <button onClick={() => removeSibling(i)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-hairline flex items-center justify-center text-muted hover:text-ink">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <Field label="Relation">
                      <select className={selectCls} value={s.relation} onChange={(e) => updateSibling(i, "relation", e.target.value)}>
                        <option>Brother</option><option>Sister</option>
                      </select>
                    </Field>
                    <Field label="Age bracket"><input className={inputCls} placeholder="25-30" value={s.ageBracket} onChange={(e) => updateSibling(i, "ageBracket", e.target.value)} /></Field>
                    <Field label="Marital status"><input className={inputCls} placeholder="Married / Single" value={s.maritalStatus} onChange={(e) => updateSibling(i, "maritalStatus", e.target.value)} /></Field>
                    <Field label="Profession / education"><input className={inputCls} value={s.professionEducation} onChange={(e) => updateSibling(i, "professionEducation", e.target.value)} /></Field>
                  </div>
                ))}
              </div>
              <button onClick={addSibling} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
                <Plus className="h-4 w-4" /> Add sibling
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-2xl font-semibold text-ink tracking-tight">Requirements</h2>
              <p className="text-sm text-muted mt-1">What are you looking for in a match?</p>
            </div>

            <h3 className="font-semibold text-ink">Basic Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Age from"><input type="number" className={inputCls} value={f.pref_age_min} onChange={(e) => set("pref_age_min", e.target.value)} /></Field>
              <Field label="Age to"><input type="number" className={inputCls} value={f.pref_age_max} onChange={(e) => set("pref_age_max", e.target.value)} /></Field>
              <Field label="Min height"><input className={inputCls} placeholder={`e.g. 5'2"`} value={f.pref_height_min} onChange={(e) => set("pref_height_min", e.target.value)} /></Field>
              <Field label="City preference"><input className={inputCls} value={f.pref_city} onChange={(e) => set("pref_city", e.target.value)} /></Field>
              <div className="col-span-2"><Field label="Caste preference"><input className={inputCls} placeholder="Leave blank if open" value={f.pref_caste} onChange={(e) => set("pref_caste", e.target.value)} /></Field></div>
            </div>

            <h3 className="font-semibold text-ink pt-2">Background &amp; Lifestyle</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Sect preference"><input className={inputCls} value={f.pref_sect} onChange={(e) => set("pref_sect", e.target.value)} /></Field>
              <Field label="Qualification preference"><input className={inputCls} value={f.pref_qualification} onChange={(e) => set("pref_qualification", e.target.value)} /></Field>
              <Field label="Habits preference"><input className={inputCls} placeholder="Non-smoker preferred" value={f.pref_habits} onChange={(e) => set("pref_habits", e.target.value)} /></Field>
              <Field label="Divorced / widowed acceptance"><input className={inputCls} placeholder="Open to consider / Not acceptable" value={f.pref_divorced_widowed} onChange={(e) => set("pref_divorced_widowed", e.target.value)} /></Field>
              <div className="col-span-2">
                <Field label="Working woman acceptable?">
                  <select className={selectCls} value={f.pref_working_woman} onChange={(e) => set("pref_working_woman", e.target.value)}>
                    <option value="">—</option><option value="Acceptable">Acceptable</option><option value="Not acceptable">Not acceptable</option>
                  </select>
                </Field>
              </div>
            </div>

            <h3 className="font-semibold text-ink pt-2">Other Demands</h3>
            <textarea
              className="w-full min-h-[90px] rounded-lg border border-hairline bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:outline-none focus:border-2 focus:border-ink"
              placeholder="Deendar family, no dowry demand, settled abroad preferred..."
              value={f.pref_other}
              onChange={(e) => set("pref_other", e.target.value)}
            />

            <label className="flex items-start gap-3 pt-4 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-brand-600" />
              <span className="text-sm text-body">
                I confirm the above details are accurate and I consent to my profile being reviewed and listed in the bureau's directory, with my contact details kept private until unlocked or an introduction is arranged.
              </span>
            </label>
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {step > 1 && (
            <button onClick={back} className="flex-1 h-12 rounded-lg border border-hairline text-ink font-medium hover:bg-surface-soft transition-colors">
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={next} className="flex-1 h-12 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors">
              Next
            </button>
          ) : (
            <button onClick={submit} disabled={loading} className="flex-1 h-12 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Complete profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
