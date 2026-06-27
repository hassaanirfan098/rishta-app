"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

const TOTAL_STEPS = 8;

const SECTS = ["Sunni", "Shia", "Deobandi", "Barelvi", "Ahl-e-Hadith", "Other"];
const RELIGIOSITY = ["Very practicing", "Practicing", "Moderate", "Learning"];
const ETHNICITIES = ["Punjabi", "Sindhi", "Pathan/Pashtun", "Baloch", "Muhajir", "Kashmiri", "Saraiki", "Arab", "South Asian", "Other"];
const EDUCATION = ["High School", "A-Levels", "Bachelor's", "Master's", "PhD", "Medical", "Engineering", "Other"];
const MARITAL_STATUS = ["Never married", "Divorced", "Widowed", "Annulled"];
const COUNTRIES = ["Pakistan", "United Kingdom", "United States", "Canada", "UAE", "Saudi Arabia", "Australia", "Other"];

const stepTitles = [
  "Basic Info",
  "Gender & Age",
  "Location",
  "Religious Background",
  "Education & Career",
  "About You",
  "Add Photo",
  "All Done!",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    city: "",
    country: "Pakistan",
    sect: "",
    religiosity: "",
    ethnicity: "",
    language: "",
    caste: "",
    education: "",
    profession: "",
    marital_status: "Never married",
    height_cm: "",
    about_me: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      // Load existing profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        if (profile.onboarding_complete) { router.push("/discover"); return; }
        setStep(profile.onboarding_step || 0);
        setFormData((prev) => ({
          ...prev,
          full_name: profile.full_name || "",
          phone: profile.phone || "",
          gender: profile.gender || "",
          date_of_birth: profile.date_of_birth || "",
          city: profile.city || "",
          country: profile.country || "Pakistan",
          sect: profile.sect || "",
          religiosity: profile.religiosity || "",
          ethnicity: profile.ethnicity || "",
          language: profile.language || "",
          caste: profile.caste || "",
          education: profile.education || "",
          profession: profile.profession || "",
          marital_status: profile.marital_status || "Never married",
          height_cm: profile.height_cm?.toString() || "",
          about_me: profile.about_me || "",
        }));
      }
    };
    getUser();
  }, []);

  const update = (key: string, value: string) =>
    setFormData((p) => ({ ...p, [key]: value }));

  const saveStep = async (nextStep: number, extra?: Record<string, unknown>) => {
    if (!userId) return;
    setSaving(true);
    setError("");

    const payload: Record<string, unknown> = {
      onboarding_step: nextStep,
      ...extra,
    };

    // Map formData fields to payload
    switch (step) {
      case 0:
        payload.full_name = formData.full_name;
        payload.phone = formData.phone;
        break;
      case 1:
        payload.gender = formData.gender;
        payload.date_of_birth = formData.date_of_birth;
        break;
      case 2:
        payload.city = formData.city;
        payload.country = formData.country;
        break;
      case 3:
        payload.sect = formData.sect;
        payload.religiosity = formData.religiosity;
        payload.ethnicity = formData.ethnicity;
        payload.language = formData.language;
        payload.caste = formData.caste;
        break;
      case 4:
        payload.education = formData.education;
        payload.profession = formData.profession;
        payload.marital_status = formData.marital_status;
        payload.height_cm = formData.height_cm ? parseInt(formData.height_cm) : null;
        break;
      case 5:
        payload.about_me = formData.about_me;
        break;
      case 6:
        // Handle photo upload
        if (avatarFile && userId) {
          const ext = avatarFile.name.split(".").pop();
          const path = `avatars/${userId}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(path, avatarFile, { upsert: true });
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(path);
            payload.avatar_url = publicUrl;
          }
        }
        break;
      case 7:
        payload.onboarding_complete = true;
        break;
    }

    const { error: dbError } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId);

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    if (nextStep >= TOTAL_STEPS) {
      router.push("/discover");
    } else {
      setStep(nextStep);
    }
  };

  const handleNext = () => saveStep(step + 1);
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const progressPct = ((step) / (TOTAL_STEPS - 1)) * 100;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={formData.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">WhatsApp / Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+92 300 1234567"
                value={formData.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-400 mt-1">Only shared after matching</p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Gender *</Label>
              <div className="flex gap-3 mt-2">
                {["male", "female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update("gender", g)}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm capitalize transition-colors ${
                      formData.gender === g
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {g === "male" ? "👨 Brother" : "👩 Sister"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => update("date_of_birth", e.target.value)}
                className="mt-1.5"
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="e.g. Lahore, London, Toronto"
                value={formData.city}
                onChange={(e) => update("city", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Country *</Label>
              <Select value={formData.country} onValueChange={(v) => update("country", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Sect</Label>
              <Select value={formData.sect} onValueChange={(v) => update("sect", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select sect" />
                </SelectTrigger>
                <SelectContent>
                  {SECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Religiosity</Label>
              <Select value={formData.religiosity} onValueChange={(v) => update("religiosity", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="How practicing are you?" />
                </SelectTrigger>
                <SelectContent>
                  {RELIGIOSITY.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ethnicity</Label>
              <Select value={formData.ethnicity} onValueChange={(v) => update("ethnicity", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  {ETHNICITIES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="caste">Caste / Biraderi (optional)</Label>
              <Input
                id="caste"
                placeholder="e.g. Syed, Rajput, Qureshi"
                value={formData.caste}
                onChange={(e) => update("caste", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Education</Label>
              <Select value={formData.education} onValueChange={(v) => update("education", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Highest qualification" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                placeholder="e.g. Doctor, Engineer, Teacher"
                value={formData.profession}
                onChange={(e) => update("profession", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Marital Status</Label>
              <Select value={formData.marital_status} onValueChange={(v) => update("marital_status", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARITAL_STATUS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="170"
                value={formData.height_cm}
                onChange={(e) => update("height_cm", e.target.value)}
                className="mt-1.5"
                min={140}
                max={220}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="about">About Me</Label>
              <Textarea
                id="about"
                placeholder="Tell potential matches about yourself — your values, interests, what you're looking for in a partner..."
                value={formData.about_me}
                onChange={(e) => update("about_me", e.target.value)}
                className="mt-1.5 min-h-[160px]"
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {formData.about_me.length}/1000
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-emerald-50 border-2 border-dashed border-emerald-300 flex items-center justify-center overflow-hidden mb-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-emerald-400 mx-auto mb-1" />
                    <span className="text-xs text-emerald-500">Upload</span>
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-200 transition-colors">
                  Choose Photo
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-3 text-center">
                A clear, modest photo increases match chances.<br />
                Sisters may choose not to add a photo.
              </p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="text-center space-y-4 py-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-2">
              <Check className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Profile Complete!</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Your profile has been submitted for review. Our team will approve it shortly, after which you can start discovering matches.
            </p>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left">
              <p className="text-sm text-amber-800 font-medium mb-1">What happens next?</p>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• Admin reviews your profile (usually within 24 hours)</li>
                <li>• You receive a notification when approved</li>
                <li>• Start browsing and sending likes!</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-emerald-600 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="max-w-sm mx-auto px-5 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 font-medium">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i <= step ? "bg-emerald-500 w-5" : "bg-gray-200 w-2"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{stepTitles[step]}</h2>
          {step === 0 && (
            <p className="text-sm text-gray-500 mt-1">Let's set up your Rishta profile</p>
          )}
        </div>

        {/* Form content */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          {renderStep()}
          {error && (
            <div className="mt-4 bg-red-50 rounded-xl p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && step < 7 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : step === 7 ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Go to App
              </>
            ) : (
              <>
                {step === 6 ? "Skip" : "Continue"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {step < 7 && step !== 0 && (
          <button
            onClick={() => saveStep(step + 1)}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-500 mt-3"
          >
            Skip this step
          </button>
        )}
      </div>
    </div>
  );
}
