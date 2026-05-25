const prescriptionWords = ["rx", "tab", "tablet", "cap", "capsule", "syp", "injection", "after food", "before food"];
const labWords = ["hba1c", "creatinine", "cholesterol", "hemoglobin", "reference range", "fasting", "lipid", "thyroid"];
const emergencyWords = ["chest pain", "breathless", "bleeding", "unconscious", "fainted", "stroke", "seizure", "fit"];

export function classifyDocument(inbound) {
  const text = `${inbound.text || ""} ${inbound.media?.caption || ""} ${inbound.media?.fileName || ""}`.toLowerCase();

  if (!inbound.media && !text) {
    return { type: "unsupported", confidence: 0, reason: "empty_message" };
  }

  if (hasAny(text, labWords)) {
    return { type: "lab_report", confidence: 0.72, reason: "lab_terms_found" };
  }

  if (hasAny(text, prescriptionWords)) {
    return { type: "prescription", confidence: 0.68, reason: "prescription_terms_found" };
  }

  if (inbound.media?.type === "image") {
    return { type: "prescription", confidence: 0.45, reason: "image_needs_vision_confirmation" };
  }

  return { type: "unsupported", confidence: 0.2, reason: "no_supported_signal" };
}

export function findEmergencyTerms(text = "") {
  const lower = String(text || "").toLowerCase();
  return emergencyWords.filter((term) => lower.includes(term));
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

