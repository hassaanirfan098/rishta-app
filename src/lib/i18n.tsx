"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "ur";

const translations: Record<string, Record<Lang, string>> = {
  discover: { en: "Discover", ur: "تلاش کریں" },
  find_your_match: { en: "Find your match", ur: "اپنا جوڑا تلاش کریں" },
  settings: { en: "Settings", ur: "ترتیبات" },
  save_changes: { en: "Save Changes", ur: "تبدیلیاں محفوظ کریں" },
  sign_out: { en: "Sign Out", ur: "سائن آؤٹ" },
  delete_account: { en: "Delete Account", ur: "اکاؤنٹ حذف کریں" },
  full_name: { en: "Full Name", ur: "پورا نام" },
  phone: { en: "Phone (WhatsApp)", ur: "فون (واٹس ایپ)" },
  city: { en: "City", ur: "شہر" },
  country: { en: "Country", ur: "ملک" },
  about_me: { en: "About Me", ur: "میرے بارے میں" },
  profession: { en: "Profession", ur: "پیشہ" },
  education: { en: "Education", ur: "تعلیم" },
  matches: { en: "Matches", ur: "میچز" },
  liked_you: { en: "Liked You", ur: "پسند کیا" },
  like: { en: "Like", ur: "پسند" },
  pass: { en: "Pass", ur: "گزریں" },
  message: { en: "Message", ur: "پیغام" },
  photos: { en: "Photos", ur: "تصاویر" },
  basic_info: { en: "Basic Info", ur: "بنیادی معلومات" },
  faith: { en: "Faith", ur: "دین" },
  career: { en: "Career & Education", ur: "کیریئر اور تعلیم" },
  change_password: { en: "Change Password", ur: "پاس ورڈ تبدیل کریں" },
};

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (key: string) => translations[key]?.[lang] ?? key;
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
