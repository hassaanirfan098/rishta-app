import { createClient } from "@/lib/supabase/server";
import { Users, BookOpen, Heart, Flag } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalMembers },
    { count: pendingApproval },
    { count: totalDirectory },
    { count: openReports },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_approved", false).eq("onboarding_complete", true),
    supabase.from("directory_profiles").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const stats = [
    { label: "Total Members", value: totalMembers || 0, icon: Users, color: "emerald" },
    { label: "Pending Approval", value: pendingApproval || 0, icon: Users, color: "amber" },
    { label: "Directory Profiles", value: totalDirectory || 0, icon: BookOpen, color: "blue" },
    { label: "Open Reports", value: openReports || 0, icon: Flag, color: "red" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Rishta admin overview</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
