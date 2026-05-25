import { findEmergencyTerms } from "./classifier.mjs";
import { parseExtraction } from "../schemas/medical-extraction.mjs";

export function extractStructuredData(inbound, classification) {
  const text = `${inbound.text || ""} ${inbound.media?.caption || ""}`.trim();
  const medicines = extractMedicineHints(text);
  const labValues = extractLabHints(text);
  const redFlagTerms = findEmergencyTerms(text);

  const extraction = {
    doc_type: classification.type,
    doctor_name: null,
    patient_name: null,
    date: null,
    medicines: classification.type === "lab_report" ? [] : medicines,
    lab_values: classification.type === "lab_report" ? labValues : [],
    overall_ocr_confidence: confidenceFrom(classification, medicines, labValues),
    red_flag_terms_found: redFlagTerms
  };

  return parseExtraction(extraction);
}

function extractMedicineHints(text) {
  const lower = text.toLowerCase();
  const known = ["metformin", "telmisartan", "thyronorm", "ecosprin", "warfarin", "insulin", "prednisolone"];
  const found = known.filter((name) => lower.includes(name));

  return found.map((name) => ({
    raw_text: name,
    name_guess: name,
    dose: findDoseNear(text, name),
    frequency: findFrequency(text),
    duration: "unclear",
    food_timing: findFoodTiming(text),
    ocr_confidence: 0.82
  }));
}

function extractLabHints(text) {
  const labs = [];
  const lower = text.toLowerCase();

  if (lower.includes("hba1c")) {
    labs.push({
      test_name: "HbA1c",
      value: matchValue(text, /hba1c[:\s-]*(\d+(?:\.\d+)?)/i),
      unit: "%",
      reference_range: "source-not-verified",
      flag: lower.includes("critical") ? "critical" : "high"
    });
  }

  if (lower.includes("creatinine")) {
    labs.push({
      test_name: "Creatinine",
      value: matchValue(text, /creatinine[:\s-]*(\d+(?:\.\d+)?)/i),
      unit: "mg/dL",
      reference_range: "source-not-verified",
      flag: lower.includes("critical") ? "critical" : "high"
    });
  }

  return labs;
}

function findDoseNear(text, name) {
  const pattern = new RegExp(`${name}[^\\d]*(\\d+\\s?(?:mg|mcg|units|iu))`, "i");
  return text.match(pattern)?.[1] || "unclear";
}

function findFrequency(text) {
  const lower = text.toLowerCase();
  if (lower.includes("twice")) return "twice daily";
  if (lower.includes("once")) return "once daily";
  if (lower.includes("bd")) return "twice daily";
  if (lower.includes("od")) return "once daily";
  return "unclear";
}

function findFoodTiming(text) {
  const lower = text.toLowerCase();
  if (lower.includes("before food")) return "before";
  if (lower.includes("after food")) return "after";
  if (lower.includes("with food")) return "with";
  return "unclear";
}

function matchValue(text, regex) {
  return text.match(regex)?.[1] || "unclear";
}

function confidenceFrom(classification, medicines, labValues) {
  if (classification.confidence < 0.5) return classification.confidence;
  if (medicines.length || labValues.length) return 0.78;
  return 0.52;
}

