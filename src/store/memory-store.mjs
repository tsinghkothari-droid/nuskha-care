const families = new Map();
const auditLog = [];
const reviewTasks = [];

export function getOrCreateFamily(inbound) {
  const key = inbound.phone || inbound.remoteJid || "unknown";
  if (!families.has(key)) {
    families.set(key, {
      id: `fam_${key || "unknown"}`,
      phone: key,
      language: "hi",
      childLanguage: "en",
      consent: false,
      activeMedicines: [],
      labTrends: []
    });
  }
  return families.get(key);
}

export function recordConsent(family, consent = {}) {
  family.consent = true;
  family.consentRecord = {
    acceptedAt: new Date().toISOString(),
    language: consent.language || family.language,
    templateVersion: consent.templateVersion || "consent-l1"
  };
  return family;
}

export function writeAuditEvent(event) {
  const item = {
    id: `audit_${auditLog.length + 1}`,
    at: new Date().toISOString(),
    ...event
  };
  auditLog.push(item);
  return item;
}

export function createReviewTask(task) {
  const item = {
    id: `review_${reviewTasks.length + 1}`,
    status: "open",
    createdAt: new Date().toISOString(),
    ...task
  };
  reviewTasks.push(item);
  return item;
}

export function updateFamilyMemory(family, validation, { reviewed = false } = {}) {
  if (!reviewed) return family;

  for (const medicine of validation.medicines || []) {
    if (medicine.matchStatus !== "matched") continue;
    const exists = family.activeMedicines.some((item) => item.name === medicine.normalizedName);
    if (!exists) {
      family.activeMedicines.push({
        name: medicine.normalizedName,
        salt: medicine.salt,
        class: medicine.class,
        confidence: "human_reviewed"
      });
    }
  }

  for (const lab of validation.labValues || []) {
    family.labTrends.push({
      testName: lab.test_name,
      value: lab.value,
      unit: lab.unit,
      flag: lab.flag,
      recordedAt: new Date().toISOString()
    });
  }

  return family;
}

export function getDebugState() {
  return {
    families: [...families.values()],
    auditLog,
    reviewTasks
  };
}

