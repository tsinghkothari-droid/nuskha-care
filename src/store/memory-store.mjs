const families = new Map();
const auditLog = [];
const reviewTasks = [];
const processedMessages = new Set();
const corrections = [];
const voiceNotes = [];
const deliveries = [];

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

export function hasProcessedMessage(messageId) {
  return messageId ? processedMessages.has(messageId) : false;
}

export function markMessageProcessed({ messageId }) {
  if (messageId) processedMessages.add(messageId);
  return { messageId };
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

export function listReviewTasks({ queue, status = "open" } = {}) {
  return reviewTasks.filter((task) => {
    if (queue && task.queue !== queue) return false;
    if (status && task.status !== status) return false;
    return true;
  });
}

export function getReviewTask(id) {
  return reviewTasks.find((task) => task.id === id) || null;
}

export function updateReviewTask(id, updates = {}) {
  const task = getReviewTask(id);
  if (!task) return null;
  Object.assign(task, updates, { updatedAt: new Date().toISOString() });
  return task;
}

export function recordCorrection({ taskId, reviewerId, before, after }) {
  const item = {
    id: `correction_${corrections.length + 1}`,
    taskId,
    reviewerId: reviewerId || null,
    before,
    after,
    createdAt: new Date().toISOString()
  };
  corrections.push(item);
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
    reviewTasks,
    processedMessages: [...processedMessages],
    corrections,
    voiceNotes,
    deliveries
  };
}

export function recordVoiceNote(voice) {
  const item = {
    id: `voice_${voiceNotes.length + 1}`,
    createdAt: new Date().toISOString(),
    ...voice
  };
  voiceNotes.push(item);
  return item;
}

export function recordDelivery(delivery) {
  const item = {
    id: `delivery_${deliveries.length + 1}`,
    createdAt: new Date().toISOString(),
    ...delivery
  };
  deliveries.push(item);
  return item;
}
