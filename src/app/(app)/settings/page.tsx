"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

const SECTS = ["Sunni", "Shia", "Deobandi", "Barelvi", "Ahl-e-Hadith", "Other"];
const RELIGIOSITY = ["Very practicing", "Practicing", "Moderate", "Learning"];

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    };
    load();
  }, []);

  const update = (key: string, value: string | number) =>
    setProfile((p: any) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        city: profile.city,
        country: profile.country,
        sect: profile.sect,
        religiosity: profile.religiosity,
        ethnicity: profile.ethnicity,
        caste: profile.caste,
        education: profile.education,
        profession: profile.profession,
        about_me: profile.about_me,
        height_cm: profile.height_cm,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Edit Profile</h1>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              "Saved!"
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-800">Basic Info</h3>
          <div>
            <Label>Full Name</Label>
            <Input
              value={profile?.full_name || ""}
              onChange={(e) => update("full_name", e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Phone (WhatsApp)</Label>
            <Input
              value={profile?.phone || ""}
              onChange={(e) => update("phone", e.target.value)}
              className="mt-1.5"
              type="tel"
            />
          </div>
          <div>
            <Label>City</Label>
            <Input
              value={profile?.city || ""}
              onChange={(e) => update("city", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-800">Religious Background</h3>
          <div>
            <Label>Sect</Label>
            <Select value={profile?.sect || ""} onValueChange={(v) => update("sect", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {SECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Religiosity</Label>
            <Select value={profile?.religiosity || ""} onValueChange={(v) => update("religiosity", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {RELIGIOSITY.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-800">About Me</h3>
          <Textarea
            value={profile?.about_me || ""}
            onChange={(e) => update("about_me", e.target.value)}
            placeholder="Tell us about yourself..."
            className="min-h-[120px]"
          />
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-800">Career</h3>
          <div>
            <Label>Profession</Label>
            <Input
              value={profile?.profession || ""}
              onChange={(e) => update("profession", e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Education</Label>
            <Input
              value={profile?.education || ""}
              onChange={(e) => update("education", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
