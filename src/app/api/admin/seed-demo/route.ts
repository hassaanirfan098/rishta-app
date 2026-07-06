import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

// 5 imaginary member profiles for demoing the swipe/Discover experience.
// Female + approved so the (male) test account sees them per RLS.
const DEMO = [
  {
    email: "demo.ayesha@rishta.demo",
    full_name: "Ayesha Siddiqui",
    dob: "1998-03-14",
    city: "Lahore",
    sect: "Sunni",
    religiosity: "Practicing",
    profession: "Doctor",
    education: "MBBS",
    ethnicity: "Punjabi",
    height_cm: 165,
    about_me: "Family-oriented doctor who loves reading, chai, and long walks. Looking for someone kind and practicing to build a home with, in shaa Allah.",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    email: "demo.fatima@rishta.demo",
    full_name: "Fatima Noor",
    dob: "2000-07-22",
    city: "Karachi",
    sect: "Sunni",
    religiosity: "Moderate",
    profession: "Software Engineer",
    education: "BS Computer Science",
    ethnicity: "Muhajir",
    height_cm: 160,
    about_me: "Coder by day, foodie by heart. I value honesty, humour, and a partner who supports my career and my deen.",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    email: "demo.zainab@rishta.demo",
    full_name: "Zainab Malik",
    dob: "1996-11-05",
    city: "Islamabad",
    sect: "Sunni",
    religiosity: "Very practicing",
    profession: "Teacher",
    education: "M.Ed",
    ethnicity: "Kashmiri",
    height_cm: 168,
    about_me: "Primary school teacher who loves calligraphy and gardening. Seeking a God-conscious, gentle husband and a peaceful home.",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    email: "demo.maryam@rishta.demo",
    full_name: "Maryam Chaudhry",
    dob: "1999-01-30",
    city: "Faisalabad",
    sect: "Sunni",
    religiosity: "Practicing",
    profession: "Dentist",
    education: "BDS",
    ethnicity: "Punjabi",
    height_cm: 162,
    about_me: "Dentist with a soft spot for poetry and travel. Looking for a sincere, ambitious partner to grow with, both in dunya and akhirah.",
    photo: "https://randomuser.me/api/portraits/women/90.jpg",
  },
  {
    email: "demo.hafsa@rishta.demo",
    full_name: "Hafsa Khan",
    dob: "1997-09-18",
    city: "Rawalpindi",
    sect: "Sunni",
    religiosity: "Moderate",
    profession: "Architect",
    education: "B.Arch",
    ethnicity: "Pathan",
    height_cm: 170,
    about_me: "Architect who sketches, hikes, and makes the best karak chai. Hoping to meet someone respectful, driven, and family-minded.",
    photo: "https://randomuser.me/api/portraits/women/12.jpg",
  },
];

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized — sign in first" }, { status: 401 });

  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Map existing demo users so re-running is idempotent
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const byEmail = new Map((list?.users || []).map((u) => [u.email, u.id]));

  const results: { email: string; id?: string; ok: boolean; error?: string }[] = [];

  for (const p of DEMO) {
    try {
      let id = byEmail.get(p.email);
      if (!id) {
        const { data: created, error } = await admin.auth.admin.createUser({
          email: p.email,
          password: randomUUID(),
          email_confirm: true,
        });
        if (error || !created?.user) {
          results.push({ email: p.email, ok: false, error: error?.message || "createUser failed" });
          continue;
        }
        id = created.user.id;
      }

      // The handle_new_user trigger already made an empty profile row; fill it in.
      await admin.from("profiles").update({
        type: "member",
        full_name: p.full_name,
        gender: "female",
        date_of_birth: p.dob,
        city: p.city,
        country: "Pakistan",
        sect: p.sect,
        religiosity: p.religiosity,
        profession: p.profession,
        education: p.education,
        ethnicity: p.ethnicity,
        height_cm: p.height_cm,
        marital_status: "Never married",
        about_me: p.about_me,
        avatar_url: p.photo,
        is_verified: true,
        is_approved: true,
        onboarding_complete: true,
      }).eq("id", id);

      // Best-effort gallery row (won't fail the seed if the table is absent)
      try {
        await admin.from("profile_photos").delete().eq("profile_id", id);
        await admin.from("profile_photos").insert({ profile_id: id, url: p.photo, order_index: 0 });
      } catch {
        // ignore — avatar_url already covers the swipe card
      }

      results.push({ email: p.email, id, ok: true });
    } catch (e: unknown) {
      results.push({ email: p.email, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }

  const seeded = results.filter((r) => r.ok).length;
  return NextResponse.json({ seeded, total: DEMO.length, results });
}
