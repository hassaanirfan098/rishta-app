"use client";

import { useState } from "react";
import { Check, HeartHandshake, Search, Users, Loader2, ChevronRight, MessageCircle, ShieldCheck, Lock, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/Toast";
import { LogoGlyph } from "@/components/Logo";

// TODO: replace with your real WhatsApp number (international format, no +/spaces)
const WHATSAPP_NUMBER = "923000000000";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Assalamu Alaikum, I'd like to know more about your matchmaking service.")}`;

const PACKAGES = [
  {
    id: "featured",
    name: "Featured Introduction",
    price: "Rs 5,000",
    tagline: "Get your proposal seen",
    perks: [
      "Featured on our platform & network",
      "Direct introductions to interested families",
      "Verified & kept fully confidential",
      "Valid for 30 days",
    ],
  },
  {
    id: "priority",
    name: "Priority Introduction",
    price: "Rs 20,000",
    tagline: "Maximum reach",
    popular: true,
    perks: [
      "Everything in Featured",
      "Shown to a much wider matching audience",
      "Priority placement",
      "Every interested inquiry forwarded straight to you",
      "Valid for 60 days",
    ],
  },
  {
    id: "concierge",
    name: "Personal Matchmaker",
    price: "Rs 35,000",
    tagline: "Handpicked, just for you",
    perks: [
      "Everything in Priority",
      "A dedicated matchmaker for your family",
      "Up to 50 curated, requirement-matched proposals (~Rs 700 each)",
      "Every match pre-screened & genuinely interested",
      "We personally coordinate the introductions",
      "Split payment available",
    ],
    guarantee: "Our promise: up to 50 compatible proposals — or we keep working until we deliver.",
  },
];

const STEPS = [
  { icon: HeartHandshake, title: "Tell us what you're looking for", desc: "Share your requirements and the kind of family and partner you have in mind." },
  { icon: Search, title: "We find & screen for you", desc: "We bring the right families to you and hand-screen every one against your requirements." },
  { icon: Users, title: "We make the introduction", desc: "We connect you with serious, compatible families — privately and respectfully." },
];

export default function PersonalizedPage() {
  const { toast } = useToast();
  const [pkg, setPkg] = useState("priority");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "", looking_for: "", age_range: "", city: "", sect: "", requirements: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.full_name || !form.phone) {
      toast("Please add your name and phone.", "error");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/service-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, package: pkg }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      toast(d.error || "Something went wrong.", "error");
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center pb-20">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mb-5">
          <Check className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-semibold text-ink">Request received</h1>
        <p className="text-muted text-sm mt-2 max-w-xs">
          Thank you — our matchmaker will personally reach out to you on WhatsApp shortly to confirm the details and get started.
        </p>
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-600 text-white font-medium">
          <MessageCircle className="h-4 w-4" /> Message us on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-hairline sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-2.5">
          <LogoGlyph className="w-6 h-6" />
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Personalized</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-8">
        {/* Hero */}
        <div>
          <h2 className="text-3xl font-semibold text-ink tracking-tight leading-tight">Let us find your rishta</h2>
          <p className="text-body mt-3">
            Skip the searching. Tell us what you're looking for, and our matchmakers will personally bring you serious, compatible proposals — privately and respectfully.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-brand-600" /> Verified proposals</span>
          <span className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-brand-600" /> 100% confidential</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand-600" /> No public photos</span>
        </div>

        {/* Talk to matchmaker */}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-[14px] border border-hairline p-4 hover:bg-surface-soft transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="font-medium text-ink">Talk to our matchmaker</p>
              <p className="text-sm text-muted">Prefer to speak first? Message us on WhatsApp.</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted" />
        </a>

        {/* How it works */}
        <div className="space-y-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-ink">{i + 1}. {s.title}</p>
                <p className="text-sm text-muted mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Packages */}
        <div className="space-y-3">
          <h3 className="font-semibold text-ink">Choose a package</h3>
          {PACKAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPkg(p.id)}
              className={`w-full text-left rounded-[14px] border p-5 transition-colors relative ${
                pkg === p.id ? "border-brand-600 bg-brand-50/40" : "border-hairline hover:border-gray-300"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-5 bg-gold-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">Most families choose this</span>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-muted">{p.tagline}</p>
                </div>
                <p className="font-semibold text-ink">{p.price}</p>
              </div>
              <ul className="mt-3 space-y-1.5">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-body">
                    <Check className="h-3.5 w-3.5 text-brand-600 shrink-0 mt-0.5" />
                    {perk}
                  </li>
                ))}
              </ul>
              {p.guarantee && (
                <p className="mt-3 text-xs text-brand-700 bg-brand-50 rounded-lg px-3 py-2 flex items-start gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {p.guarantee}
                </p>
              )}
            </button>
          ))}
        </div>

        {!showForm ? (
          <Button className="w-full" onClick={() => setShowForm(true)}>
            Continue
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <div className="space-y-4 rounded-[14px] border border-hairline p-5">
            <h3 className="font-semibold text-ink">Your requirements</h3>
            <div className="space-y-1.5">
              <Label htmlFor="fn" className="text-sm text-ink">Your name</Label>
              <Input id="fn" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ph" className="text-sm text-ink">WhatsApp number</Label>
              <Input id="ph" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="03xx xxxxxxx" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-ink">Looking for</Label>
                <select
                  value={form.looking_for}
                  onChange={(e) => set("looking_for", e.target.value)}
                  className="h-12 w-full rounded-lg border border-hairline bg-white px-3 text-base text-ink focus:outline-none focus:border-2 focus:border-ink"
                >
                  <option value="">Select</option>
                  <option value="female">A bride</option>
                  <option value="male">A groom</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ar" className="text-sm text-ink">Age range</Label>
                <Input id="ar" value={form.age_range} onChange={(e) => set("age_range", e.target.value)} placeholder="e.g. 25–30" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ct" className="text-sm text-ink">City</Label>
                <Input id="ct" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sc" className="text-sm text-ink">Sect</Label>
                <Input id="sc" value={form.sect} onChange={(e) => set("sect", e.target.value)} placeholder="Sect" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rq" className="text-sm text-ink">What you're looking for</Label>
              <textarea
                id="rq"
                value={form.requirements}
                onChange={(e) => set("requirements", e.target.value)}
                placeholder="Education, profession, family background, deen, any preferences…"
                className="w-full min-h-[100px] rounded-lg border border-hairline bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:outline-none focus:border-2 focus:border-ink"
              />
            </div>
            <div className="rounded-lg bg-surface-soft px-4 py-3 text-sm text-body">
              Selected: <span className="font-medium text-ink">{PACKAGES.find((p) => p.id === pkg)?.name}</span> · {PACKAGES.find((p) => p.id === pkg)?.price}
            </div>
            <Button className="w-full" disabled={loading} onClick={submit}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit request
            </Button>
            <p className="text-xs text-muted text-center">
              No payment now. Our matchmaker will confirm everything with you on WhatsApp first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
