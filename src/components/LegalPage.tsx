import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/Logo";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="w-9 h-9" />
            <span className="font-bold text-lg">Rishta</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-gray-400">Last updated: {updated}</p>
        <div className="legal-content mt-10 space-y-8">{children}</div>

        <div className="mt-16 pt-8 border-t border-gray-100 text-sm text-gray-500">
          Questions? Email us at{" "}
          <a
            href="mailto:support@rishta.app"
            className="text-brand-600 font-medium hover:underline"
          >
            support@rishta.app
          </a>
        </div>
      </main>
    </div>
  );
}

export function Clause({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-3">{heading}</h2>
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
