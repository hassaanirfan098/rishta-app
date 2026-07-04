import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/Logo";
import {
  ShieldCheck,
  Heart,
  MessageCircle,
  Sparkles,
  Lock,
  BadgeCheck,
  Search,
  UserCheck,
  Crown,
  ArrowRight,
  Star,
} from "lucide-react";

export const metadata = {
  title: "Rishta — Muslim Matrimonial for Pakistan & Diaspora",
  description:
    "A modern, private, and faith-first way for practising Muslims to find marriage. Verified profiles, halal communication, and serious intentions only.",
};

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Verified Profiles",
    desc: "Every member is manually reviewed and photo-verified before they appear. No bots, no catfish, no time-wasters.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    desc: "Your photos and contact details stay private until you choose to share them. You are always in control.",
  },
  {
    icon: Heart,
    title: "Meaningful Matches",
    desc: "Filter by sect, religiosity, family values, and life goals — so every match starts with what matters.",
  },
  {
    icon: MessageCircle,
    title: "Halal Communication",
    desc: "Chat only after a mutual match. A respectful, pressure-free space designed for marriage, not dating.",
  },
];

const STEPS = [
  {
    icon: UserCheck,
    step: "01",
    title: "Create your profile",
    desc: "Tell us about yourself, your faith, and what you're looking for in a life partner.",
  },
  {
    icon: Search,
    step: "02",
    title: "Discover & match",
    desc: "Browse verified profiles tailored to your values. Like someone, and if they like you back — it's a match.",
  },
  {
    icon: MessageCircle,
    step: "03",
    title: "Connect with intention",
    desc: "Start a respectful conversation, involve your families, and take the next step toward nikah.",
  },
];

const VALUES = [
  { icon: ShieldCheck, label: "Manual profile approval" },
  { icon: Lock, label: "Photo privacy controls" },
  { icon: Heart, label: "Report & block tools" },
  { icon: BadgeCheck, label: "Verified-only browsing" },
];

const TESTIMONIALS = [
  {
    quote:
      "Finally a platform that takes deen seriously. I felt safe, respected, and found someone who shares my values within weeks.",
    name: "Ayesha",
    location: "Lahore",
  },
  {
    quote:
      "As an overseas Pakistani, finding a like-minded match was impossible until Rishta. The verification gave my family confidence.",
    name: "Bilal",
    location: "London",
  },
  {
    quote:
      "No games, no awkwardness. Just sincere people looking for marriage. Alhamdulillah, we're engaged now.",
    name: "Fatima",
    location: "Karachi",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/discover");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Nav ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="w-9 h-9" />
            <span className="font-bold text-lg tracking-tight">Rishta</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-full transition-colors shadow-sm"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(157,33,89,0.08) 0, transparent 40%), radial-gradient(circle at 80% 0%, rgba(193,150,58,0.10) 0, transparent 40%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-brand-700 text-xs font-medium mb-6 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            For practising Muslims who are serious about marriage
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl mx-auto animate-slide-up">
            Find your{" "}
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
              rishta
            </span>{" "}
            the halal way
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto leading-relaxed animate-slide-up [animation-delay:80ms]">
            A modern, private, and faith-first platform connecting marriage-minded
            Muslims across Pakistan and the diaspora. Verified profiles. Real
            intentions.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center animate-slide-up [animation-delay:160ms]">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-lg shadow-brand-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Create your profile
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold transition-colors"
            >
              I already have an account
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              100% verified profiles
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-600" />
              Private by design
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-brand-600" />
              Marriage, not dating
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-3 gap-4 text-center">
          {[
            ["100%", "Profiles verified"],
            ["Halal", "Communication only"],
            ["24h", "Profile review"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Built for serious intentions
          </h2>
          <p className="mt-4 text-gray-600">
            Everything you need to find a spouse with confidence — and nothing that
            gets in the way.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group p-7 rounded-3xl border border-gray-100 bg-white hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950 text-white">
        <div className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Three steps to your nikah
            </h2>
            <p className="mt-4 text-white/60">
              Simple, respectful, and designed around your values.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="relative">
                <div className="text-6xl font-bold text-white/5 absolute -top-6 left-0">
                  {s.step}
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center mb-5">
                    <s.icon className="h-6 w-6 text-brand-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & safety ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium mb-5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Trust & Safety
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              A safe space your family can trust
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              We know marriage is a family decision. That's why every profile is
              manually reviewed, photos are protected, and you have full control over
              who sees your information and who can contact you.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {VALUES.map((v) => (
                <div key={v.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <v.icon className="h-4.5 w-4.5 text-brand-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-brand-100 via-brand-50 to-white border border-brand-100 p-8 flex items-center justify-center">
              <div className="text-center">
                <LogoMark className="w-24 h-24 rounded-3xl shadow-xl shadow-brand-200 mx-auto" rounded="rounded-3xl" />
                <p className="mt-6 text-2xl font-bold text-gray-900">Rishta</p>
                <p className="text-gray-500 text-sm mt-1">رشتہ — a bond for life</p>
                <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-brand-100 text-brand-700 text-xs font-medium shadow-sm">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Every profile verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing / Gold ─────────────────────────────────── */}
      <section className="bg-gray-50/60 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Start free, upgrade when ready
            </h2>
            <p className="mt-4 text-gray-600">
              Browse and match for free. Unlock premium features with Gold when
              you're ready to take it seriously.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            <div className="p-8 rounded-3xl border border-gray-200 bg-white">
              <p className="font-bold text-lg">Free</p>
              <p className="text-3xl font-bold mt-2">
                Rs 0
                <span className="text-base font-normal text-gray-400">/forever</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                {["Create a verified profile", "Browse & filter matches", "Like and match", "Chat with your matches"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <Heart className="h-4 w-4 text-brand-500 shrink-0" />
                      {item}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/signup"
                className="mt-7 block text-center py-3 rounded-full border border-gray-200 hover:border-gray-300 font-semibold text-gray-700 transition-colors"
              >
                Get started
              </Link>
            </div>
            <div className="relative p-8 rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white shadow-lg shadow-amber-100">
              <span className="absolute -top-3 left-8 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                Most popular
              </span>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <p className="font-bold text-lg">Gold</p>
              </div>
              <p className="text-3xl font-bold mt-2">
                Rs 2,000
                <span className="text-base font-normal text-gray-400">/month</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                {["See who liked you", "Unlimited matches & chat", "Profile boost", "Read receipts", "Advanced filters", "Gold badge"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                      {item}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/signup"
                className="mt-7 block text-center py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-semibold transition-all shadow-md"
              >
                Upgrade to Gold
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Loved by the ummah
          </h2>
          <p className="mt-4 text-gray-600">
            Real stories from members who found their other half.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="p-7 rounded-3xl border border-gray-100 bg-white"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 px-8 py-16 sm:py-20 text-center text-white">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 30%, white 0, transparent 35%), radial-gradient(circle at 70% 70%, white 0, transparent 35%)",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-xl mx-auto">
              Your other half is one rishta away
            </h2>
            <p className="mt-4 text-white/80 max-w-md mx-auto">
              Join a community of sincere Muslims building marriages on a foundation
              of faith.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-brand-700 font-semibold hover:bg-brand-50 transition-colors shadow-lg"
            >
              Create your free profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <LogoMark className="w-8 h-8 rounded-lg" rounded="rounded-lg" />
              <span className="font-bold">Rishta</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy
              </Link>
              <Link href="/login" className="hover:text-gray-900 transition-colors">
                Sign in
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Rishta. Made with care for the ummah. ·
            رشتہ
          </div>
        </div>
      </footer>
    </div>
  );
}
