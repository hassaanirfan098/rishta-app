"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Check, ArrowLeft, Loader2 } from "lucide-react";

const PLANS = [
  { id: "gold_monthly", label: "1 Month", price: "Rs 999", sub: "Rs 999/month", popular: false },
  { id: "gold_yearly", label: "1 Year", price: "Rs 7,999", sub: "Rs 667/month — save 33%", popular: true },
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
  const [selected, setSelected] = useState("gold_yearly");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const startPayment = async () => {
    setLoading(true);
    const res = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: selected }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Payment setup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Rishta Gold</h1>
          <p className="text-gray-500 mt-2">Find your match faster</p>
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

        <div className="space-y-3 mb-6">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`w-full rounded-2xl p-4 border-2 text-left transition-all relative ${
                selected === plan.id ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-4 bg-amber-400 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Best Value
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{plan.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{plan.sub}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{plan.price}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={startPayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-200 hover:from-amber-500 hover:to-amber-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crown className="h-5 w-5" />}
          {loading ? "Redirecting..." : "Get Gold"}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Secure payment via Safepay · Cancel anytime
        </p>
      </div>
    </div>
  );
}
