import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/BottomNav";
import { PushInit } from "@/components/PushInit";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen pb-20">
      <PushInit />
      {children}
      <PWAInstallPrompt />
      <BottomNav />
    </div>
  );
}
