export function generateExplanationDraft({ extraction, validation, risk, family }) {
  const parentScript = buildParentScript({ extraction, validation, risk, language: family.language || "hi" });
  const childSummary = buildChildSummary({ extraction, validation, risk });
  const safety = runDraftSafetyCheck(`${parentScript}\n${childSummary}`);

  return {
    parentScript,
    childSummary,
    safety
  };
}

function buildParentScript({ extraction, validation, risk, language }) {
  const lines = [];
  lines.push(language === "hi" ? "Namaste. Yeh doctor ke paper ki saral samajh hai." : "Hello. This is a simple explanation of the doctor's paper.");

  if (extraction.doc_type === "lab_report") {
    for (const lab of validation.labValues) {
      lines.push(`${lab.test_name} value ${lab.value || "unclear"} hai. Report me isko ${lab.flag} mark kiya gaya hai.`);
    }
  } else {
    for (const medicine of validation.medicines) {
      if (medicine.matchStatus === "unknown") {
        lines.push(`${medicine.raw_text || medicine.name_guess} clear nahi hai. Pharmacist review zaroori hai.`);
      } else {
        lines.push(`${medicine.normalizedName} ek medicine hai jo aam taur par ${medicine.commonUses?.[0] || "doctor ke likhe kaam"} ke liye use hoti hai.`);
      }
      lines.push(`Timing paper me ${medicine.frequency || "unclear"} aur food timing ${medicine.food_timing || "unclear"} dikhi hai.`);
    }
  }

  if (risk.path === "red") {
    lines.push("Is case me urgent ya high-risk sign mila hai. Agar chest pain, saans ki dikkat, behoshi, bleeding, ya severe weakness ho to turant doctor ya emergency se baat karein.");
  } else {
    lines.push("Dose badalna, medicine band karna, ya nayi medicine shuru karna doctor se pooche bina mat karein.");
  }

  lines.push("Next visit par doctor se poochhein: yeh medicine kab tak leni hai, test kab repeat karna hai, aur dose miss ho to kya karna hai.");
  return lines.join(" ");
}

function buildChildSummary({ extraction, validation, risk }) {
  const medicines = validation.medicines.map((medicine) => medicine.normalizedName).join(", ") || "none";
  const labs = validation.labValues.map((lab) => `${lab.test_name}: ${lab.value} (${lab.flag})`).join(", ") || "none";

  return [
    `Document type: ${extraction.doc_type}.`,
    `Risk path: ${risk.path}.`,
    `Reasons: ${risk.reasons.map((item) => item.code).join(", ")}.`,
    `Medicines: ${medicines}.`,
    `Labs: ${labs}.`,
    "Do not change dose or substitute medicines without the treating doctor's advice."
  ].join(" ");
}

export function runDraftSafetyCheck(text) {
  const lower = String(text || "").toLowerCase();
  const forbidden = [
    ["diagnosis_claim", "you have "],
    ["dose_change", "increase the dose"],
    ["dose_change", "reduce the dose"],
    ["stop_medicine", "stop taking"],
    ["start_medicine", "start taking"],
    ["substitution", "replace with"],
    ["false_reassurance", "nothing to worry"]
  ];

  const failures = forbidden
    .filter(([, phrase]) => lower.includes(phrase))
    .map(([code]) => code);

  return {
    passed: failures.length === 0,
    failures
  };
}

