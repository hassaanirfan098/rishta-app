"use client";

import { useState, useEffect } from "react";
import { Plus, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminDirectoryPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newProfile, setNewProfile] = useState({
    full_name: "", phone: "", age: "", city: "", country: "Pakistan",
    sect: "", profession: "", education: "", marital_status: "Never married",
  });

  const api = async (body: any) => {
    const res = await fetch("/api/admin/directory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const loadProfiles = async () => {
    const res = await fetch("/api/admin/directory");
    const data = await res.json();
    setProfiles(data.profiles || []);
    setLoading(false);
  };

  useEffect(() => { loadProfiles(); }, []);

  const addProfile = async () => {
    if (!newProfile.full_name || !newProfile.phone) {
      alert("Name and phone are required");
      return;
    }
    const row = { ...newProfile, age: newProfile.age ? parseInt(newProfile.age) : null, consent_captured: true };
    const data = await api({ action: "insert", rows: [row] });
    if (data.error) { alert(data.error); return; }
    setShowAdd(false);
    setNewProfile({ full_name: "", phone: "", age: "", city: "", country: "Pakistan", sect: "", profession: "", education: "", marital_status: "Never married" });
    loadProfiles();
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    await api({ action: "toggle", id, is_active: !is_active });
    setProfiles((p) => p.map((x) => x.id === id ? { ...x, is_active: !is_active } : x));
  };

  const deleteProfile = async (id: string) => {
    if (!confirm("Delete this profile?")) return;
    await api({ action: "delete", id });
    setProfiles((p) => p.filter((x) => x.id !== id));
  };

  const handleCsvUpload = async () => {
    if (!csvText.trim()) return;
    setUploading(true);
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const rows = lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
      return {
        full_name: obj.full_name || obj.name || "",
        age: obj.age ? parseInt(obj.age) : null,
        city: obj.city || "",
        country: obj.country || "Pakistan",
        sect: obj.sect || "",
        phone: obj.phone || "",
        profession: obj.profession || "",
        education: obj.education || "",
        consent_captured: true,
      };
    }).filter((r) => r.full_name && r.phone);

    if (rows.length === 0) { alert("No valid rows found. Make sure your CSV has full_name and phone columns."); setUploading(false); return; }

    const data = await api({ action: "insert", rows });
    setUploading(false);
    if (data.error) { alert(data.error); return; }
    alert(`Uploaded ${data.count} profiles!`);
    setCsvText("");
    loadProfiles();
  };

  const up = (k: string, v: string) => setNewProfile((p) => ({ ...p, [k]: v }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Directory Profiles</h1>
          <p className="text-gray-500 text-sm mt-1">Manage community directory</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-4 w-4 mr-2" />Add Profile
        </Button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Add Single Profile</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { k: "full_name", label: "Full Name *" }, { k: "phone", label: "Phone *" },
              { k: "age", label: "Age" }, { k: "city", label: "City" },
              { k: "country", label: "Country" }, { k: "sect", label: "Sect" },
              { k: "profession", label: "Profession" }, { k: "education", label: "Education" },
            ].map(({ k, label }) => (
              <div key={k}>
                <Label className="text-xs">{label}</Label>
                <Input className="mt-1 h-9" value={(newProfile as any)[k]} onChange={(e) => up(k, e.target.value)} />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={addProfile}>Save Profile</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-900 mb-1">Bulk CSV Upload</h3>
        <p className="text-xs text-gray-500 mb-1">Required headers: <code className="bg-gray-100 px-1 rounded">full_name,phone,age,city,country,sect,profession,education</code></p>
        <p className="text-xs text-gray-400 mb-3">Example: <code className="bg-gray-100 px-1 rounded">Ahmed Raza,+923001234567,31,Lahore,Pakistan,Sunni,Engineer,BSc</code></p>
        <textarea
          className="w-full h-28 border border-gray-200 rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder={"full_name,phone,age,city,country,sect,profession,education\nAhmed Raza,+923001234567,31,Lahore,Pakistan,Sunni,Engineer,BSc"}
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
        />
        <Button className="mt-3" onClick={handleCsvUpload} disabled={!csvText.trim() || uploading}>
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Upload CSV"}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Profession</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-sm text-gray-900">{p.full_name}</p>
                    <p className="text-xs text-gray-500">{p.age ? `${p.age} yrs` : ""}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{[p.city, p.country].filter(Boolean).join(", ")}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{p.profession || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${p.is_active ? "bg-brand-100 text-brand-800" : "bg-gray-100 text-gray-600"}`}>
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleActive(p.id, p.is_active)} className="text-xs text-gray-500 hover:text-brand-600 underline">
                        {p.is_active ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => deleteProfile(p.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {profiles.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-sm">No directory profiles yet</div>
          )}
        </div>
      )}
    </div>
  );
}
