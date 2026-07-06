"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/Logo";

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <LogoMark className="w-16 h-16 rounded-2xl mx-auto" rounded="rounded-2xl" />
          <h1 className="text-3xl font-semibold text-ink tracking-tight mt-5">Welcome to Rishta</h1>
          <p className="text-muted text-sm mt-2">Find your match the halal way</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <button
            onClick={handleGoogle}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 bg-white border border-ink text-ink font-medium h-12 rounded-lg hover:bg-surface-soft transition-colors disabled:opacity-60"
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
            onClick={() => router.push("/login/email")}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 bg-white border border-hairline text-ink font-medium h-12 rounded-lg hover:bg-surface-soft transition-colors disabled:opacity-60"
          >
            <Mail className="h-5 w-5 text-muted" />
            Continue with Email
          </button>

          <button
            onClick={() => router.push("/login/phone")}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 bg-white border border-hairline text-ink font-medium h-12 rounded-lg hover:bg-surface-soft transition-colors disabled:opacity-60"
          >
            <Phone className="h-5 w-5 text-muted" />
            Continue with Phone
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <p className="text-muted text-xs text-center mt-8 leading-relaxed">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-ink underline underline-offset-2">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-ink underline underline-offset-2">Privacy Policy</Link>
        </p>

        <p className="text-muted text-sm text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-600 font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
