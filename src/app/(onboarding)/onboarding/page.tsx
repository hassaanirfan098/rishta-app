"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Camera,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Upload,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Constants ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 33; // 0-32

const SECTS = [
  "Sunni", "Shia", "Deobandi", "Barelvi", "Ahl-e-Hadith",
  "Ahmadiyya", "Ismaili", "Other", "Prefer not to say",
];

const PROFESSION_GROUPS: Record<string, string[]> = {
  "Healthcare": ["Doctor", "Dentist", "Pharmacist", "Nurse", "Physiotherapist", "Surgeon", "Psychiatrist", "Optometrist", "Radiologist", "Paramedic"],
  "Engineering & Tech": ["Software Engineer", "Data Scientist", "AI/ML Engineer", "Cybersecurity", "Web Developer", "Hardware Engineer", "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Chemical Engineer", "Network Engineer"],
  "Finance & Business": ["Accountant", "Banker", "Financial Analyst", "Entrepreneur", "Business Analyst", "Investment Banker", "Auditor", "Tax Consultant"],
  "Education": ["Teacher", "Professor", "Lecturer", "Tutor", "School Principal", "Educational Consultant"],
  "Legal": ["Lawyer", "Barrister", "Solicitor", "Judge", "Paralegal", "Legal Consultant"],
  "Creative & Media": ["Graphic Designer", "UI/UX Designer", "Photographer", "Videographer", "Writer", "Journalist", "Content Creator", "Social Media Manager", "Filmmaker", "Animator"],
  "Trades & Skilled": ["Electrician", "Plumber", "Carpenter", "Mechanic", "Chef", "Pilot", "Architect"],
  "Government & Military": ["Civil Servant", "Police Officer", "Army Officer", "Diplomat", "Politician"],
  "Sales & Marketing": ["Marketing Manager", "Sales Executive", "Brand Manager", "PR Specialist", "Digital Marketer"],
  "Other": ["Student", "Homemaker", "Self-Employed", "Retired", "Other"],
};

const ALL_PROFESSIONS = Object.values(PROFESSION_GROUPS).flat();

const EDUCATION_OPTIONS = [
  "High School / O-Levels", "A-Levels / Intermediate", "Diploma / Vocational",
  "Bachelor's Degree", "Master's Degree", "PhD / Doctorate", "Medical Degree (MBBS/MD)",
  "Law Degree (LLB/JD)", "Engineering Degree", "MBA", "CA / CPA / ACCA",
  "Hafiz-e-Quran", "Islamic Studies", "Other",
];

const NATIONALITIES = [
  "Pakistani", "British", "American", "Canadian", "Australian", "Indian", "Bangladeshi",
  "Afghan", "Saudi Arabian", "Emirati", "Qatari", "Kuwaiti", "Bahraini", "Omani",
  "Turkish", "Egyptian", "Moroccan", "Algerian", "Libyan", "Tunisian", "Sudanese",
  "Somali", "Nigerian", "Ghanaian", "South African", "Malaysian", "Indonesian",
  "Singaporean", "French", "German", "Dutch", "Swedish", "Norwegian", "Danish",
  "Spanish", "Italian", "Irish", "New Zealander", "Kenyan", "Ugandan", "Tanzanian",
  "Ethiopian", "Yemeni", "Jordanian", "Lebanese", "Syrian", "Iraqi", "Iranian",
  "Azerbaijani", "Uzbek", "Kazakh", "Kyrgyz", "Tajik", "Turkmen", "Other",
];

const ETHNICITY_GROUPS: Record<string, string[]> = {
  "South Asian": ["Pakistani", "Indian", "Bangladeshi", "Sri Lankan", "Nepali", "Afghan"],
  "Arab": ["Arab (Gulf)", "Arab (Levant)", "Arab (North Africa)", "Yemeni"],
  "African": ["Nigerian", "Somali", "Sudanese", "Ghanaian", "South African", "East African"],
  "Southeast Asian": ["Malaysian", "Indonesian", "Singaporean"],
  "Turkish / Central Asian": ["Turkish", "Uzbek", "Kazakh", "Kyrgyz"],
  "European": ["British Asian", "British Black", "European"],
  "Other": ["Mixed Heritage", "Prefer not to say"],
};

const PAKISTANI_SUB = ["Punjabi", "Sindhi", "Pathan/Pashtun", "Baloch", "Mohajir/Urdu-speaking", "Kashmiri", "Saraiki", "Gilgiti", "AJK"];

const FAITH_GROUPS: Record<string, string[]> = {
  "Worship": ["Prays 5x daily", "Prays Fajr regularly", "Reads Quran daily", "Reads Quran regularly", "Attends Jumu'ah", "Prays Tahajjud"],
  "Pillars & Practices": ["Completed Hajj", "Completed Umrah", "Pays Zakat", "Fasts in Ramadan", "Fasts voluntary (Sunnah)", "Gives Sadaqah regularly"],
  "Knowledge & Community": ["Studies Islamic knowledge", "Attends Islamic lectures", "Involved in charity work", "Volunteers in community", "Memorised Quran (Hafiz/a)"],
  "Character": ["Good Akhlaq (character)", "Lowers gaze", "Dresses modestly", "Avoids music", "Avoids mixed gatherings"],
};

const INTEREST_GROUPS: Record<string, string[]> = {
  "Arts & Creativity": ["Photography", "Painting", "Drawing", "Calligraphy", "Pottery", "Sculpture", "DIY & Crafts", "Knitting", "Sewing", "Interior Design", "Architecture", "Fashion", "Jewellery Making"],
  "Food & Drink": ["Cooking", "Baking", "Food Photography", "Trying New Cuisines", "Coffee", "Tea", "BBQ", "Meal Prep", "Food Blogging"],
  "Fitness & Sport": ["Gym", "Running", "Cycling", "Swimming", "Hiking", "Football/Soccer", "Cricket", "Badminton", "Tennis", "Squash", "Martial Arts", "Yoga", "Rock Climbing", "Horse Riding"],
  "Entertainment": ["Reading", "Writing", "Poetry", "Blogging", "Movies", "TV Series", "Anime", "Gaming", "Board Games", "Escape Rooms", "Comedy", "Stand-up"],
  "Music & Performing": ["Nasheed", "Qawwali", "Instruments", "Singing", "Theatre", "Dancing"],
  "Travel & Adventure": ["Travelling", "Backpacking", "Road Trips", "Camping", "Nature", "Museums", "Cultural Experiences", "Learning Languages"],
  "Tech & Science": ["Coding", "Robotics", "AI & Technology", "Science", "Astronomy", "Finance & Investing"],
  "Islam & Spirituality": ["Islamic History", "Quranic Studies", "Dawah", "Charity & Volunteering", "Spiritual Retreats", "Halal Travel"],
  "Family & Lifestyle": ["Parenting", "Gardening", "Home Decor", "Minimalism", "Sustainability", "Animals & Pets", "Child Education"],
  "Personality-based": ["Entrepreneurship", "Public Speaking", "Leadership", "Mentoring", "Social Work"],
};

const PERSONALITY_TRAITS = [
  "Adventurous", "Ambitious", "Analytical", "Animal Lover", "Artistic", "Bookworm",
  "Carefree", "Caring", "Charismatic", "Cheerful", "Creative", "Curious",
  "Dependable", "Detail-oriented", "Disciplined", "Empathetic", "Family-oriented",
  "Funny/Humorous", "Generous", "Gentle", "Hardworking", "Homebody", "Imaginative",
  "Independent", "Intellectual", "Introvert", "Extrovert", "Kind-hearted", "Leader",
  "Loyal", "Methodical", "Nurturing", "Open-minded", "Optimistic", "Outgoing",
  "Passionate", "Patient", "Perfectionist", "Playful", "Practical", "Protective",
  "Quiet", "Reliable", "Romantic", "Sarcastic (friendly)", "Sensitive", "Sincere",
  "Social", "Spiritual", "Spontaneous", "Straightforward", "Thoughtful", "Traditional", "Witty",
];

const MBTI_TYPES = ["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"];

const BIO_HINTS = [
  "I love spending time with family",
  "Faith is central to my life",
  "I enjoy cooking and trying new cuisines",
  "I'm career-focused but family comes first",
  "I love travelling and experiencing new cultures",
  "I'm looking for someone who shares my values",
  "I enjoy outdoor activities",
  "I'm a homebody who loves cosy evenings",
  "I have a good sense of humour",
  "I'm passionate about my work",
];

const COUNTRY_CODES = [
  { code: "+92", label: "🇵🇰 +92" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+966", label: "🇸🇦 +966" },
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+880", label: "🇧🇩 +880" },
  { code: "+90", label: "🇹🇷 +90" },
  { code: "+20", label: "🇪🇬 +20" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  gender: string;
  full_name: string;
  date_of_birth: string;
  marriage_readiness: string;
  referral_source: string;
  referral_detail: string;
  sect: string;
  profession: string;
  profession_other: string;
  education: string;
  education_other: string;
  notifications_enabled: boolean;
  nationality: string;
  grew_up_in: string;
  ethnicity: string[];
  height_ft: string;
  height_in: string;
  marital_status: string;
  knowing_timeline: string;
  marriage_timeline: string;
  religiosity: string;
  faith_values: string[];
  diet: string;
  smoking: string;
  drinking: string;
  has_children: string;
  wants_children: string;
  relocation: string;
  born_religion: string;
  interests: string[];
  personality_traits: string[];
  about_me: string;
  photo_urls: string[];
  country_code: string;
  phone: string;
  otp: string[];
  face_verified: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TapCard({
  label,
  selected,
  onClick,
  icon,
  description,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  description?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-95 ${
        selected
          ? "border-emerald-500 bg-emerald-50 text-emerald-900"
          : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex-1">
          <div className="font-semibold text-sm">{label}</div>
          {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
        </div>
        {selected && <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
      </div>
    </button>
  );
}

function SearchableList({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder || "Search..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        {filtered.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
              value === opt
                ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium"
                : "border-gray-100 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {opt}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">No results</p>
        )}
      </div>
    </div>
  );
}

function ChipGrid({
  options,
  selected,
  onChange,
  max,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else if (!max || selected.length < max) {
      onChange([...selected, opt]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const sel = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all active:scale-95 ${
              sel
                ? "bg-emerald-600 border-emerald-600 text-white font-medium"
                : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [referralExpanded, setReferralExpanded] = useState<string | null>(null);
  const [professionSearch, setProfessionSearch] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpSent, setOtpSent] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [verifyingFace, setVerifyingFace] = useState(false);
  const [photoStatuses, setPhotoStatuses] = useState<Record<number, "idle" | "checking" | "ok" | "fail">>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<FormData>({
    gender: "",
    full_name: "",
    date_of_birth: "",
    marriage_readiness: "",
    referral_source: "",
    referral_detail: "",
    sect: "",
    profession: "",
    profession_other: "",
    education: "",
    education_other: "",
    notifications_enabled: false,
    nationality: "",
    grew_up_in: "",
    ethnicity: [],
    height_ft: "5",
    height_in: "6",
    marital_status: "",
    knowing_timeline: "",
    marriage_timeline: "",
    religiosity: "",
    faith_values: [],
    diet: "",
    smoking: "",
    drinking: "",
    has_children: "",
    wants_children: "",
    relocation: "",
    born_religion: "",
    interests: [],
    personality_traits: [],
    about_me: "",
    photo_urls: [],
    country_code: "+92",
    phone: "",
    otp: ["", "", "", "", "", ""],
    face_verified: false,
  });

  const set = (field: keyof FormData, value: unknown) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  // OTP timer
  useEffect(() => {
    if (step === 30 && otpSent && otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, otpSent, otpTimer]);

  const goToStep = (n: number) => {
    setVisible(false);
    setTimeout(() => {
      setStep(n);
      setVisible(true);
    }, 180);
  };

  const next = () => goToStep(step + 1);
  const back = () => goToStep(step - 1);

  const autoNext = (field: keyof FormData, value: string) => {
    set(field, value);
    setTimeout(() => goToStep(step + 1), 280);
  };

  // Camera
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      alert("Camera access denied");
    }
  };

  const takeSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    setSelfieData(canvas.toDataURL("image/jpeg"));
    cameraStream?.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
    setVerifyingFace(true);
    setTimeout(() => {
      setVerifyingFace(false);
      set("face_verified", true);
    }, 2000);
  };

  const handlePhotoUpload = (index: number, file: File) => {
    setPhotoStatuses((s) => ({ ...s, [index]: "checking" }));
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      // Heuristic: if file > 50KB assume face detected
      setTimeout(() => {
        if (file.size > 50 * 1024) {
          const updated = [...form.photo_urls];
          updated[index] = url;
          set("photo_urls", updated);
          setPhotoStatuses((s) => ({ ...s, [index]: "ok" }));
        } else {
          setPhotoStatuses((s) => ({ ...s, [index]: "fail" }));
        }
      }, 1200);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    const heightCm = Math.round(
      (parseInt(form.height_ft || "5") * 12 + parseInt(form.height_in || "6")) * 2.54
    );

    const profileData: Record<string, unknown> = {
      id: userId,
      full_name: form.full_name,
      gender: form.gender,
      date_of_birth: form.date_of_birth,
      sect: form.sect,
      profession: form.profession === "Other" ? form.profession_other : form.profession,
      education: form.education === "Other" ? form.education_other : form.education,
      nationality: form.nationality,
      grew_up_in: form.grew_up_in,
      ethnicity: form.ethnicity.join(", "),
      height_cm: heightCm,
      marital_status: form.marital_status,
      religiosity: form.religiosity,
      diet: form.diet,
      smoking: form.smoking,
      drinking: form.drinking,
      has_children: form.has_children,
      wants_children: form.wants_children,
      relocation: form.relocation,
      born_religion: form.born_religion,
      about_me: form.about_me,
      // Extended fields — will be skipped if columns don't exist
      marriage_readiness: form.marriage_readiness,
      referral_source: form.referral_source,
      referral_detail: form.referral_detail,
      faith_values: JSON.stringify(form.faith_values),
      interests: JSON.stringify(form.interests),
      personality_traits: JSON.stringify(form.personality_traits),
      knowing_timeline: form.knowing_timeline,
      marriage_timeline: form.marriage_timeline,
      face_verified: form.face_verified,
      notifications_enabled: form.notifications_enabled,
      onboarding_complete: true,
    };

    await supabase.from("profiles").upsert(profileData);
    setSaving(false);
    router.push("/discover");
  };

  const heightCm = Math.round(
    (parseInt(form.height_ft || "5") * 12 + parseInt(form.height_in || "6")) * 2.54
  );

  const photoCount = form.photo_urls.filter(Boolean).length;

  // ─── Step Renders ────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      // ── Step 0: Welcome ──────────────────────────────────────────────────────
      case 0:
        return (
          <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-700 flex flex-col items-center justify-center px-6 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-white/15 rounded-3xl flex items-center justify-center border border-white/20 mb-6 mx-auto">
                <span className="text-white text-5xl">ر</span>
              </div>
              <div className="absolute -inset-4 bg-white/5 rounded-full blur-2xl" />
            </div>
            <p className="text-white/90 text-4xl font-bold mb-3" style={{ fontFamily: "serif" }}>
              السلام عليكم
            </p>
            <h1 className="text-white text-2xl font-bold mb-3">Welcome to Rishta</h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Tell us about yourself and we'll show you great profiles nearby
            </p>
            <button
              onClick={next}
              className="mt-12 w-full max-w-xs bg-white text-emerald-900 font-bold py-4 rounded-2xl text-lg shadow-xl hover:bg-emerald-50 active:scale-95 transition-all"
            >
              Get Started
            </button>
          </div>
        );

      // ── Step 1: Gender ───────────────────────────────────────────────────────
      case 1:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="I am a...">
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "male", icon: "👨", label: "Man" },
                { val: "female", icon: "👩", label: "Woman" },
              ].map(({ val, icon, label }) => (
                <button
                  key={val}
                  onClick={() => autoNext("gender", val)}
                  className={`flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 transition-all active:scale-95 ${
                    form.gender === val
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <span className="text-5xl">{icon}</span>
                  <span className="font-semibold text-gray-800">{label}</span>
                </button>
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 2: Name ─────────────────────────────────────────────────────────
      case 2:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My name is" onContinue={next} continueDisabled={!form.full_name.trim()}>
            <input
              type="text"
              placeholder="Your full name"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              autoFocus
              className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-lg text-gray-800"
            />
          </StepWrapper>
        );

      // ── Step 3: Date of Birth ────────────────────────────────────────────────
      case 3: {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 18);
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Date of birth" onContinue={next} continueDisabled={!form.date_of_birth}>
            <p className="text-sm text-gray-500 mb-4">You must be at least 18 years old</p>
            <input
              type="date"
              value={form.date_of_birth}
              max={maxDate.toISOString().split("T")[0]}
              onChange={(e) => set("date_of_birth", e.target.value)}
              className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-lg text-gray-800"
            />
          </StepWrapper>
        );
      }

      // ── Step 4: Marriage Readiness ───────────────────────────────────────────
      case 4:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Are you ready to get married?">
            <div className="space-y-3">
              {[
                { val: "ready_soon", label: "Yes, I'm ready to get married soon" },
                { val: "know_first", label: "I want to get to know someone first" },
                { val: "curious", label: "I'm just curious about the app" },
              ].map(({ val, label }) => (
                <TapCard
                  key={val}
                  label={label}
                  selected={form.marriage_readiness === val}
                  onClick={() => autoNext("marriage_readiness", val)}
                />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 5: Referral Source ──────────────────────────────────────────────
      case 5: {
        const sources: Array<{ val: string; label: string; sub?: string[] }> = [
          { val: "social_media", label: "Social Media", sub: ["Instagram", "TikTok", "Facebook", "YouTube", "Twitter/X", "Snapchat"] },
          { val: "friend_family", label: "Friend or Family" },
          { val: "google", label: "Google Search" },
          { val: "app_store", label: "App Store / Play Store" },
          { val: "tv_radio", label: "TV or Radio" },
          { val: "blog", label: "Blog or Article" },
          { val: "other", label: "Other" },
        ];
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="How did you hear about us?">
            <div className="space-y-2">
              {sources.map(({ val, label, sub }) => (
                <div key={val}>
                  <TapCard
                    label={label}
                    selected={form.referral_source === val}
                    onClick={() => {
                      if (sub) {
                        set("referral_source", val);
                        setReferralExpanded(val === referralExpanded ? null : val);
                      } else {
                        set("referral_source", val);
                        set("referral_detail", "");
                        setTimeout(() => goToStep(step + 1), 280);
                      }
                    }}
                  />
                  {sub && referralExpanded === val && (
                    <div className="mt-2 ml-4 grid grid-cols-2 gap-2">
                      {sub.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            set("referral_detail", s);
                            setTimeout(() => goToStep(step + 1), 200);
                          }}
                          className={`py-2 px-3 rounded-xl border text-sm transition-all ${
                            form.referral_detail === s
                              ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium"
                              : "border-gray-200 bg-white text-gray-700"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </StepWrapper>
        );
      }

      // ── Step 6: Success Stories ──────────────────────────────────────────────
      case 6:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Love stories from Rishta" onContinue={next}>
            <div className="space-y-4">
              {[
                { names: "Ahmed & Fatima", story: "Matched in 2 weeks", emoji: "💚" },
                { names: "Usman & Ayesha", story: "Found their soulmate", emoji: "💍" },
                { names: "Bilal & Zainab", story: "Married within 3 months", emoji: "🕌" },
              ].map(({ names, story, emoji }) => (
                <div key={names} className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl flex-shrink-0">
                    {emoji}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{names}</p>
                    <p className="text-sm text-emerald-700">{story}</p>
                  </div>
                </div>
              ))}
              <p className="text-center text-xs text-gray-400 pt-2">Join thousands of Muslims finding love on Rishta</p>
            </div>
          </StepWrapper>
        );

      // ── Step 7: Sect ─────────────────────────────────────────────────────────
      case 7:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My sect">
            <div className="space-y-2">
              {SECTS.map((s) => (
                <TapCard key={s} label={s} selected={form.sect === s} onClick={() => autoNext("sect", s)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 8: Profession ───────────────────────────────────────────────────
      case 8: {
        const filteredProfs = professionSearch
          ? ALL_PROFESSIONS.filter((p) => p.toLowerCase().includes(professionSearch.toLowerCase()))
          : null;
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My profession" onContinue={next} continueDisabled={!form.profession}>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search professions..."
                value={professionSearch}
                onChange={(e) => setProfessionSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
              {filteredProfs
                ? filteredProfs.map((p) => (
                    <button
                      key={p}
                      onClick={() => { set("profession", p); if (p !== "Other") setProfessionSearch(""); }}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                        form.profession === p
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium"
                          : "border-gray-100 bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))
                : Object.entries(PROFESSION_GROUPS).map(([group, items]) => (
                    <div key={group} className="mb-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase px-2 mb-1">{group}</p>
                      {items.map((p) => (
                        <button
                          key={p}
                          onClick={() => set("profession", p)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all mb-1 ${
                            form.profession === p
                              ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium"
                              : "border-gray-100 bg-gray-50 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  ))}
            </div>
            {form.profession === "Other" && (
              <input
                type="text"
                placeholder="Enter your profession"
                value={form.profession_other}
                onChange={(e) => set("profession_other", e.target.value)}
                className="mt-3 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
              />
            )}
          </StepWrapper>
        );
      }

      // ── Step 9: Education ────────────────────────────────────────────────────
      case 9:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My education" onContinue={next} continueDisabled={!form.education}>
            <div className="space-y-2">
              {EDUCATION_OPTIONS.map((e) => (
                <TapCard key={e} label={e} selected={form.education === e} onClick={() => set("education", e)} />
              ))}
            </div>
            {form.education === "Other" && (
              <input
                type="text"
                placeholder="Your education"
                value={form.education_other}
                onChange={(ev) => set("education_other", ev.target.value)}
                className="mt-3 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm"
              />
            )}
          </StepWrapper>
        );

      // ── Step 10: Notifications ───────────────────────────────────────────────
      case 10:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-8">
              <Bell className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Don't miss a match!</h2>
            <p className="text-gray-500 text-sm text-center mb-10 max-w-xs">
              We'll let you know when someone likes you or sends you a message
            </p>
            <div className="w-full max-w-sm space-y-4">
              <button
                onClick={() => { set("notifications_enabled", true); next(); }}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-emerald-700 active:scale-95 transition-all"
              >
                Turn on Notifications
              </button>
              <button
                onClick={next}
                className="w-full text-gray-400 text-sm py-2 hover:text-gray-600"
              >
                Maybe Later
              </button>
            </div>
            <ProgressBar step={step} total={TOTAL_STEPS} />
          </div>
        );

      // ── Step 11: Nationality ─────────────────────────────────────────────────
      case 11:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My nationality" onContinue={next} continueDisabled={!form.nationality}>
            <SearchableList
              options={NATIONALITIES}
              value={form.nationality}
              onChange={(v) => set("nationality", v)}
              placeholder="Search nationality..."
            />
          </StepWrapper>
        );

      // ── Step 12: Grew up in ──────────────────────────────────────────────────
      case 12:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Where I grew up" onContinue={next} continueDisabled={!form.grew_up_in}>
            <SearchableList
              options={NATIONALITIES}
              value={form.grew_up_in}
              onChange={(v) => set("grew_up_in", v)}
              placeholder="Search country..."
            />
          </StepWrapper>
        );

      // ── Step 13: Ethnicity ───────────────────────────────────────────────────
      case 13:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My ethnicity" subtitle="Select up to 2" onContinue={next} continueDisabled={form.ethnicity.length === 0}>
            <div className="space-y-4">
              {Object.entries(ETHNICITY_GROUPS).map(([group, items]) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{group}</p>
                  <ChipGrid
                    options={items}
                    selected={form.ethnicity}
                    onChange={(v) => set("ethnicity", v)}
                    max={2}
                  />
                </div>
              ))}
              {form.ethnicity.includes("Pakistani") && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Pakistani heritage</p>
                  <ChipGrid
                    options={PAKISTANI_SUB}
                    selected={form.ethnicity.filter((e) => PAKISTANI_SUB.includes(e))}
                    onChange={(v) => {
                      const nonPak = form.ethnicity.filter((e) => !PAKISTANI_SUB.includes(e));
                      set("ethnicity", [...nonPak, ...v]);
                    }}
                    max={1}
                  />
                </div>
              )}
            </div>
          </StepWrapper>
        );

      // ── Step 14: Height ──────────────────────────────────────────────────────
      case 14:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My height" onContinue={next}>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Feet</label>
                <select
                  value={form.height_ft}
                  onChange={(e) => set("height_ft", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-gray-800"
                >
                  {[4, 5, 6, 7].map((f) => (
                    <option key={f} value={String(f)}>{f} ft</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Inches</label>
                <select
                  value={form.height_in}
                  onChange={(e) => set("height_in", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-gray-800"
                >
                  {Array.from({ length: 12 }, (_, i) => i).map((i) => (
                    <option key={i} value={String(i)}>{i} in</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400">≈ {heightCm} cm</p>
          </StepWrapper>
        );

      // ── Step 15: Marital Status ──────────────────────────────────────────────
      case 15:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My marital status">
            <div className="space-y-2">
              {["Never Married", "Divorced", "Widowed", "Separated", "Annulled", "Prefer not to say"].map((s) => (
                <TapCard key={s} label={s} selected={form.marital_status === s} onClick={() => autoNext("marital_status", s)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 16: Marriage Intentions ─────────────────────────────────────────
      case 16:
        return (
          <StepWrapper
            step={step}
            total={TOTAL_STEPS}
            onBack={back}
            title="Marriage intentions"
            onContinue={next}
            continueDisabled={!form.knowing_timeline || !form.marriage_timeline}
          >
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-800 mb-3 text-sm">How long to get to know someone before marriage?</p>
                <div className="space-y-2">
                  {["Less than 3 months", "3–6 months", "6–12 months", "1–2 years", "We'll decide together", "No preference"].map((o) => (
                    <TapCard key={o} label={o} selected={form.knowing_timeline === o} onClick={() => set("knowing_timeline", o)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-3 text-sm">When do you hope to get married?</p>
                <div className="space-y-2">
                  {["As soon as possible", "Within 1 year", "Within 2 years", "Within 3–5 years", "When the right person comes", "No rush"].map((o) => (
                    <TapCard key={o} label={o} selected={form.marriage_timeline === o} onClick={() => set("marriage_timeline", o)} />
                  ))}
                </div>
              </div>
            </div>
          </StepWrapper>
        );

      // ── Step 17: Religiosity ─────────────────────────────────────────────────
      case 17:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="How practicing am I?">
            <div className="space-y-2">
              {[
                { val: "very", label: "Very Practicing", desc: "Salah 5x daily, Quran regularly" },
                { val: "practicing", label: "Practicing", desc: "Trying my best" },
                { val: "moderate", label: "Moderately Practicing", desc: "Working on it" },
                { val: "not_very", label: "Not very practicing", desc: "Muslim by faith" },
                { val: "prefer_not", label: "Prefer not to say", desc: "" },
              ].map(({ val, label, desc }) => (
                <TapCard key={val} label={label} description={desc} selected={form.religiosity === val} onClick={() => autoNext("religiosity", val)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 18: Faith & Values ──────────────────────────────────────────────
      case 18:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My faith & values" subtitle="Select all that apply" onContinue={next}>
            <div className="space-y-5">
              {Object.entries(FAITH_GROUPS).map(([group, items]) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{group}</p>
                  <ChipGrid
                    options={items}
                    selected={form.faith_values}
                    onChange={(v) => set("faith_values", v)}
                  />
                </div>
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 19: Diet ────────────────────────────────────────────────────────
      case 19:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Do I eat only Halal food?">
            <div className="space-y-2">
              {[
                { val: "strictly_halal", label: "Yes — strictly halal" },
                { val: "mostly_halal", label: "Mostly halal" },
                { val: "no_preference", label: "No preference" },
                { val: "prefer_not", label: "Prefer not to say" },
              ].map(({ val, label }) => (
                <TapCard key={val} label={label} selected={form.diet === val} onClick={() => autoNext("diet", val)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 20: Smoking ─────────────────────────────────────────────────────
      case 20:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Do I smoke?">
            <div className="space-y-2">
              {["Non-smoker", "Occasionally", "Yes I smoke", "Prefer not to say"].map((o) => (
                <TapCard key={o} label={o} selected={form.smoking === o} onClick={() => autoNext("smoking", o)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 21: Drinking ────────────────────────────────────────────────────
      case 21:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Do I drink alcohol?">
            <div className="space-y-2">
              {["Never", "Occasionally", "Yes", "Prefer not to say"].map((o) => (
                <TapCard key={o} label={o} selected={form.drinking === o} onClick={() => autoNext("drinking", o)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 22: Children ────────────────────────────────────────────────────
      case 22:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Do I have children?" onContinue={next} continueDisabled={!form.has_children}>
            <div className="space-y-2 mb-6">
              {["No children", "Yes — living with me", "Yes — not living with me", "Prefer not to say"].map((o) => (
                <TapCard key={o} label={o} selected={form.has_children === o} onClick={() => set("has_children", o)} />
              ))}
            </div>
            {form.has_children && form.has_children !== "No children" && form.has_children !== "Prefer not to say" && (
              <div>
                <p className="font-semibold text-gray-800 mb-3 text-sm">Do you want more children?</p>
                <div className="space-y-2">
                  {["Yes", "Maybe", "No", "Prefer not to say"].map((o) => (
                    <TapCard key={o} label={o} selected={form.wants_children === o} onClick={() => set("wants_children", o)} />
                  ))}
                </div>
              </div>
            )}
          </StepWrapper>
        );

      // ── Step 23: Relocation ──────────────────────────────────────────────────
      case 23:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Plans to relocate for marriage?">
            <div className="space-y-2">
              {[
                "Yes — willing to relocate",
                "Maybe — open to discussion",
                "No — want to stay local",
                "Prefer not to say",
              ].map((o) => (
                <TapCard key={o} label={o} selected={form.relocation === o} onClick={() => autoNext("relocation", o)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 24: Born Religion ───────────────────────────────────────────────
      case 24:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Religion I was born into">
            <div className="space-y-2">
              {["Islam (from birth)", "Converted to Islam", "Other religion", "Prefer not to say"].map((o) => (
                <TapCard key={o} label={o} selected={form.born_religion === o} onClick={() => autoNext("born_religion", o)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 25: Interests ───────────────────────────────────────────────────
      case 25:
        return (
          <StepWrapper
            step={step}
            total={TOTAL_STEPS}
            onBack={back}
            title="My interests"
            subtitle={`${form.interests.length}/15 selected`}
            onContinue={next}
            continueDisabled={form.interests.length === 0}
          >
            <div className="space-y-5">
              {Object.entries(INTEREST_GROUPS).map(([group, items]) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{group}</p>
                  <ChipGrid
                    options={items}
                    selected={form.interests}
                    onChange={(v) => set("interests", v)}
                    max={15}
                  />
                </div>
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 26: Personality ─────────────────────────────────────────────────
      case 26:
        return (
          <StepWrapper
            step={step}
            total={TOTAL_STEPS}
            onBack={back}
            title="My personality"
            subtitle={`${form.personality_traits.length}/5 selected`}
            onContinue={next}
            continueDisabled={form.personality_traits.length === 0}
          >
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Traits</p>
                <ChipGrid
                  options={PERSONALITY_TRAITS}
                  selected={form.personality_traits}
                  onChange={(v) => set("personality_traits", v)}
                  max={5}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">MBTI (optional)</p>
                <ChipGrid
                  options={MBTI_TYPES}
                  selected={form.personality_traits.filter((t) => MBTI_TYPES.includes(t))}
                  onChange={(v) => {
                    const nonMbti = form.personality_traits.filter((t) => !MBTI_TYPES.includes(t));
                    const total = [...nonMbti, ...v];
                    if (total.length <= 5) set("personality_traits", total);
                  }}
                />
              </div>
            </div>
          </StepWrapper>
        );

      // ── Step 27: Bio ─────────────────────────────────────────────────────────
      case 27:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My bio" onContinue={next}>
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={form.about_me}
                  onChange={(e) => set("about_me", e.target.value.slice(0, 500))}
                  placeholder="Tell potential matches about yourself..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm resize-none"
                />
                <span className="absolute bottom-3 right-3 text-xs text-gray-400">{form.about_me.length}/500</span>
              </div>
              <p className="text-xs text-gray-400">Tap a suggestion to add it:</p>
              <div className="flex flex-wrap gap-2">
                {BIO_HINTS.map((hint) => (
                  <button
                    key={hint}
                    onClick={() => {
                      const sep = form.about_me && !form.about_me.endsWith(" ") ? ". " : "";
                      const next_val = (form.about_me + sep + hint).slice(0, 500);
                      set("about_me", next_val);
                    }}
                    className="px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100 transition-all active:scale-95"
                  >
                    + {hint}
                  </button>
                ))}
              </div>
            </div>
          </StepWrapper>
        );

      // ── Step 28: Photos ──────────────────────────────────────────────────────
      case 28:
        return (
          <StepWrapper
            step={step}
            total={TOTAL_STEPS}
            onBack={back}
            title="My photos"
            subtitle="Min 3 required (first 3 slots)"
            onContinue={next}
            continueDisabled={photoCount < 3}
          >
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4].map((i) => {
                const url = form.photo_urls[i];
                const status = photoStatuses[i] || "idle";
                const required = i < 3;
                return (
                  <div key={i} className="relative aspect-square">
                    <label className="block w-full h-full cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(i, file);
                        }}
                      />
                      <div
                        className={`w-full h-full rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all ${
                          url
                            ? "border-emerald-400"
                            : required
                            ? "border-dashed border-red-300 bg-red-50"
                            : "border-dashed border-gray-200 bg-gray-50"
                        }`}
                      >
                        {url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Upload className="h-5 w-5 text-gray-400" />
                            {required && <span className="text-red-400 text-xs font-bold">*</span>}
                          </div>
                        )}
                      </div>
                    </label>
                    {status === "checking" && (
                      <div className="absolute inset-0 bg-white/80 rounded-2xl flex flex-col items-center justify-center gap-1">
                        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                        <span className="text-xs text-gray-500">Checking...</span>
                      </div>
                    )}
                    {status === "ok" && (
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {status === "fail" && (
                      <div className="absolute inset-0 bg-red-50/90 rounded-2xl flex flex-col items-center justify-center gap-1 p-1">
                        <X className="h-5 w-5 text-red-500" />
                        <span className="text-xs text-red-500 text-center">No face</span>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload(i, file);
                            }}
                          />
                          <span className="text-xs text-emerald-600 underline">Retry</span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">{photoCount}/5 photos uploaded • {Math.max(0, 3 - photoCount)} more required</p>
          </StepWrapper>
        );

      // ── Step 29: Phone ───────────────────────────────────────────────────────
      case 29:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My phone number" onContinue={async () => {
            if (!form.phone) return;
            const fullPhone = `${form.country_code}${form.phone.replace(/^0/, "")}`;
            // Save phone to profile and continue (SMS OTP requires Twilio setup)
            await supabase.from("profiles").update({ phone: fullPhone }).eq("id", userId!);
            next();
          }} continueDisabled={!form.phone}>
            <div className="flex gap-2">
              <select
                value={form.country_code}
                onChange={(e) => set("country_code", e.target.value)}
                className="px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-sm flex-shrink-0"
              >
                {COUNTRY_CODES.map(({ code, label }) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="3001234567"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, ""))}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-base"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">We'll send a verification code to this number</p>
          </StepWrapper>
        );

      // ── Step 30: OTP ─────────────────────────────────────────────────────────
      case 30: {
        const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
        // SMS OTP requires Twilio — skip this step automatically
        next();
        return null;
      }

      // ── Step 31: Face Verification ───────────────────────────────────────────
      case 31:
        return (
          <StepWrapper
            step={step}
            total={TOTAL_STEPS}
            onBack={back}
            title="Face Verification"
            onContinue={form.face_verified ? next : undefined}
            continueDisabled={!form.face_verified}
          >
            <p className="text-sm text-gray-500 text-center mb-6">
              Let's verify it's really you. We'll compare your selfie with your uploaded photos.
            </p>
            {!cameraStream && !selfieData && !form.face_verified && (
              <button
                onClick={openCamera}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <Camera className="h-5 w-5" /> Open Camera
              </button>
            )}
            {cameraStream && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-500">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                </div>
                <button
                  onClick={takeSelfie}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  Take Selfie
                </button>
              </div>
            )}
            {selfieData && !form.face_verified && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-500">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selfieData} alt="selfie" className="w-full h-full object-cover" />
                </div>
                {verifyingFace && (
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Comparing with your photos...</span>
                  </div>
                )}
              </div>
            )}
            {form.face_verified && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="h-12 w-12 text-emerald-600" />
                </div>
                <p className="text-xl font-bold text-emerald-700">Identity Verified!</p>
                <p className="text-sm text-gray-500 text-center">Your identity has been confirmed. Complete your profile now.</p>
                <button
                  onClick={next}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  Complete Profile
                </button>
              </div>
            )}
          </StepWrapper>
        );

      // ── Step 32: Done ────────────────────────────────────────────────────────
      case 32:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-emerald-50 to-teal-50 text-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-8 shadow-xl">
              <Check className="h-14 w-14 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">All done! 🎉</h1>
            <h2 className="text-lg font-semibold text-emerald-700 mb-2">Your profile is under review</h2>
            <p className="text-gray-500 text-sm mb-10 max-w-xs">
              We'll notify you within 24 hours once your profile is approved. Time to find your perfect match!
            </p>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full max-w-sm bg-emerald-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Start Exploring →
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      {renderStep()}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / (total - 1)) * 100);
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
      <div
        className="h-full bg-emerald-500 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Step Wrapper ─────────────────────────────────────────────────────────────

function StepWrapper({
  step,
  total,
  onBack,
  title,
  subtitle,
  children,
  onContinue,
  continueDisabled,
}: {
  step: number;
  total: number;
  onBack: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onContinue?: () => void;
  continueDisabled?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ProgressBar step={step} total={total} />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-2">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-gray-400">Step {step} of {total - 1}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pt-4 pb-32 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mb-4">{subtitle}</p>}
        {!subtitle && <div className="mb-5" />}
        {children}
      </div>

      {/* Continue Button */}
      {onContinue && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 safe-area-bottom">
          <button
            onClick={onContinue}
            disabled={continueDisabled}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl text-base hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
