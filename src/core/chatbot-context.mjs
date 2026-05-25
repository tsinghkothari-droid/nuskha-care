const SAFETY_POLICY = [
  "Explain only the facts present in the document, validated medicine data, family memory, or reviewer notes.",
  "Do not diagnose disease.",
  "Do not suggest starting, stopping, increasing, reducing, or substituting medicine.",
  "Do not say a lab value is safe or that there is nothing to worry about.",
  "If dose, duration, or food timing is unclear, say it is unclear and ask the family to confirm with the doctor.",
  "Escalate emergency symptoms, critical labs, child patients, pregnancy, and high-risk medicines to the configured human review path."
];

export function buildCareChatbotContext({
  family,
  inbound,
  classification,
  extraction,
  validation,
  risk,
  reviewTask,
  channel = "whatsapp"
} = {}) {
  return {
    product: "Nuskha Care",
    role: "safe medical document explanation assistant for a pharmacist care desk",
    channel,
    audience: {
      parentLanguage: family?.language || "hi",
      childLanguage: family?.childLanguage || "en",
      userType: "older parent in India and remote family caregiver"
    },
    familyMemory: {
      knownMedicines: sanitizeList(family?.activeMedicines),
      labTrends: sanitizeList(family?.labTrends),
      allergies: sanitizeList(family?.allergies),
      doctors: sanitizeList(family?.doctors)
    },
    inbound: {
      messageId: inbound?.messageId || null,
      hasText: Boolean(inbound?.text),
      hasMedia: Boolean(inbound?.mediaUrl || inbound?.media)
    },
    document: {
      classification: classification?.type || extraction?.doc_type || "unknown",
      doctorName: extraction?.doctor_name || null,
      patientName: extraction?.patient_name || null,
      date: extraction?.date || null,
      medicines: sanitizeList(validation?.medicines || extraction?.medicines),
      labs: sanitizeList(validation?.labValues || extraction?.lab_values),
      ocrConfidence: extraction?.overall_ocr_confidence ?? null
    },
    risk: {
      path: risk?.path || "unknown",
      ruleVersion: risk?.ruleVersion || null,
      reasons: sanitizeList(risk?.reasons)
    },
    review: {
      queue: reviewTask?.queue || null,
      status: reviewTask?.status || null,
      id: reviewTask?.id || null
    },
    safetyPolicy: SAFETY_POLICY
  };
}

export function buildCareChatbotPrompt(context) {
  return [
    "You are Nuskha Care's care-desk chatbot.",
    "You help a pharmacist or family understand a medical document safely.",
    "Use only the supplied JSON context. If a fact is missing, say it is unclear.",
    "Never diagnose, change medicine, substitute medicine, or reassure that a report is safe.",
    "For red or unclear cases, tell the operator which human review path is required.",
    "",
    "Return concise output with these sections:",
    "1. Parent voice script",
    "2. Child summary",
    "3. Pharmacist notes",
    "4. Doctor questions",
    "5. Safety escalation",
    "",
    "Context JSON:",
    JSON.stringify(context, null, 2)
  ].join("\n");
}

function sanitizeList(value) {
  return Array.isArray(value) ? value : [];
}

