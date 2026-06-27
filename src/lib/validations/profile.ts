import { z } from "zod";

export const basicInfoSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

export const genderDobSchema = z.object({
  gender: z.enum(["male", "female"]),
  date_of_birth: z.string().min(1, "Date of birth is required"),
});

export const locationSchema = z.object({
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
});

export const religiousSchema = z.object({
  sect: z.string().optional(),
  religiosity: z.string().optional(),
  ethnicity: z.string().optional(),
  language: z.string().optional(),
  caste: z.string().optional(),
});

export const educationCareerSchema = z.object({
  education: z.string().optional(),
  profession: z.string().optional(),
  marital_status: z.string().optional(),
  height_cm: z.number().optional(),
});

export const aboutMeSchema = z.object({
  about_me: z.string().max(1000, "About me must be under 1000 characters").optional(),
});

export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type GenderDobData = z.infer<typeof genderDobSchema>;
export type LocationData = z.infer<typeof locationSchema>;
export type ReligiousData = z.infer<typeof religiousSchema>;
export type EducationCareerData = z.infer<typeof educationCareerSchema>;
export type AboutMeData = z.infer<typeof aboutMeSchema>;
