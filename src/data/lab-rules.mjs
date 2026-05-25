export const criticalLabTerms = new Set([
  "potassium",
  "creatinine",
  "troponin",
  "hemoglobin",
  "glucose",
  "hba1c"
]);

export function isCriticalLabValue(labValue) {
  return labValue.flag === "critical";
}

