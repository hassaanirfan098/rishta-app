import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Public proposal intake — no auth required, mirrors the standalone bureau
// tool's fields. New submissions land inactive (is_active: false) so an
// admin reviews and approves them (Show) before they appear in Browse.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    photo, // data URL, optional
    full_name, gender, age, heightFeet, heightInches, marital_status, disability, phone,
    qualification, institution, profession, work_location, future_plans, income,
    religion, caste, sect, nationality,
    property_ownership, property_size, vehicle, property_additional,
    city, locality,
    father_occupation, mother_occupation, siblings,
    pref_age_min, pref_age_max, pref_height_min, pref_city, pref_caste, pref_sect,
    pref_qualification, pref_habits, pref_divorced_widowed, pref_working_woman, pref_other,
    consent,
  } = body;

  if (!full_name || !gender || !phone) {
    return NextResponse.json({ error: "Name, gender, and contact number are required." }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: "Please confirm consent to submit your proposal." }, { status: 400 });
  }

  let avatar_url: string | null = null;
  if (photo && typeof photo === "string" && photo.startsWith("data:image")) {
    try {
      const [, meta, base64] = photo.match(/^data:(image\/\w+);base64,(.+)$/) || [];
      if (base64) {
        const ext = meta?.split("/")[1] || "jpg";
        const buffer = Buffer.from(base64, "base64");
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await admin.storage
          .from("directory-photos")
          .upload(path, buffer, { contentType: meta || "image/jpeg" });
        if (!uploadErr) {
          const { data } = admin.storage.from("directory-photos").getPublicUrl(path);
          avatar_url = data.publicUrl;
        }
      }
    } catch {
      // photo upload is best-effort; submission still proceeds without it
    }
  }

  const heightDisplay = heightFeet ? `${heightFeet}'${heightInches || 0}"` : null;

  const { data: refCode } = await admin.rpc("bureau_next_catalog_id", { g: gender });

  const { error } = await admin.from("directory_profiles").insert({
    full_name,
    gender,
    age: age ? Number(age) : null,
    height_display: heightDisplay,
    marital_status: marital_status || "single",
    disability: disability || "No",
    phone,
    education: qualification || null,
    institution: institution || null,
    profession: profession || null,
    work_location: work_location || null,
    future_plans: future_plans || null,
    income: income || null,
    religion: religion || "Islam",
    caste: caste || null,
    sect: sect || null,
    nationality: nationality || "Pakistani",
    property_ownership: property_ownership || null,
    property_size: property_size || null,
    vehicle: vehicle || null,
    property_additional: property_additional || null,
    city: city || null,
    locality: locality || null,
    father_occupation: father_occupation || null,
    mother_occupation: mother_occupation || null,
    siblings: Array.isArray(siblings) ? siblings : [],
    pref_age_min: pref_age_min ? Number(pref_age_min) : null,
    pref_age_max: pref_age_max ? Number(pref_age_max) : null,
    pref_height_min: pref_height_min || null,
    pref_city: pref_city || null,
    pref_caste: pref_caste || null,
    pref_sect: pref_sect || null,
    pref_qualification: pref_qualification || null,
    pref_habits: pref_habits || null,
    pref_divorced_widowed: pref_divorced_widowed || null,
    pref_working_woman: pref_working_woman || null,
    pref_other: pref_other || null,
    avatar_url,
    reference_code: refCode || null,
    consent_captured: true,
    is_active: false, // pending admin approval
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, reference_code: refCode });
}
