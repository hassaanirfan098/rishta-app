"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export function SeedDemoButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const seed = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/seed-demo");
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed to seed");
      } else {
        setMsg(`Seeded ${data.seeded}/${data.total} demo profiles. Open Discover to see them.`);
      }
    } catch {
      setMsg("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="mt-8 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm max-w-md">
      <h2 className="font-bold text-gray-900 mb-1">Demo data</h2>
      <p className="text-sm text-gray-500 mb-4">
        Add 5 imaginary approved member profiles so you can try the swipe/Discover flow.
        Safe to run more than once (it won&apos;t create duplicates).
      </p>
      <button
        onClick={seed}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Seed 5 demo profiles
      </button>
      {msg && <p className="text-sm text-gray-700 mt-3">{msg}</p>}
    </div>
  );
}
