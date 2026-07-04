"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    const res = await fetch("/api/admin/reports");
    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const resolve = async (id: string) => {
    setActionLoading(id);
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "resolved" }),
    });
    setReports((r) => r.map((x) => x.id === id ? { ...x, status: "resolved" } : x));
    setActionLoading(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports</h1>
      <p className="text-gray-500 mb-6">Review user-submitted reports</p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-gray-500">No reports yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${report.status === "resolved" ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-700"}`}>
                      {report.status || "pending"}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Reason: <span className="font-normal text-gray-700">{report.reason || "Not specified"}</span>
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Reporter: <span className="font-medium text-gray-700">{report.reporter?.full_name || report.reporter_id?.slice(0, 8)}</span></span>
                    <span>Reported: <span className="font-medium text-gray-700">{report.reported?.full_name || report.reported_id?.slice(0, 8)}</span></span>
                  </div>
                </div>
                {report.status !== "resolved" && (
                  <Button size="sm" onClick={() => resolve(report.id)} disabled={actionLoading === report.id} className="shrink-0">
                    {actionLoading === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-1" />Resolve</>}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
