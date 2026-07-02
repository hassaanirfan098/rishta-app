"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";
import { LogoMark } from "@/components/Logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error for observability
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <LogoMark className="w-20 h-20 rounded-3xl shadow-lg shadow-emerald-200 mx-auto" rounded="rounded-3xl" />
        <h1 className="mt-8 text-xl font-semibold text-gray-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-gray-500 text-sm leading-relaxed">
          We hit an unexpected snag. This has been noted — please try again.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold transition-colors"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
