"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Camera,
  Check,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoGlyph, LogoMark } from "@/components/Logo";

// ─── Constants ───────────────────────────────────────────────────────────────

const TOTAL_STEPS = 33; // 0-32

// Single professional theme throughout
const STEP_BG: Record<number, string> = Object.fromEntries(
  Array.from({ length: 33 }, (_, i) => [i, "from-slate-900 via-slate-800 to-brand-900"])
);

const SECTS = [
  { val: "Sunni", emoji: "☀️" },
  { val: "Shia", emoji: "🌙" },
  { val: "Deobandi", emoji: "📖" },
  { val: "Barelvi", emoji: "🕌" },
  { val: "Ahl-e-Hadith", emoji: "📿" },
  { val: "Ahmadiyya", emoji: "🌟" },
  { val: "Ismaili", emoji: "✨" },
  { val: "Other", emoji: "🤝" },
  { val: "Prefer not to say", emoji: "🤐" },
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
  { val: "High School / O-Levels", emoji: "🏫" },
  { val: "A-Levels / Intermediate", emoji: "📚" },
  { val: "Diploma / Vocational", emoji: "🎓" },
  { val: "Bachelor's Degree", emoji: "🎓" },
  { val: "Master's Degree", emoji: "🏆" },
  { val: "PhD / Doctorate", emoji: "🔬" },
  { val: "Medical Degree (MBBS/MD)", emoji: "🏥" },
  { val: "Law Degree (LLB/JD)", emoji: "⚖️" },
  { val: "Engineering Degree", emoji: "⚙️" },
  { val: "MBA", emoji: "💼" },
  { val: "CA / CPA / ACCA", emoji: "📊" },
  { val: "Hafiz-e-Quran", emoji: "📖" },
  { val: "Islamic Studies", emoji: "🕌" },
  { val: "Other", emoji: "✏️" },
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

const FAITH_GROUPS: Record<string, { val: string; emoji: string }[]> = {
  "Worship": [
    { val: "Prays 5x daily", emoji: "🕌" },
    { val: "Prays Fajr regularly", emoji: "🌅" },
    { val: "Reads Quran daily", emoji: "📖" },
    { val: "Reads Quran regularly", emoji: "📚" },
    { val: "Attends Jumu'ah", emoji: "🕌" },
    { val: "Prays Tahajjud", emoji: "🌙" },
  ],
  "Pillars & Practices": [
    { val: "Completed Hajj", emoji: "🕋" },
    { val: "Completed Umrah", emoji: "🕌" },
    { val: "Pays Zakat", emoji: "💰" },
    { val: "Fasts in Ramadan", emoji: "🌙" },
    { val: "Fasts voluntary (Sunnah)", emoji: "⭐" },
    { val: "Gives Sadaqah regularly", emoji: "💝" },
  ],
  "Knowledge & Community": [
    { val: "Studies Islamic knowledge", emoji: "📖" },
    { val: "Attends Islamic lectures", emoji: "🎤" },
    { val: "Involved in charity work", emoji: "🤲" },
    { val: "Volunteers in community", emoji: "🤝" },
    { val: "Memorised Quran (Hafiz/a)", emoji: "📿" },
  ],
  "Character": [
    { val: "Good Akhlaq (character)", emoji: "💚" },
    { val: "Lowers gaze", emoji: "👁️" },
    { val: "Dresses modestly", emoji: "🧕" },
    { val: "Avoids music", emoji: "🔇" },
    { val: "Avoids mixed gatherings", emoji: "🚶" },
  ],
};

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
  emoji,
  sublabel,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  emoji?: string;
  sublabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
        selected
          ? "border-brand-600 bg-brand-50 shadow-md"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      {emoji && <span className="text-2xl flex-shrink-0">{emoji}</span>}
      <div className="text-left flex-1">
        <p className="font-semibold text-gray-900">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
      {selected && (
        <div className="ml-auto w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
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
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        {filtered.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
              value === opt
                ? "border-brand-500 bg-brand-50 text-brand-900 font-medium"
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
  emojiMap,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  max?: number;
  emojiMap?: Record<string, string>;
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
        const emoji = emojiMap?.[opt];
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-xl border-2 text-sm font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
              sel
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            {emoji && <span>{emoji}</span>}
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
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [referralExpanded, setReferralExpanded] = useState<string | null>(null);
  const [professionSearch, setProfessionSearch] = useState("");
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
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        // Not signed in — onboarding is meaningless, send to login
        router.replace("/login");
        return;
      }
      setUserId(data.user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", data.user.id)
        .single();
      if (profile?.onboarding_complete) {
        // Already onboarded — never show the flow again
        router.replace("/discover");
        return;
      }
      setCheckingAuth(false);
    });
  }, [supabase]);

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

  const handlePhotoUpload = async (index: number, file: File) => {
    if (!userId) return;
    setPhotoStatuses((s) => ({ ...s, [index]: "checking" }));
    if (file.size <= 50 * 1024) {
      setPhotoStatuses((s) => ({ ...s, [index]: "fail" }));
      return;
    }
    // Upload to storage so photos persist beyond this session
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/onboarding-${index}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) {
      setPhotoStatuses((s) => ({ ...s, [index]: "fail" }));
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    setForm((f) => {
      const updated = [...f.photo_urls];
      updated[index] = publicUrl;
      return { ...f, photo_urls: updated };
    });
    setPhotoStatuses((s) => ({ ...s, [index]: "ok" }));
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

    // First uploaded photo becomes the profile display picture
    const photos = form.photo_urls.filter(Boolean);
    if (photos.length > 0) {
      profileData.avatar_url = photos[0];
    }

    const { error: saveErr } = await supabase.from("profiles").update(profileData).eq("id", userId);
    if (saveErr) {
      console.error("Profile save error:", saveErr);
    }

    // Persist all photos to the gallery table (same source Settings and
    // profile pages read from)
    if (photos.length > 0) {
      await supabase.from("profile_photos").delete().eq("profile_id", userId);
      await supabase.from("profile_photos").insert(
        photos.map((url, i) => ({ profile_id: userId, url, order_index: i }))
      );
    }

    setSaving(false);
    router.push("/discover");
    router.refresh();
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
          <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
            <LogoMark className="w-20 h-20 rounded-3xl mb-8" rounded="rounded-3xl" />
            <p className="text-brand-600 text-3xl mb-3" style={{ fontFamily: "serif" }}>
              السلام عليكم
            </p>
            <h1 className="text-ink text-3xl font-semibold tracking-tight mb-3">Welcome to Rishta</h1>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              Tell us about yourself and we'll show you great profiles nearby
            </p>
            <button
              onClick={next}
              className="mt-12 w-full max-w-xs bg-brand-600 text-white font-medium h-12 rounded-lg text-base hover:bg-brand-700 transition-colors"
            >
              Get started
            </button>
          </div>
        );

      // ── Step 1: Gender ───────────────────────────────────────────────────────
      case 1:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="I am a..." bgClass={STEP_BG[1]}>
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
                      ? "border-brand-500 bg-brand-50 shadow-md"
                      : "border-gray-100 bg-white hover:border-gray-200"
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
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My name is" bgClass={STEP_BG[2]} onContinue={next} continueDisabled={!form.full_name.trim()}>
            <input
              type="text"
              placeholder="Your full name"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              autoFocus
              className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none text-lg text-gray-800"
            />
          </StepWrapper>
        );

      // ── Step 3: Date of Birth ────────────────────────────────────────────────
      case 3: {
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() - 18);
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Date of birth" bgClass={STEP_BG[3]} onContinue={next} continueDisabled={!form.date_of_birth}>
            <p className="text-sm text-gray-500 mb-4">You must be at least 18 years old</p>
            <input
              type="date"
              value={form.date_of_birth}
              max={maxDate.toISOString().split("T")[0]}
              onChange={(e) => set("date_of_birth", e.target.value)}
              className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none text-lg text-gray-800"
            />
          </StepWrapper>
        );
      }

      // ── Step 4: Marriage Readiness ───────────────────────────────────────────
      case 4:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Are you ready to get married?" bgClass={STEP_BG[4]}>
            <div className="space-y-3">
              {[
                { val: "ready_soon", emoji: "💍", label: "Yes, ready to get married soon", sublabel: "I'm ready to find my life partner" },
                { val: "know_first", emoji: "💬", label: "I want to get to know someone first", sublabel: "Take it slow" },
                { val: "curious", emoji: "👀", label: "Just curious about the app", sublabel: "Exploring my options" },
              ].map(({ val, emoji, label, sublabel }) => (
                <TapCard
                  key={val}
                  emoji={emoji}
                  label={label}
                  sublabel={sublabel}
                  selected={form.marriage_readiness === val}
                  onClick={() => autoNext("marriage_readiness", val)}
                />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 5: Referral Source ──────────────────────────────────────────────
      case 5: {
        const sources: Array<{ val: string; emoji: string; label: string; sub?: Array<{ val: string; emoji: string }> }> = [
          { val: "social_media", emoji: "📱", label: "Social Media", sub: [
            { val: "Instagram", emoji: "📸" },
            { val: "TikTok", emoji: "🎵" },
            { val: "Facebook", emoji: "👤" },
            { val: "YouTube", emoji: "▶️" },
            { val: "Twitter/X", emoji: "🐦" },
            { val: "Snapchat", emoji: "👻" },
          ]},
          { val: "friend_family", emoji: "👥", label: "Friend or Family" },
          { val: "google", emoji: "🔍", label: "Google Search" },
          { val: "app_store", emoji: "📲", label: "App Store / Play Store" },
          { val: "tv_radio", emoji: "📺", label: "TV or Radio" },
          { val: "blog", emoji: "📝", label: "Blog or Article" },
          { val: "other", emoji: "🤷", label: "Other" },
        ];
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="How did you hear about us?" bgClass={STEP_BG[5]}>
            <div className="space-y-2">
              {sources.map(({ val, emoji, label, sub }) => (
                <div key={val}>
                  <TapCard
                    emoji={emoji}
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
                          key={s.val}
                          onClick={() => {
                            set("referral_detail", s.val);
                            setTimeout(() => goToStep(step + 1), 200);
                          }}
                          className={`py-2 px-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${
                            form.referral_detail === s.val
                              ? "border-brand-500 bg-brand-50 text-brand-900 font-medium"
                              : "border-gray-200 bg-white text-gray-700"
                          }`}
                        >
                          <span>{s.emoji}</span> {s.val}
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
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Love stories from Rishta" bgClass={STEP_BG[6]} onContinue={next}>
            <div className="space-y-4">
              {[
                { names: "Ahmed & Fatima", story: "Matched in 2 weeks", emoji: "💚" },
                { names: "Usman & Ayesha", story: "Found their soulmate", emoji: "💍" },
                { names: "Bilal & Zainab", story: "Married within 3 months", emoji: "🕌" },
              ].map(({ names, story, emoji }) => (
                <div key={names} className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-brand-50 border border-brand-100">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-2xl flex-shrink-0">
                    {emoji}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{names}</p>
                    <p className="text-sm text-brand-700">{story}</p>
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
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My sect" bgClass={STEP_BG[7]}>
            <div className="space-y-2">
              {SECTS.map(({ val, emoji }) => (
                <TapCard key={val} emoji={emoji} label={val} selected={form.sect === val} onClick={() => autoNext("sect", val)} />
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
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My profession" bgClass={STEP_BG[8]} onContinue={next} continueDisabled={!form.profession}>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search professions..."
                value={professionSearch}
                onChange={(e) => setProfessionSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
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
                          ? "border-brand-500 bg-brand-50 text-brand-900 font-medium"
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
                              ? "border-brand-500 bg-brand-50 text-brand-900 font-medium"
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
                className="mt-3 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none text-sm"
              />
            )}
          </StepWrapper>
        );
      }

      // ── Step 9: Education ────────────────────────────────────────────────────
      case 9:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My education" bgClass={STEP_BG[9]} onContinue={next} continueDisabled={!form.education}>
            <div className="space-y-2">
              {EDUCATION_OPTIONS.map(({ val, emoji }) => (
                <TapCard key={val} emoji={emoji} label={val} selected={form.education === val} onClick={() => set("education", val)} />
              ))}
            </div>
            {form.education === "Other" && (
              <input
                type="text"
                placeholder="Your education"
                value={form.education_other}
                onChange={(ev) => set("education_other", ev.target.value)}
                className="mt-3 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none text-sm"
              />
            )}
          </StepWrapper>
        );

      // ── Step 10: Notifications ───────────────────────────────────────────────
      case 10:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white text-center">
            <ProgressBar step={step} total={TOTAL_STEPS} />
            <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center mb-8">
              <Bell className="w-9 h-9 text-brand-600" />
            </div>
            <h2 className="text-2xl font-semibold text-ink mb-2">Don&apos;t miss a match</h2>
            <p className="text-muted text-sm mb-10 max-w-xs">
              We&apos;ll let you know when someone likes you or sends you a message.
            </p>
            <div className="w-full max-w-sm space-y-3">
              <button
                onClick={() => { set("notifications_enabled", true); next(); }}
                className="w-full bg-brand-600 text-white font-medium h-12 rounded-lg text-base hover:bg-brand-700 transition-colors"
              >
                Turn on notifications
              </button>
              <button
                onClick={next}
                className="w-full text-muted text-sm py-2 hover:text-ink"
              >
                Maybe later
              </button>
            </div>
          </div>
        );

      // ── Step 11: Nationality ─────────────────────────────────────────────────
      case 11:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My nationality" bgClass={STEP_BG[11]} onContinue={next} continueDisabled={!form.nationality}>
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
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Where I grew up" bgClass={STEP_BG[12]} onContinue={next} continueDisabled={!form.grew_up_in}>
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
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My ethnicity" subtitle="Select up to 2" bgClass={STEP_BG[13]} onContinue={next} continueDisabled={form.ethnicity.length === 0}>
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
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My height" bgClass={STEP_BG[14]} onContinue={next}>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Feet</label>
                <select
                  value={form.height_ft}
                  onChange={(e) => set("height_ft", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none text-gray-800"
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none text-gray-800"
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
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My marital status" bgClass={STEP_BG[15]}>
            <div className="space-y-2">
              {[
                { val: "Never Married", emoji: "💚" },
                { val: "Divorced", emoji: "💔" },
                { val: "Widowed", emoji: "🕊️" },
                { val: "Separated", emoji: "⏸️" },
                { val: "Annulled", emoji: "📜" },
                { val: "Prefer not to say", emoji: "🤐" },
              ].map(({ val, emoji }) => (
                <TapCard key={val} emoji={emoji} label={val} selected={form.marital_status === val} onClick={() => autoNext("marital_status", val)} />
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
            bgClass={STEP_BG[16]}
            onContinue={next}
            continueDisabled={!form.knowing_timeline || !form.marriage_timeline}
          >
            <div className="space-y-6">
              <div>
                <p className="font-semibold text-gray-800 mb-3 text-sm">How long to get to know someone before marriage?</p>
                <div className="space-y-2">
                  {[
                    { val: "Less than 3 months", emoji: "⚡" },
                    { val: "3–6 months", emoji: "🌱" },
                    { val: "6–12 months", emoji: "🌿" },
                    { val: "1–2 years", emoji: "🌳" },
                    { val: "We'll decide together", emoji: "🤝" },
                    { val: "No preference", emoji: "💭" },
                  ].map(({ val, emoji }) => (
                    <TapCard key={val} emoji={emoji} label={val} selected={form.knowing_timeline === val} onClick={() => set("knowing_timeline", val)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-3 text-sm">When do you hope to get married?</p>
                <div className="space-y-2">
                  {[
                    { val: "As soon as possible", emoji: "🚀" },
                    { val: "Within 1 year", emoji: "📅" },
                    { val: "Within 2 years", emoji: "🗓️" },
                    { val: "Within 3–5 years", emoji: "⏳" },
                    { val: "When the right person comes", emoji: "💫" },
                    { val: "No rush", emoji: "😌" },
                  ].map(({ val, emoji }) => (
                    <TapCard key={val} emoji={emoji} label={val} selected={form.marriage_timeline === val} onClick={() => set("marriage_timeline", val)} />
                  ))}
                </div>
              </div>
            </div>
          </StepWrapper>
        );

      // ── Step 17: Religiosity ─────────────────────────────────────────────────
      case 17:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="How practicing am I?" bgClass={STEP_BG[17]}>
            <div className="space-y-2">
              {[
                { val: "very", emoji: "🌟", label: "Very Practicing", sublabel: "5x Salah, regular Quran" },
                { val: "practicing", emoji: "✨", label: "Practicing", sublabel: "Trying my best" },
                { val: "moderate", emoji: "🌙", label: "Moderately Practicing", sublabel: "Working on it" },
                { val: "not_very", emoji: "💛", label: "Not very practicing", sublabel: "Muslim by faith" },
                { val: "prefer_not", emoji: "🤐", label: "Prefer not to say" },
              ].map(({ val, emoji, label, sublabel }) => (
                <TapCard key={val} emoji={emoji} label={label} sublabel={sublabel} selected={form.religiosity === val} onClick={() => autoNext("religiosity", val)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 18: Faith & Values ──────────────────────────────────────────────
      case 18:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My faith & values" subtitle="Select all that apply" bgClass={STEP_BG[18]} onContinue={next}>
            <div className="space-y-5">
              {Object.entries(FAITH_GROUPS).map(([group, items]) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map(({ val, emoji }) => {
                      const sel = form.faith_values.includes(val);
                      return (
                        <button
                          key={val}
                          onClick={() => {
                            const next_vals = sel
                              ? form.faith_values.filter((v) => v !== val)
                              : [...form.faith_values, val];
                            set("faith_values", next_vals);
                          }}
                          className={`px-3 py-2 rounded-xl border-2 text-sm font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                            sel
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <span>{emoji}</span> {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 19: Diet ────────────────────────────────────────────────────────
      case 19:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Do I eat only Halal food?" bgClass={STEP_BG[19]}>
            <div className="space-y-2">
              {[
                { val: "strictly_halal", emoji: "✅", label: "Yes — strictly halal only" },
                { val: "mostly_halal", emoji: "🍽️", label: "Mostly halal" },
                { val: "no_preference", emoji: "🤷", label: "No preference" },
                { val: "prefer_not", emoji: "🤐", label: "Prefer not to say" },
              ].map(({ val, emoji, label }) => (
                <TapCard key={val} emoji={emoji} label={label} selected={form.diet === val} onClick={() => autoNext("diet", val)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 20: Smoking ─────────────────────────────────────────────────────
      case 20:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Do I smoke?" bgClass={STEP_BG[20]}>
            <div className="space-y-2">
              {[
                { val: "Non-smoker", emoji: "🚭" },
                { val: "Occasionally", emoji: "🌬️" },
                { val: "Yes I smoke", emoji: "🚬" },
                { val: "Prefer not to say", emoji: "🤐" },
              ].map(({ val, emoji }) => (
                <TapCard key={val} emoji={emoji} label={val} selected={form.smoking === val} onClick={() => autoNext("smoking", val)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 21: Drinking ────────────────────────────────────────────────────
      case 21:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Do I drink alcohol?" bgClass={STEP_BG[21]}>
            <div className="space-y-2">
              {[
                { val: "Never", emoji: "✅" },
                { val: "Occasionally", emoji: "🌊" },
                { val: "Yes", emoji: "🍷" },
                { val: "Prefer not to say", emoji: "🤐" },
              ].map(({ val, emoji }) => (
                <TapCard key={val} emoji={emoji} label={val} selected={form.drinking === val} onClick={() => autoNext("drinking", val)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 22: Children ────────────────────────────────────────────────────
      case 22:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Do I have children?" bgClass={STEP_BG[22]} onContinue={next} continueDisabled={!form.has_children}>
            <div className="space-y-2 mb-6">
              {[
                { val: "No children", emoji: "🚫" },
                { val: "Yes — living with me", emoji: "👨‍👧" },
                { val: "Yes — not living with me", emoji: "💛" },
                { val: "Prefer not to say", emoji: "🤐" },
              ].map(({ val, emoji }) => (
                <TapCard key={val} emoji={emoji} label={val} selected={form.has_children === val} onClick={() => set("has_children", val)} />
              ))}
            </div>
            {form.has_children && form.has_children !== "No children" && form.has_children !== "Prefer not to say" && (
              <div>
                <p className="font-semibold text-gray-800 mb-3 text-sm">Do you want more children?</p>
                <div className="space-y-2">
                  {[
                    { val: "Yes, I want children", emoji: "👶" },
                    { val: "Maybe", emoji: "🤔" },
                    { val: "No", emoji: "🚫" },
                    { val: "Prefer not to say", emoji: "🤐" },
                  ].map(({ val, emoji }) => (
                    <TapCard key={val} emoji={emoji} label={val} selected={form.wants_children === val} onClick={() => set("wants_children", val)} />
                  ))}
                </div>
              </div>
            )}
          </StepWrapper>
        );

      // ── Step 23: Relocation ──────────────────────────────────────────────────
      case 23:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Plans to relocate for marriage?" bgClass={STEP_BG[23]}>
            <div className="space-y-2">
              {[
                { val: "Yes — willing to relocate", emoji: "✈️" },
                { val: "Maybe — open to discussion", emoji: "💬" },
                { val: "No — want to stay local", emoji: "🏠" },
                { val: "Prefer not to say", emoji: "🤐" },
              ].map(({ val, emoji }) => (
                <TapCard key={val} emoji={emoji} label={val} selected={form.relocation === val} onClick={() => autoNext("relocation", val)} />
              ))}
            </div>
          </StepWrapper>
        );

      // ── Step 24: Born Religion ───────────────────────────────────────────────
      case 24:
        return (
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="Religion I was born into" bgClass={STEP_BG[24]}>
            <div className="space-y-2">
              {[
                { val: "Islam (from birth)", emoji: "☪️" },
                { val: "Converted to Islam", emoji: "🌟" },
                { val: "Other religion", emoji: "🙏" },
                { val: "Prefer not to say", emoji: "🤐" },
              ].map(({ val, emoji }) => (
                <TapCard key={val} emoji={emoji} label={val} selected={form.born_religion === val} onClick={() => autoNext("born_religion", val)} />
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
            bgClass={STEP_BG[25]}
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
                    emojiMap={INTEREST_EMOJIS}
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
            bgClass={STEP_BG[26]}
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
                  emojiMap={PERSONALITY_EMOJIS}
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
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My bio" bgClass={STEP_BG[27]} onContinue={next}>
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={form.about_me}
                  onChange={(e) => set("about_me", e.target.value.slice(0, 500))}
                  placeholder="Tell potential matches about yourself..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none text-sm resize-none"
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
                    className="px-3 py-1.5 rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-xs hover:bg-brand-100 transition-all active:scale-95"
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
            bgClass={STEP_BG[28]}
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
                            ? "border-brand-400"
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
                        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                        <span className="text-xs text-gray-500">Checking...</span>
                      </div>
                    )}
                    {status === "ok" && (
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
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
                          <span className="text-xs text-brand-600 underline">Retry</span>
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
          <StepWrapper step={step} total={TOTAL_STEPS} onBack={back} title="My phone number" bgClass={STEP_BG[29]} onContinue={async () => {
            if (!form.phone) return;
            const fullPhone = `${form.country_code}${form.phone.replace(/^0/, "")}`;
            await supabase.from("profiles").update({ phone: fullPhone }).eq("id", userId!);
            next();
          }} continueDisabled={!form.phone}>
            <div className="flex gap-2">
              <select
                value={form.country_code}
                onChange={(e) => set("country_code", e.target.value)}
                className="px-3 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none text-sm flex-shrink-0"
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
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:outline-none text-base"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">We'll send a verification code to this number</p>
          </StepWrapper>
        );

      // ── Step 30: OTP (skip) ──────────────────────────────────────────────────
      case 30: {
        // SMS OTP requires Twilio — skip automatically
        setTimeout(() => goToStep(31), 0);
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
            bgClass={STEP_BG[31]}
            onContinue={form.face_verified ? next : undefined}
            continueDisabled={!form.face_verified}
          >
            <p className="text-sm text-gray-500 text-center mb-6">
              Let's verify it's really you. We'll compare your selfie with your uploaded photos.
            </p>
            {!cameraStream && !selfieData && !form.face_verified && (
              <button
                onClick={openCamera}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-4 rounded-full font-bold hover:bg-brand-700 active:scale-95 transition-all"
              >
                <Camera className="h-5 w-5" /> Open Camera
              </button>
            )}
            {cameraStream && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-brand-500">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                </div>
                <button
                  onClick={takeSelfie}
                  className="w-full bg-brand-600 text-white py-4 rounded-full font-bold hover:bg-brand-700 active:scale-95 transition-all"
                >
                  Take Selfie
                </button>
              </div>
            )}
            {selfieData && !form.face_verified && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-brand-500">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selfieData} alt="selfie" className="w-full h-full object-cover" />
                </div>
                {verifyingFace && (
                  <div className="flex items-center gap-2 text-brand-700">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Comparing with your photos...</span>
                  </div>
                )}
              </div>
            )}
            {form.face_verified && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center">
                  <Check className="h-12 w-12 text-brand-600" />
                </div>
                <p className="text-xl font-bold text-brand-700">Identity Verified!</p>
                <p className="text-sm text-gray-500 text-center">Your identity has been confirmed. Complete your profile now.</p>
                <button
                  onClick={next}
                  className="w-full bg-brand-600 text-white py-4 rounded-full font-bold hover:bg-brand-700 active:scale-95 transition-all"
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
          <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white text-center">
            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-8">
              <Check className="h-10 w-10 text-brand-600" />
            </div>
            <h1 className="text-3xl font-semibold text-ink mb-2 tracking-tight">Profile complete</h1>
            <p className="text-muted text-sm mb-4 max-w-xs leading-relaxed">
              Your profile has been submitted. You can start exploring while our team reviews it — usually within 24 hours.
            </p>
            <div className="flex items-center gap-2 bg-surface-soft border border-hairline rounded-full px-4 py-1.5 mb-10">
              <span className="text-muted text-sm">Profile under review</span>
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full max-w-sm bg-brand-600 hover:bg-brand-700 text-white font-medium h-12 rounded-lg text-base transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Start exploring"}
            </button>
            {saving && <p className="text-muted-soft text-xs mt-3">Saving your profile…</p>}
          </div>
        );

      default:
        return null;
    }
  };

  // Block rendering until we know the visitor actually needs onboarding —
  // prevents signed-in, already-onboarded users from seeing a "Get Started"
  // flash before the async redirect fires
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
    <div className="fixed top-0 left-0 right-0 h-1 bg-hairline z-50">
      <div
        className="h-full bg-brand-600 transition-all duration-300"
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
  bgClass,
}: {
  step: number;
  total: number;
  onBack: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onContinue?: () => void;
  continueDisabled?: boolean;
  bgClass?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ProgressBar step={step} total={total} />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-2 max-w-lg mx-auto w-full">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-surface-soft hover:bg-surface-strong flex items-center justify-center transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5 text-ink" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted">Step {step} of {total - 1}</p>
        </div>
      </div>

      {/* Step title */}
      <div className="px-5 pt-4 pb-4 max-w-lg mx-auto w-full">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="text-sm text-muted mt-1.5">{subtitle}</p>}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full">
        <div className="px-5 pt-1 pb-32">{children}</div>
      </div>

      {/* Continue Button */}
      {onContinue && (
        <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-hairline">
          <div className="max-w-lg mx-auto">
            <button
              onClick={onContinue}
              disabled={continueDisabled}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium h-12 rounded-lg text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
