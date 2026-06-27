"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const type = params.get("type");
  const profileId = params.get("profile");
  const [done, setDone] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const run = async () => {
      if (type === "unlock" && profileId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        for (let i = 0; i < 10; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          const { data } = await supabase
            .from("unlocks")
            .select("id")
            .eq("user_id", user.id)
            .eq("directory_profile_id", profileId)
            .single();
          if (data) break;
        }
      }
      setDone(true);
    };
    run();
  }, [type, profileId]);

  const messages: Record<string, { title: string; body: string; cta: string; href: string }> = {
    unlock: { title: "Contact Unlocked!", body: "You can now see their phone number.", cta: "View in Directory", href: "/directory" },
    bundle: { title: "Bundle Activated!", body: "30 contact credits added to your account.", cta: "Browse Directory", href: "/directory" },
    gold_monthly: { title: "Gold Active!", body: "Your Gold membership is now active for 1 month.", cta: "Go to Discover", href: "/discover" },
    gold_yearly: { title: "Gold Active!", body: "Your Gold membership is now active for 1 year.", cta: "Go to Discover", href: "/discover" },
  };

  const msg = messages[type || ""] || { title: "Payment Successful!", body: "Thank you for your payment.", cta: "Go Home", href: "/discover" };

  return (
    <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-100">
      {!done ? (
        <>
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Confirming payment...</p>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{msg.title}</h1>
          <p className="text-gray-500 text-sm mb-8">{msg.body}</p>
          <button
            onClick={() => router.push(msg.href)}
            className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-2xl hover:bg-emerald-700 transition-colors"
          >
            {msg.cta}
          </button>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Suspense fallback={<Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
