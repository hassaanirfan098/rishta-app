"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback` },
    });
    if (error) {
      console.error('Signup error:', error);
      const msg = error.message || (error as any).code || (error as any).error_description || String(error);
      setError(msg && msg !== '{}' ? msg : 'Sign up failed — please try again or contact support.');
      setLoading(false);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl shadow-lg mb-6">
            <span className="text-white text-4xl">ر</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation link to <span className="font-medium text-gray-700">{email}</span>. Click it to activate your account, then come back to sign in.
          </p>
          <Link href="/login">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl shadow-lg mb-4">
            <span className="text-white text-4xl">ر</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            <span className="text-emerald-600">Rishta</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">رشتہ — Muslim Matrimonial</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Create account</h2>
            <p className="text-sm text-gray-500 mb-6">Start your journey to finding a match</p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
                Create Account
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 font-medium">
              Sign in
            </Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-3">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
