"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function VerifyForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";
  const supabase = createClient();

  const handleChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value.slice(-1);
    setOtp(newOtp);
    if (value && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
    if (newOtp.every((d) => d !== "")) {
      submitOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const submitOtp = async (code: string) => {
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });

    if (error) {
      setError(error.message);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  };

  const handleResend = async () => {
    setResendTimer(60);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) setError(error.message);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col px-6 py-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-10 self-start"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-2xl mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify your number</h1>
          <p className="text-gray-500 mt-2 text-sm">
            We sent a 6-digit code to
          </p>
          <p className="text-gray-800 font-medium">{phone}</p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-3 mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-colors"
              style={{ borderColor: digit ? "#9d2159" : "#e5e7eb" }}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 w-full">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-brand-600 mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Verifying...</span>
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={resendTimer > 0}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 disabled:opacity-50 mt-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-50 flex items-center justify-center"><span className="text-brand-600">Loading...</span></div>}>
      <VerifyForm />
    </Suspense>
  );
}
