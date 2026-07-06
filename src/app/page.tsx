import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/Logo";
import {
  ShieldCheck,
  Heart,
  MessageCircle,
  Lock,
  BadgeCheck,
  Search,
  UserCheck,
  Crown,
  Star,
} from "lucide-react";

export const metadata = {
  title: "Rishta — Muslim Matrimonial for Pakistan & Diaspora",
  description:
    "A modern, private, and faith-first way for practising Muslims to find marriage. Verified profiles, halal communication, and serious intentions only.",
};

const FEATURES = [
  { icon: BadgeCheck, title: "Verified profiles", desc: "Every member is manually reviewed and photo-verified before they appear. No bots, no catfish, no time-wasters." },
  { icon: Lock, title: "Privacy first", desc: "Your photos and contact details stay private until you choose to share them. You are always in control." },
  { icon: Heart, title: "Meaningful matches", desc: "Filter by sect, religiosity, family values, and life goals — so every match starts with what matters." },
  { icon: MessageCircle, title: "Halal communication", desc: "Chat only after a mutual match. A respectful, pressure-free space designed for marriage, not dating." },
];

const STEPS = [
  { icon: UserCheck, step: "1", title: "Create your profile", desc: "Tell us about yourself, your faith, and what you're looking for in a life partner." },
  { icon: Search, step: "2", title: "Discover & match", desc: "Browse verified profiles tailored to your values. Like someone, and if they like you back — it's a match." },
  { icon: MessageCircle, step: "3", title: "Connect with intention", desc: "Start a respectful conversation, involve your families, and take the next step toward nikah." },
];

const VALUES = [
  { icon: ShieldCheck, label: "Manual profile approval" },
  { icon: Lock, label: "Photo privacy controls" },
  { icon: Heart, label: "Report & block tools" },
  { icon: BadgeCheck, label: "Verified-only browsing" },
];

const TESTIMONIALS = [
  { quote: "Finally a platform that takes deen seriously. I felt safe, respected, and found someone who shares my values within weeks.", name: "Ayesha", location: "Lahore" },
  { quote: "As an overseas Pakistani, finding a like-minded match was impossible until Rishta. The verification gave my family confidence.", name: "Bilal", location: "London" },
  { quote: "No games, no awkwardness. Just sincere people looking for marriage. Alhamdulillah, we're engaged now.", name: "Fatima", location: "Karachi" },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/discover");

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* ── Nav ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-hairline">
        <nav className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="w-9 h-9" />
            <span className="font-semibold text-lg tracking-tight">Rishta</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/login" className="px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-soft rounded-lg transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="px-5 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-hairline text-muted text-sm font-medium mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
          For practising Muslims serious about marriage
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] max-w-3xl mx-auto">
          Find your <span className="text-brand-600">rishta</span> the halal way
        </h1>
        <p className="mt-6 text-lg text-body max-w-xl mx-auto leading-relaxed">
          A modern, private, and faith-first platform connecting marriage-minded Muslims across Pakistan and the diaspora. Verified profiles. Real intentions.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors">
            Create your profile
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-white border border-ink text-ink font-medium hover:bg-surface-soft transition-colors">
            I already have an account
          </Link>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-600" /> 100% verified profiles</span>
          <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-brand-600" /> Private by design</span>
          <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-brand-600" /> Marriage, not dating</span>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="border-y border-hairline">
        <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-3 gap-4 text-center">
          {[["100%", "Profiles verified"], ["Halal", "Communication only"], ["24h", "Profile review"]].map(([stat, label]) => (
            <div key={label}>
              <p className="text-2xl sm:text-3xl font-semibold">{stat}</p>
              <p className="text-sm text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">Built for serious intentions</h2>
          <p className="mt-3 text-body">Everything you need to find a spouse with confidence — and nothing that gets in the way.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="p-6 rounded-[14px] border border-hairline bg-white transition-shadow hover:shadow-card">
              <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                <f.icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
              <p className="text-body text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="border-t border-hairline">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-semibold tracking-tight">Three steps to your nikah</h2>
            <p className="mt-3 text-body">Simple, respectful, and designed around your values.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.step}>
                <div className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center font-medium mb-5">{s.step}</div>
                <h3 className="text-lg font-semibold mb-1.5">{s.title}</h3>
                <p className="text-body text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & safety ─────────────────────────────────── */}
      <section className="border-t border-hairline">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">A safe space your family can trust</h2>
            <p className="mt-3 text-body leading-relaxed">
              We know marriage is a family decision. Every profile is manually reviewed, photos are protected, and you control who sees your information and who can contact you.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {VALUES.map((v) => (
                <div key={v.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <v.icon className="h-4 w-4 text-brand-600" />
                  </div>
                  <span className="text-sm font-medium">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[14px] border border-hairline bg-surface-soft p-10 flex items-center justify-center">
            <div className="text-center">
              <LogoMark className="w-20 h-20 rounded-3xl mx-auto" rounded="rounded-3xl" />
              <p className="mt-5 text-xl font-semibold">Rishta</p>
              <p className="text-muted text-sm mt-1">رشتہ — a bond for life</p>
              <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-hairline bg-white text-ink text-xs font-medium">
                <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />
                Every profile verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section className="border-t border-hairline">
        <div className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-semibold tracking-tight">Start free, upgrade when ready</h2>
            <p className="mt-3 text-body">Browse and match for free. Unlock premium features with Gold when you're ready to take it seriously.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="p-7 rounded-[14px] border border-hairline bg-white">
              <p className="font-semibold text-lg">Free</p>
              <p className="text-3xl font-semibold mt-2">Rs 0<span className="text-base font-normal text-muted">/forever</span></p>
              <ul className="mt-6 space-y-3 text-sm text-body">
                {["Create a verified profile", "Browse & filter matches", "Like and match", "Chat with your matches"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5"><Heart className="h-4 w-4 text-brand-600 shrink-0" />{item}</li>
                ))}
              </ul>
              <Link href="/signup" className="mt-7 block text-center py-3 rounded-lg border border-ink text-ink font-medium hover:bg-surface-soft transition-colors">Get started</Link>
            </div>
            <div className="relative p-7 rounded-[14px] border border-hairline bg-white">
              <span className="absolute -top-3 left-7 bg-gold-500 text-white text-xs font-medium px-3 py-1 rounded-full">Most popular</span>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold-500" />
                <p className="font-semibold text-lg">Gold</p>
              </div>
              <p className="text-3xl font-semibold mt-2">Rs 2,000<span className="text-base font-normal text-muted">/month</span></p>
              <ul className="mt-6 space-y-3 text-sm text-body">
                {["See who liked you", "Unlimited matches & chat", "Profile boost", "Read receipts", "Advanced filters", "Gold badge"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5"><Crown className="h-4 w-4 text-gold-500 shrink-0" />{item}</li>
                ))}
              </ul>
              <Link href="/signup" className="mt-7 block text-center py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors">Upgrade to Gold</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="border-t border-hairline">
        <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-semibold tracking-tight">Loved by the ummah</h2>
            <p className="mt-3 text-body">Real stories from members who found their other half.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-[14px] border border-hairline bg-white">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-body text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-medium text-sm">{t.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="border-t border-hairline bg-surface-soft">
        <div className="max-w-3xl mx-auto px-5 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Your other half is one rishta away</h2>
          <p className="mt-4 text-body max-w-md mx-auto">Join a community of sincere Muslims building marriages on a foundation of faith.</p>
          <Link href="/signup" className="mt-8 inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors">
            Create your free profile
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-hairline bg-white">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <LogoMark className="w-8 h-8 rounded-lg" rounded="rounded-lg" />
              <span className="font-semibold">Rishta</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted">
              <Link href="/terms" className="hover:text-ink transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
              <Link href="/login" className="hover:text-ink transition-colors">Sign in</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-hairline-soft text-center text-xs text-muted">
            © {new Date().getFullYear()} Rishta. Made with care for the ummah. · رشتہ
          </div>
        </div>
      </footer>
    </div>
  );
}
