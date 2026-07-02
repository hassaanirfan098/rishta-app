"use client";

import { useEffect, useState } from "react";
import { Bell, Sparkles } from "lucide-react";
import { LogoGlyph } from "@/components/Logo";

const STORAGE_KEY = "jamaa_notify_me";

export default function JamaaPage() {
  const [notifyMe, setNotifyMe] = useState(false);

  useEffect(() => {
    setNotifyMe(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const toggleNotify = () => {
    const next = !notifyMe;
    setNotifyMe(next);
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="flex items-center gap-1.5 font-bold text-xl text-gray-900">
            <LogoGlyph className="w-5 h-5 text-emerald-600" />
            Jamaa
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/10">
          <LogoGlyph className="w-11 h-11 text-white" />
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
            <Sparkles className="h-4 w-4 text-emerald-950" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Jamaa is coming soon</h2>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-8">
          A community space to ask questions, share wedding tips, and connect with other members —
          built for a Pakistani rishta audience. We&apos;re putting it together.
        </p>

        <button
          onClick={toggleNotify}
          aria-pressed={notifyMe}
          className={`min-h-[48px] px-6 rounded-2xl font-bold text-sm flex items-center gap-2 transition-colors ${
            notifyMe ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          <Bell className={`h-4 w-4 ${notifyMe ? "fill-emerald-600" : ""}`} />
          {notifyMe ? "We'll notify you when it's ready" : "Notify me when it launches"}
        </button>
      </div>
    </div>
  );
}
