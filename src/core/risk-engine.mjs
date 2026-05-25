export const RULE_VERSION = "risk-rules-l1-2026-05-25";

const redMedicineClasses = new Set(["insulin", "anticoagulant", "chemo", "opioid", "immunosuppressant"]);
const yellowMedicineClasses = new Set(["steroid", "cardiac", "antiepileptic", "antiplatelet"]);
const pregnancyTerms = ["pregnant", "pregnancy", "garbhavati", "गर्भवती"];

export function routeRisk({ extraction, validation, familyMemory = {} }) {
  const reasons = [];
  const textForRisk = JSON.stringify(extraction).toLowerCase();

  if (extraction.red_flag_terms_found.length) {
    reasons.push(reason("red", "emergency_terms", extraction.red_flag_terms_found.join(", ")));
  }

  if (pregnancyTerms.some((term) => textForRisk.includes(term))) {
    reasons.push(reason("red", "pregnancy_mentioned"));
  }

  if (familyMemory.patientAge && familyMemory.patientAge < 18) {
    reasons.push(reason("red", "minor_patient"));
  }

  for (const medicine of validation.medicines) {
    if (redMedicineClasses.has(medicine.class) || medicine.riskClass === "high") {
      reasons.push(reason("red", "high_risk_medicine", medicine.normalizedName));
    }
  }

  for (const lab of validation.labValues) {
    if (lab.flag === "critical") {
      reasons.push(reason("red", "critical_lab_value", lab.test_name));
    }
  }

  if (reasons.some((item) => item.level === "red")) {
    return decision("red", reasons);
  }

  if (extraction.overall_ocr_confidence < 0.6) {
    reasons.push(reason("yellow", "low_extraction_confidence", String(extraction.overall_ocr_confidence)));
  }

  for (const medicine of validation.medicines) {
    if (medicine.matchStatus === "unknown") {
      reasons.push(reason("yellow", "unknown_medicine", medicine.normalizedName));
    }
    if (yellowMedicineClasses.has(medicine.class) || medicine.riskClass === "medium") {
      reasons.push(reason("yellow", "medium_risk_medicine", medicine.normalizedName));
    }
    if (medicine.dose === "unclear" || medicine.frequency === "unclear") {
      reasons.push(reason("yellow", "ambiguous_dose_or_frequency", medicine.normalizedName));
    }
  }

  for (const lab of validation.labValues) {
    if (["high", "low"].includes(lab.flag)) {
      reasons.push(reason("yellow", "abnormal_lab_value", lab.test_name));
    }
  }

  if (reasons.length) {
    return decision("yellow", reasons);
  }

  return decision("green", [reason("green", "clean_low_risk_document")]);
}

function decision(path, reasons) {
  return {
    path,
    reasons,
    ruleVersion: RULE_VERSION
  };
}

function reason(level, code, detail = "") {
  return { level, code, detail };
}

