"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Check, ArrowLeft, Loader2, Zap, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import { LogoGlyph } from "@/components/Logo";

type PlanId = "gold_weekly" | "gold_monthly" | "gold_quarterly";

const PLANS: { id: PlanId; label: string; price: number; perWeek: number; badge?: string }[] = [
  { id: "gold_weekly", label: "1 week", price: 700, perWeek: 700 },
  { id: "gold_monthly", label: "1 month", price: 2000, perWeek: 460 },
  { id: "gold_quarterly", label: "3 months", price: 5000, perWeek: 385, badge: "Save 45%" },
];

const PERKS = [
  "See who liked you",
  "Unlimited matches & chat",
  "Profile boost — appear higher",
  "Read receipts in chat",
  "Advanced filters",
  "Gold badge on profile",
];

export default function GoldPage() {
  const [view, setView] = useState<"offer" | "plans">("offer");
  const [selected, setSelected] = useState<PlanId>("gold_monthly");
  const [showPerks, setShowPerks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);
  const [boostedUntil, setBoostedUntil] = useState<string | null>(null);
  const [isGold, setIsGold] = useState(false);
  const [goldUntil, setGoldUntil] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCheckingStatus(false); return; }
      const { data } = await supabase.from("profiles").select("is_gold, gold_until, boosted_until").eq("id", user.id).single();
      const activeGold = !!(data?.is_gold && data?.gold_until && new Date(data.gold_until) > new Date());
      setIsGold(activeGold);
      setGoldUntil(activeGold ? data!.gold_until : null);
      setBoostedUntil(data?.boosted_until && new Date(data.boosted_until) > new Date() ? data.boosted_until : null);
      setCheckingStatus(false);
    };
    load();
  }, []);

  const handleBoost = async () => {
    setBoostLoading(true);
    const res = await fetch("/api/boost", { method: "POST" });
    const data = await res.json();
    setBoostLoading(false);
    if (data.boosted_until) {
      setBoostedUntil(data.boosted_until);
      toast("⚡ Your profile is boosted for 24 hours!", "success");
    } else {
      toast(data.error || "Could not boost right now.", "error");
    }
  };

  const startPayment = async (type: PlanId) => {
    setLoading(true);
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast("Payment setup failed. Please try again.", "error");
    }
  };

  const activePlan = PLANS.find((p) => p.id === selected)!;

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
      </div>
    );
  }

  // ── Already Gold: membership + boost dashboard ──────────────
  if (isGold) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button onClick={() => router.back()} aria-label="Back" className="w-11 h-11 -ml-2.5 flex items-center justify-center text-gray-500 hover:text-gray-700 mb-4 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
              <Crown className="h-10 w-10 text-white" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">You&apos;re a Gold member</h1>
            {goldUntil && (
              <p className="text-gray-500 mt-2 text-sm">
                Renews {new Date(goldUntil).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 p-5 mb-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 mb-3">Everything included:</p>
            <div className="space-y-2.5">
              {PERKS.map((perk) => (
                <div key={perk} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-amber-600" />
                  </div>
                  <span className="text-sm text-gray-700">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Profile Boost</p>
                <p className="text-xs text-gray-500">Appear at the top of Discover for 24 hours</p>
              </div>
            </div>
            {boostedUntil ? (
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-sm text-amber-700 font-medium">⚡ Boost active</p>
                <p className="text-xs text-amber-600 mt-0.5">Expires {new Date(boostedUntil).toLocaleString("en-PK", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</p>
              </div>
            ) : (
              <button
                onClick={handleBoost}
                disabled={boostLoading}
                className="w-full min-h-[44px] py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {boostLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Boost Now — Free with Gold
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Paywall: offer screen (Muzz-style hero) ──────────────────
  if (view === "offer") {
    return (
      <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-800 to-amber-700">
        {/* decorative glow */}
        <div className="absolute -top-24 -left-16 w-72 h-72 bg-amber-400/25 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" aria-hidden="true" />
        <LogoGlyph className="absolute inset-0 m-auto w-[75%] h-[75%] text-white/[0.04]" />

        <div className="relative z-10 flex items-center px-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm hover:bg-black/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 mb-5 animate-scale-in">
            <Crown className="h-8 w-8 text-emerald-950" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-extrabold text-white leading-tight mb-3">
            See who likes you
            <br />
            with Rishta Gold
          </h1>
          <p className="text-white/70 text-sm mb-5 max-w-xs">
            Unlock every like, message without limits, and get seen first by serious rishtas.
          </p>
          <button
            onClick={() => setShowPerks((s) => !s)}
            className="min-h-[44px] px-2 text-amber-300 text-sm font-semibold flex items-center gap-1"
            aria-expanded={showPerks}
          >
            What else do I get?
            <ChevronDown className={`h-4 w-4 transition-transform ${showPerks ? "rotate-180" : ""}`} />
          </button>

          {showPerks && (
            <div className="mt-4 w-full max-w-xs bg-white/10 backdrop-blur-md rounded-2xl p-4 text-left space-y-2.5 animate-slide-up border border-white/10">
              {PERKS.map((perk) => (
                <div key={perk} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-emerald-950" />
                  </div>
                  <span className="text-sm text-white/90">{perk}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
          <button
            onClick={() => startPayment("gold_monthly")}
            disabled={loading}
            className="w-full min-h-[52px] bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold py-4 rounded-2xl shadow-lg shadow-black/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Redirecting…" : "Upgrade for 1 month — Rs 2,000"}
          </button>
          <button
            onClick={() => setView("plans")}
            className="w-full min-h-[44px] text-center text-white font-semibold text-sm mt-3"
          >
            View more plans
          </button>
          <p className="text-center text-[11px] text-white/50 mt-1 leading-relaxed">
            By continuing, you agree to our{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link> and{" "}
            <Link href="/terms" className="underline">Terms</Link>.
          </p>
        </div>
      </div>
    );
  }

  // ── Paywall: choose your plan ─────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 flex items-center px-2 py-3">
        <button
          onClick={() => setView("offer")}
          aria-label="Back"
          className="w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center font-bold text-gray-900 pr-11">Choose your plan</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        <div className="space-y-3 mb-6">
          <div className="w-full rounded-2xl p-4 border-2 border-gray-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoGlyph className="w-5 h-5 text-gray-300" />
              <span className="font-bold text-gray-900">Rishta Basic</span>
            </div>
            <span className="text-sm font-semibold text-gray-400">FREE</span>
          </div>

          {PLANS.map((plan) => {
            const active = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                aria-pressed={active}
                className={`w-full rounded-2xl p-4 border-2 text-left transition-all relative ${
                  active ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 left-4 bg-amber-400 text-emerald-950 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className={`h-5 w-5 ${active ? "text-amber-500" : "text-gray-300"}`} fill={active ? "currentColor" : "none"} />
                    <span className="font-bold text-gray-900">{plan.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400">price per week</p>
                    <p className="font-bold text-gray-900">Rs {plan.perWeek.toLocaleString()}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => startPayment(selected)}
          disabled={loading}
          className="w-full min-h-[52px] bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-200 hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crown className="h-5 w-5" />}
          {loading ? "Redirecting…" : `Upgrade for Rs ${activePlan.price.toLocaleString()}`}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Secure payment via Safepay · Cancel anytime
        </p>
      </div>
    </div>
  );
}
