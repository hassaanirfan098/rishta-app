import Link from "next/link";
import { Home, Search } from "lucide-react";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <LogoMark className="w-20 h-20 rounded-3xl shadow-lg shadow-brand-200 mx-auto" rounded="rounded-3xl" />
        <p className="mt-8 text-6xl font-bold text-gray-900">404</p>
        <h1 className="mt-2 text-xl font-semibold text-gray-800">
          Page not found
        </h1>
        <p className="mt-2 text-gray-500 text-sm leading-relaxed">
          The page you're looking for doesn't exist or may have moved. Let's get
          you back on track.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors shadow-sm"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          <Link
            href="/discover"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold transition-colors"
          >
            <Search className="h-4 w-4" />
            Discover matches
          </Link>
        </div>
      </div>
    </div>
  );
}
