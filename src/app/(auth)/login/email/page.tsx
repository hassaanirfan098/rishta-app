"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function EmailLoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback` },
      });
      if (error) {
        setError(error.message || "Sign up failed. Please try again.");
        setLoading(false);
        return;
      }
      setDone(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message || "Sign in failed. Check your email and password.");
        setLoading(false);
        return;
      }
      router.push("/onboarding");
      router.refresh();
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-700 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-3xl mb-6">
            <span className="text-white text-4xl">✉️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-white/70 text-sm mb-8">
            We sent a confirmation link to <span className="font-semibold text-white">{email}</span>. Click it to activate your account.
          </p>
          <Link href="/login" className="text-emerald-200 text-sm underline underline-offset-2">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-emerald-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 pt-12 pb-4">
        <Link href="/login" className="text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl mb-4">
            <span className="text-white text-3xl font-bold">ر</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Rishta</h1>
        </div>

        <div className="w-full max-w-sm mx-auto">
          {/* Toggle */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setMode("signin"); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === "signin" ? "bg-white text-emerald-800" : "text-white/70"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === "signup" ? "bg-white text-emerald-800" : "text-white/70"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/15 border border-white/20 text-white placeholder-white/40 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Min. 8 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/15 border border-white/20 text-white placeholder-white/40 rounded-2xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-emerald-800 font-bold py-4 rounded-2xl shadow-lg hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-60 mt-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
