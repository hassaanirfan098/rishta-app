import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { LangProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://rishta-app.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rishta — Muslim Matrimonial for Pakistan & Diaspora",
    template: "%s · Rishta",
  },
  description:
    "A modern, private, and faith-first platform for practising Muslims to find marriage. Verified profiles, halal communication, and serious intentions only.",
  applicationName: "Rishta",
  keywords: [
    "Muslim matrimonial",
    "Pakistani rishta",
    "halal marriage",
    "Islamic marriage app",
    "Muslim marriage Pakistan",
    "nikah",
    "shaadi",
  ],
  authors: [{ name: "Rishta" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rishta",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Rishta",
    title: "Rishta — Find your rishta the halal way",
    description:
      "A modern, private, faith-first matrimonial platform for marriage-minded Muslims across Pakistan and the diaspora.",
    url: SITE_URL,
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rishta — Muslim Matrimonial",
    description:
      "Verified profiles. Halal communication. Serious intentions only.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#9d2159",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900"><LangProvider><ToastProvider>{children}</ToastProvider></LangProvider></body>
    </html>
  );
}
