"use client";

import { useState, useEffect, useRef } from "react";
import { useLang } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Camera, Trash2, LogOut, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";

const SECTS = ["Sunni", "Shia", "Deobandi", "Barelvi", "Ahl-e-Hadith", "Other"];
const RELIGIOSITY = ["Very practicing", "Practicing", "Moderate", "Learning"];
const MARITAL = ["Never married", "Divorced", "Widowed"];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm text-gray-600">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photos, setPhotos] = useState<{ id: string; url: string; order_index: number }[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { lang, setLang } = useLang();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);

      const { data: photoData } = await supabase
        .from("profile_photos")
        .select("id, url, order_index")
        .eq("profile_id", user.id)
        .order("order_index");
      setPhotos(photoData || []);
      setLoading(false);
    };
    load();
  }, []);

  const update = (key: string, value: any) => setProfile((p: any) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      phone: profile.phone,
      city: profile.city,
      country: profile.country,
      sect: profile.sect,
      religiosity: profile.religiosity,
      education: profile.education,
      profession: profile.profession,
      about_me: profile.about_me,
      marital_status: profile.marital_status,
      height_cm: profile.height_cm,
    }).eq("id", profile.id);
    setSaving(false);
    if (error) { toast(error.message, "error"); return; }
    toast("Profile saved", "success");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingPhoto(true);

    const ext = file.name.split(".").pop();
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file);
    if (uploadErr) { toast(uploadErr.message, "error"); setUploadingPhoto(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

    const { data: inserted } = await supabase.from("profile_photos").insert({
      profile_id: profile.id,
      url: publicUrl,
      order_index: photos.length,
    }).select().single();

    if (photos.length === 0) {
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id);
      update("avatar_url", publicUrl);
    }

    if (inserted) setPhotos((p) => [...p, inserted]);
    setUploadingPhoto(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const deletePhoto = async (photoId: string, url: string) => {
    await supabase.from("profile_photos").delete().eq("id", photoId);
    const remaining = photos.filter((p) => p.id !== photoId);
    setPhotos(remaining);
    if (profile.avatar_url === url && remaining.length > 0) {
      await supabase.from("profiles").update({ avatar_url: remaining[0].url }).eq("id", profile.id);
      update("avatar_url", remaining[0].url);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { setPwMsg("Password must be at least 8 characters."); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwLoading(false);
    if (error) { setPwMsg(error.message); } else { setPwMsg("Password updated!"); setNewPassword(""); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    await fetch("/api/account/delete", { method: "POST" });
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button aria-label="Go back" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1">Settings</h1>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? "Saved ✓" : <><Save className="h-4 w-4 mr-1" />Save</>}
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Photos */}
        <SectionCard title="Photos">
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => deletePhoto(photo.id, photo.url)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </button>
                {photo.url === profile.avatar_url && (
                  <div className="absolute bottom-1 left-1 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">Main</div>
                )}
              </div>
            ))}
            {photos.length < 6 && (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
              >
                {uploadingPhoto ? <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" /> : <Camera className="h-5 w-5 text-gray-400" />}
                <span className="text-xs text-gray-400">Add photo</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          <p className="text-xs text-gray-400">Up to 6 photos. First photo is your main profile picture.</p>
        </SectionCard>

        {/* Basic Info */}
        <SectionCard title="Basic Info">
          <Field label="Full Name">
            <Input value={profile?.full_name || ""} onChange={(e) => update("full_name", e.target.value)} />
          </Field>
          <Field label="Phone (WhatsApp)">
            <Input value={profile?.phone || ""} onChange={(e) => update("phone", e.target.value)} type="tel" />
          </Field>
          <Field label="City">
            <Input value={profile?.city || ""} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <Field label="Country">
            <Input value={profile?.country || ""} onChange={(e) => update("country", e.target.value)} />
          </Field>
          <Field label="Marital Status">
            <Select value={profile?.marital_status || ""} onValueChange={(v) => update("marital_status", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{MARITAL.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Height (cm)">
            <Input
              type="number"
              value={profile?.height_cm || ""}
              onChange={(e) => update("height_cm", e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 170"
              min={140}
              max={220}
            />
          </Field>
        </SectionCard>

        {/* About Me */}
        <SectionCard title="About Me">
          <Textarea
            value={profile?.about_me || ""}
            onChange={(e) => update("about_me", e.target.value)}
            placeholder="Tell people about yourself..."
            className="min-h-[120px]"
          />
          <p className="text-xs text-gray-400 text-right">{profile?.about_me?.length || 0}/500</p>
        </SectionCard>

        {/* Faith */}
        <SectionCard title="Faith">
          <Field label="Sect">
            <Select value={profile?.sect || ""} onValueChange={(v) => update("sect", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{SECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Religiosity">
            <Select value={profile?.religiosity || ""} onValueChange={(v) => update("religiosity", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{RELIGIOSITY.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </SectionCard>

        {/* Career */}
        <SectionCard title="Career & Education">
          <Field label="Profession">
            <Input value={profile?.profession || ""} onChange={(e) => update("profession", e.target.value)} />
          </Field>
          <Field label="Education">
            <Input value={profile?.education || ""} onChange={(e) => update("education", e.target.value)} />
          </Field>
        </SectionCard>

        {/* Language */}
        <SectionCard title="Language / زبان">
          <div className="flex gap-3">
            <button
              onClick={() => setLang("en")}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${lang === "en" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"}`}
            >
              English
            </button>
            <button
              onClick={() => setLang("ur")}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${lang === "ur" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500"}`}
            >
              اردو
            </button>
          </div>
        </SectionCard>

        {/* Change Password */}
        <SectionCard title="Change Password">
          <Field label="New Password">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </Field>
          {pwMsg && <p className={`text-sm ${pwMsg.includes("updated") ? "text-emerald-600" : "text-red-500"}`}>{pwMsg}</p>}
          <Button onClick={handleChangePassword} disabled={pwLoading || !newPassword} variant="outline" className="w-full">
            {pwLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
            Update Password
          </Button>
        </SectionCard>

        {/* Save */}
        <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>

        {/* Delete Account */}
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="w-full text-center text-sm text-red-400 hover:text-red-600 py-2"
          >
            Delete Account
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">Delete your account?</p>
            </div>
            <p className="text-sm text-red-600">This permanently deletes your profile, matches, and messages. This cannot be undone.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Delete"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
