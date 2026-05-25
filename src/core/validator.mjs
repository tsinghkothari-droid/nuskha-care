import { drugReference } from "../data/drug-reference.mjs";

export function validateMedicalFacts(extraction, familyMemory = {}) {
  const medicines = extraction.medicines.map((medicine) => validateMedicine(medicine, familyMemory));
  const labValues = extraction.lab_values.map((lab) => ({
    ...lab,
    isCritical: lab.flag === "critical",
    isAbnormal: ["high", "low", "critical"].includes(lab.flag)
  }));

  return {
    medicines,
    labValues,
    unknownMedicines: medicines.filter((medicine) => medicine.matchStatus === "unknown"),
    highRiskMedicines: medicines.filter((medicine) => medicine.riskClass === "high"),
    mediumRiskMedicines: medicines.filter((medicine) => medicine.riskClass === "medium")
  };
}

function validateMedicine(medicine, familyMemory) {
  const name = String(medicine.name_guess || "").toLowerCase().trim();
  const match = drugReference.find((entry) => name.includes(entry.brand) || entry.brand.includes(name));
  const familyKnown = familyMemory.activeMedicines?.some((item) => item.name === name) || false;

  if (!match) {
    return {
      ...medicine,
      normalizedName: medicine.name_guess || medicine.raw_text,
      matchStatus: "unknown",
      matchScore: 0,
      riskClass: "unknown",
      familyKnown
    };
  }

  return {
    ...medicine,
    normalizedName: match.brand,
    salt: match.salt,
    class: match.class,
    commonUses: match.commonUses,
    riskClass: match.riskClass,
    matchStatus: "matched",
    matchScore: 0.95,
    familyKnown
  };
}

