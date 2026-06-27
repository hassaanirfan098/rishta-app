"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const GRADIENTS = [
  "from-emerald-900 via-teal-800 to-emerald-700",
  "from-teal-900 via-emerald-800 to-cyan-700",
  "from-emerald-800 via-green-900 to-teal-800",
  "from-cyan-900 via-teal-800 to-emerald-900",
];

const PATTERN_SVGS = [
  // Geometric star
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'><polygon points='60,10 110,35 110,85 60,110 10,85 10,35'/><polygon points='60,25 95,42 95,78 60,95 25,78 25,42'/><line x1='60' y1='10' x2='60' y2='110'/><line x1='10' y1='35' x2='110' y2='85'/><line x1='110' y1='35' x2='10' y2='85'/></g></svg>`,
  // Eight-pointed star
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'><polygon points='60,5 72,48 115,48 80,73 93,115 60,90 27,115 40,73 5,48 48,48'/><circle cx='60' cy='60' r='30'/><circle cx='60' cy='60' r='50'/></g></svg>`,
  // Arabesque
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1'><circle cx='60' cy='60' r='50'/><circle cx='60' cy='60' r='35'/><circle cx='60' cy='60' r='20'/><line x1='10' y1='60' x2='110' y2='60'/><line x1='60' y1='10' x2='60' y2='110'/><line x1='25' y1='25' x2='95' y2='95'/><line x1='95' y1='25' x2='25' y2='95'/></g></svg>`,
  // Lattice
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='rgba(255,255,255,0.07)' stroke-width='1'><rect x='15' y='15' width='90' height='90'/><rect x='30' y='30' width='60' height='60'/><rect x='45' y='45' width='30' height='30'/><line x1='15' y1='15' x2='105' y2='105'/><line x1='105' y1='15' x2='15' y2='105'/><line x1='15' y1='60' x2='105' y2='60'/><line x1='60' y1='15' x2='60' y2='105'/></g></svg>`,
];

export default function LoginPage() {
  const [bgIndex, setBgIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setBgIndex((i) => (i + 1) % GRADIENTS.length);
        setFading(false);
      }, 600);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGoogle = async () => {
    setError("");
    setLoading("google");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  };

  const handleEmail = () => {
    router.push("/login/email");
  };

  const handlePhone = () => {
    router.push("/login/phone");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-end overflow-hidden">
      {/* Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[bgIndex]} transition-opacity duration-700 ${fading ? "opacity-0" : "opacity-100"}`}
      />

      {/* Islamic geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(PATTERN_SVGS[bgIndex])}")`,
          backgroundSize: "120px 120px",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Logo centered top area */}
      <div className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center pt-20 pb-10">
        <div className="flex items-center justify-center w-24 h-24 bg-white/15 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl mb-5">
          <span className="text-white text-5xl font-bold">ر</span>
        </div>
        <h1 className="text-white text-4xl font-bold tracking-tight">Rishta</h1>
        <p className="text-white/70 text-sm mt-1 tracking-widest uppercase">Muslim Matrimonial</p>
      </div>

      {/* Bottom card */}
      <div className="relative w-full max-w-sm mx-auto px-5 pb-10 z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-7 shadow-2xl">
          <h2 className="text-white text-2xl font-bold text-center mb-1">Find your match</h2>
          <p className="text-white/60 text-sm text-center mb-7">Join thousands of Muslims finding their soulmate</p>

          <div className="space-y-3">
            <button
              onClick={handleGoogle}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-4 rounded-2xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading === "google" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </button>

            <button
              onClick={handleEmail}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 bg-white/15 text-white font-semibold py-4 rounded-2xl border border-white/30 hover:bg-white/20 active:scale-95 transition-all disabled:opacity-60"
            >
              <Mail className="h-5 w-5" />
              Continue with Email
            </button>

            <button
              onClick={handlePhone}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 bg-white/15 text-white font-semibold py-4 rounded-2xl border border-white/30 hover:bg-white/20 active:scale-95 transition-all disabled:opacity-60"
            >
              <Phone className="h-5 w-5" />
              Continue with Phone
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}

          <p className="text-white/40 text-xs text-center mt-6">
            By continuing you agree to our{" "}
            <Link href="/terms" className="text-white/60 underline underline-offset-2">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-white/60 underline underline-offset-2">Privacy Policy</Link>
          </p>
        </div>

        <p className="text-white/40 text-xs text-center mt-4">
          Already have an account?{" "}
          <Link href="/signup" className="text-emerald-300 font-medium">Sign up instead</Link>
        </p>
      </div>
    </div>
  );
}
