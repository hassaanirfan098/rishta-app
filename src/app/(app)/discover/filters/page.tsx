"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

const NO_PREF = "No preference";
const SECTS = [NO_PREF, "Sunni", "Shia", "Deobandi", "Barelvi", "Ahl-e-Hadith"];
const MARITAL = [NO_PREF, "Never married", "Divorced", "Widowed"];
const RELOCATION = [NO_PREF, "Willing to relocate", "Not willing to relocate", "Open to discuss"];
const FAMILY_PLANS = [NO_PREF, "Wants children", "Open to children", "Doesn't want children"];
const PRACTICE = [NO_PREF, "Very practising", "Practising", "Not very practising"];
const DRESS = [NO_PREF, "Hijab", "Niqab", "No hijab"];
const DIET = [NO_PREF, "Halal only", "Vegetarian", "No restriction"];
const FREQUENCY = [NO_PREF, "Never", "Occasionally", "Regularly"];

interface FilterState {
  ageMin: string;
  ageMax: string;
  heightMin: string;
  heightMax: string;
  city: string;
  ethnicity: string;
  sect: string;
  maritalStatus: string;
  relocationPlans: string;
  familyPlans: string;
  religiousPractice: string;
  islamicDress: string;
  diet: string;
  alcohol: string;
  smoking: string;
}

const DEFAULTS: FilterState = {
  ageMin: "18",
  ageMax: "45",
  heightMin: "",
  heightMax: "",
  city: "",
  ethnicity: "",
  sect: NO_PREF,
  maritalStatus: NO_PREF,
  relocationPlans: NO_PREF,
  familyPlans: NO_PREF,
  religiousPractice: NO_PREF,
  islamicDress: NO_PREF,
  diet: NO_PREF,
  alcohol: NO_PREF,
  smoking: NO_PREF,
};

const STORAGE_KEY = "rishta_filters";

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {title && <h2 className="text-amber-700 font-bold text-sm mb-2 px-1 uppercase tracking-wide">{title}</h2>}
      <div className="bg-white rounded-2xl px-4 border border-gray-100 divide-y divide-gray-100">{children}</div>
    </div>
  );
}

function Row({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between py-4 min-h-[44px] text-left">
      <div className="min-w-0 pr-3">
        <p className="font-bold text-gray-900">{label}</p>
        <p className={cn("text-sm mt-0.5 truncate", value === NO_PREF ? "text-gray-400" : "text-emerald-600 font-medium")}>{value}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-300 shrink-0" />
    </button>
  );
}

function OptionSheet({
  title,
  options,
  value,
  onSelect,
  onClose,
}: {
  title: string;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-lg max-h-[70vh] overflow-y-auto p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-0.5">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); onClose(); }}
              className="w-full flex items-center justify-between py-3.5 min-h-[44px] text-left"
            >
              <span className={cn("text-sm", opt === value ? "font-bold text-emerald-700" : "text-gray-700")}>{opt}</span>
              {opt === value && <Check className="h-4 w-4 text-emerald-600" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FiltersPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULTS);
  const [sheet, setSheet] = useState<keyof FilterState | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setFilters({ ...DEFAULTS, ...JSON.parse(saved) }); } catch { /* ignore malformed cache */ }
    }
  }, []);

  const set = (key: keyof FilterState, value: string) => setFilters((f) => ({ ...f, [key]: value }));

  const clearAll = () => setFilters(DEFAULTS);

  const applyFilters = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    toast("Filters saved 🎉", "success");
    router.back();
  };

  const activeCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "ageMin") return v !== DEFAULTS.ageMin;
    if (k === "ageMax") return v !== DEFAULTS.ageMax;
    return v !== NO_PREF && v !== "";
  }).length;

  const sheetConfig: Record<string, { title: string; options: string[] }> = {
    sect: { title: "Sect", options: SECTS },
    maritalStatus: { title: "Marital status", options: MARITAL },
    relocationPlans: { title: "Relocation plans", options: RELOCATION },
    familyPlans: { title: "Family plans", options: FAMILY_PLANS },
    religiousPractice: { title: "Religious practice", options: PRACTICE },
    islamicDress: { title: "Islamic dress", options: DRESS },
    diet: { title: "Diet", options: DIET },
    alcohol: { title: "Alcohol", options: FREQUENCY },
    smoking: { title: "Smoking", options: FREQUENCY },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between px-2 py-3">
        <button onClick={() => router.back()} aria-label="Close" className="w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50">
          <X className="h-5 w-5" />
        </button>
        <h1 className="font-bold text-gray-900">Filters</h1>
        <button onClick={clearAll} className="min-h-[44px] px-2 text-sm font-semibold text-gray-500 hover:text-gray-700">
          Clear all
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5">
        <Section title="Basics">
          <div className="py-4">
            <p className="font-bold text-gray-900 mb-2">Age range</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.ageMin}
                onChange={(e) => set("ageMin", e.target.value)}
                min={18}
                max={80}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                value={filters.ageMax}
                onChange={(e) => set("ageMax", e.target.value)}
                min={18}
                max={80}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="py-4">
            <p className="font-bold text-gray-900 mb-2">Height range (cm)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.heightMin}
                onChange={(e) => set("heightMin", e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.heightMax}
                onChange={(e) => set("heightMax", e.target.value)}
                className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="py-4">
            <p className="font-bold text-gray-900 mb-2">City</p>
            <input
              type="text"
              placeholder="Any city"
              value={filters.city}
              onChange={(e) => set("city", e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </Section>

        <Section title="Background">
          <Row label="Sect" value={filters.sect} onClick={() => setSheet("sect")} />
          <Row label="Marital status" value={filters.maritalStatus} onClick={() => setSheet("maritalStatus")} />
          <div className="py-4">
            <p className="font-bold text-gray-900 mb-2">Ethnicity</p>
            <input
              type="text"
              placeholder="e.g. Punjabi"
              value={filters.ethnicity}
              onChange={(e) => set("ethnicity", e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </Section>

        <Section title="Future plans">
          <Row label="Relocation plans" value={filters.relocationPlans} onClick={() => setSheet("relocationPlans")} />
          <Row label="Family plans" value={filters.familyPlans} onClick={() => setSheet("familyPlans")} />
        </Section>

        <Section title="Religiosity">
          <Row label="Religious practice" value={filters.religiousPractice} onClick={() => setSheet("religiousPractice")} />
          <Row label="Islamic dress" value={filters.islamicDress} onClick={() => setSheet("islamicDress")} />
          <Row label="Diet" value={filters.diet} onClick={() => setSheet("diet")} />
          <Row label="Alcohol" value={filters.alcohol} onClick={() => setSheet("alcohol")} />
          <Row label="Smoking" value={filters.smoking} onClick={() => setSheet("smoking")} />
        </Section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-20">
        <div className="max-w-lg mx-auto">
          <button
            onClick={applyFilters}
            className="w-full min-h-[52px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-colors"
          >
            Apply Filters{activeCount > 0 && ` (${activeCount})`}
          </button>
        </div>
      </div>

      {sheet && sheetConfig[sheet] && (
        <OptionSheet
          title={sheetConfig[sheet].title}
          options={sheetConfig[sheet].options}
          value={filters[sheet]}
          onSelect={(v) => set(sheet, v)}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
