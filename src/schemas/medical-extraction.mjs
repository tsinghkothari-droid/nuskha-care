import { z } from "zod";

export const medicineSchema = z.object({
  raw_text: z.string().default(""),
  name_guess: z.string().default(""),
  dose: z.string().default("unclear"),
  frequency: z.string().default("unclear"),
  duration: z.string().default("unclear"),
  food_timing: z.enum(["before", "after", "with", "unclear"]).default("unclear"),
  ocr_confidence: z.number().min(0).max(1).default(0)
});

export const labValueSchema = z.object({
  test_name: z.string().default(""),
  value: z.string().default(""),
  unit: z.string().default(""),
  reference_range: z.string().default(""),
  flag: z.enum(["high", "low", "normal", "critical"]).default("normal")
});

export const extractionSchema = z.object({
  doc_type: z.enum(["prescription", "lab_report", "medicine_label", "unsupported"]),
  doctor_name: z.string().nullable().default(null),
  patient_name: z.string().nullable().default(null),
  date: z.string().nullable().default(null),
  medicines: z.array(medicineSchema).default([]),
  lab_values: z.array(labValueSchema).default([]),
  overall_ocr_confidence: z.number().min(0).max(1).default(0),
  red_flag_terms_found: z.array(z.string()).default([])
});

export function parseExtraction(payload) {
  return extractionSchema.parse(payload);
}

