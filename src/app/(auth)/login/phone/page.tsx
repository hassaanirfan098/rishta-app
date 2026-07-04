"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const COUNTRY_CODES = [
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+1", flag: "🇺🇸", name: "USA/Canada" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
];

export default function PhoneLoginPage() {
  const [countryCode, setCountryCode] = useState("+92");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fullPhone = `${countryCode}${phone.replace(/^0/, "")}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) {
      setError(error.message || "Failed to send OTP. Please try again.");
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fullPhone = `${countryCode}${phone.replace(/^0/, "")}`;
    const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otp, type: "sms" });
    if (error) {
      setError(error.message || "Invalid code. Please try again.");
      setLoading(false);
      return;
    }
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-900 to-brand-700 flex flex-col">
      <div className="flex items-center px-5 pt-12 pb-4">
        <button
          onClick={() => step === "otp" ? setStep("phone") : router.push("/login")}
          className="text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl mb-4">
            <span className="text-white text-3xl font-bold">ر</span>
          </div>
          <h1 className="text-white text-2xl font-bold">
            {step === "phone" ? "Enter your number" : "Enter the code"}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {step === "phone"
              ? "We'll send you a verification code"
              : `Sent to ${countryCode} ${phone}`}
          </p>
        </div>

        <div className="w-full max-w-sm mx-auto">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-white/15 border border-white/20 text-white rounded-2xl px-3 py-3.5 text-sm focus:outline-none focus:border-white/50 w-32"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-brand-900">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                  required
                  className="flex-1 bg-white/15 border border-white/20 text-white placeholder-white/40 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
                />
              </div>
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || phone.length < 7}
                className="w-full bg-white text-brand-800 font-bold py-4 rounded-2xl shadow-lg hover:bg-brand-50 active:scale-95 transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Send Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                className="w-full bg-white/15 border border-white/20 text-white placeholder-white/40 rounded-2xl px-4 py-4 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-white/50 transition-all"
              />
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-white text-brand-800 font-bold py-4 rounded-2xl shadow-lg hover:bg-brand-50 active:scale-95 transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Verify"}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-white/50 text-sm hover:text-white/70 transition-colors"
              >
                Wrong number? Go back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
