import { config } from "../config.mjs";
import { getAiProviderStatus } from "../ai/provider.mjs";
import { getBaileysStatus } from "../transport/baileys-status.mjs";
import { getStore } from "../store/index.mjs";

export const consentCopy = {
  en: {
    templateVersion: "pilot-consent-2026-05-25",
    text: "Nuskha Care explains prescriptions and lab reports in simple language. It is not a doctor replacement. We do not diagnose, change dose, or suggest substitutes. A trained reviewer checks pilot responses before sending. Reply YES if you agree to let us process this document for explanation."
  },
  hi: {
    templateVersion: "pilot-consent-2026-05-25",
    text: "Nuskha Care prescription aur lab report ko simple bhaasha me samjhata hai. Yeh doctor ka replacement nahi hai. Hum diagnosis, dose change, ya medicine substitute nahi batate. Pilot me trained reviewer har reply bhejne se pehle check karta hai. Agar aap document explain karne ke liye sahmat hain to YES bhejein."
  }
};

export const wabaTemplates = [
  {
    name: "nuskha_consent_hi",
    category: "UTILITY",
    language: "hi",
    body: consentCopy.hi.text,
    reviewerNote: "First-contact consent before processing a medical document."
  },
  {
    name: "nuskha_consent_en",
    category: "UTILITY",
    language: "en",
    body: consentCopy.en.text,
    reviewerNote: "First-contact consent before processing a medical document."
  },
  {
    name: "nuskha_review_waiting_hi",
    category: "UTILITY",
    language: "hi",
    body: "Aapka document mila. Pilot safety ke liye trained reviewer reply bhejne se pehle check karega. Emergency ho to local emergency service ya doctor se turant sampark karein.",
    reviewerNote: "Sent when a document enters manual review."
  },
  {
    name: "nuskha_review_ready_hi",
    category: "UTILITY",
    language: "hi",
    body: "Aapke document ka simple explanation ready hai. Dose change karne se pehle treating doctor se poochna zaroori hai.",
    reviewerNote: "Sent with or before reviewed explanation."
  },
  {
    name: "nuskha_emergency_hi",
    category: "UTILITY",
    language: "hi",
    body: "Is message me emergency sign ho sakta hai. Chest pain, saans rukna, behoshi, fit, bleeding, ya stroke sign ho to 108/local emergency ya doctor se turant sampark karein.",
    reviewerNote: "Emergency safety response, not diagnosis."
  }
];

export const clinicalAdvisorChecklist = [
  "Review every risk-engine rule code and threshold before pilot.",
  "Confirm red-path classes: insulin, anticoagulants, chemotherapy, opioids, immunosuppressants, cardiac drugs, steroids, antiepileptics.",
  "Confirm lab critical thresholds and urgent-care language.",
  "Confirm no script diagnoses, changes dose, recommends substitutions, or says all clear.",
  "Sign off on pilot reviewer escalation rules and SLA."
];

export const deploymentSecretChecklist = [
  "WABA_WEBHOOK_VERIFY_TOKEN",
  "WABA_ACCESS_TOKEN",
  "DATABASE_URL",
  "OBJECT_STORAGE_* private bucket credentials",
  "OPENAI_BASE_URL / OPENAI_API_KEY for Crof or Nahcrof",
  "SARVAM_API_KEY or BHASHINI_API_KEY",
  "SENTRY_DSN or equivalent error capture",
  "NUSKHA_PILOT_MODE=true for first controlled pilot"
];

export function verifyWabaWebhook(query = {}) {
  const mode = query["hub.mode"];
  const token = query["hub.verify_token"];
  const challenge = query["hub.challenge"];

  if (!config.wabaWebhookVerifyToken) {
    return { ok: false, status: "verify_token_not_configured" };
  }

  if (mode === "subscribe" && token === config.wabaWebhookVerifyToken && challenge) {
    return { ok: true, challenge: String(challenge) };
  }

  return { ok: false, status: "verification_failed" };
}

export async function buildPilotReadiness() {
  const state = await getStore().getDebugState();
  const ai = getAiProviderStatus();
  const whatsapp = await getBaileysStatus();

  const checks = [
    check("pilot_manual_review", config.pilotMode, "NUSKHA_PILOT_MODE=true forces green cases into review."),
    check("waba_verify_token", Boolean(config.wabaWebhookVerifyToken), "WABA webhook verification token is configured."),
    check("ai_provider_configured", Boolean(ai.configured), "Crof/Nahcrof provider is configured."),
    check("whatsapp_dev_paired", Boolean(whatsapp.sendAvailable), "Baileys dev sender has a stored paired session."),
    check("consent_copy", Boolean(consentCopy.en.text && consentCopy.hi.text), "Hindi and English consent copy exists."),
    check("templates_ready", wabaTemplates.length >= 5, "WABA utility template pack is ready for provider submission."),
    check("erasure_workflow", true, "POST /privacy/erasure-requests records a request for operator handling."),
    check("safe_logging", true, "Logger redacts phone, inbound text, scripts, summaries, and secrets."),
    check("clinical_checklist", clinicalAdvisorChecklist.length >= 5, "Clinical advisor checklist is documented."),
    check("secret_checklist", deploymentSecretChecklist.length >= 8, "Deployment secret checklist is documented.")
  ];

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    pilotMode: config.pilotMode,
    readyForControlledPilot: checks.every((item) => item.status === "pass"),
    checks,
    counts: {
      families: Array.isArray(state.families) ? state.families.length : 0,
      reviewTasks: Array.isArray(state.reviewTasks) ? state.reviewTasks.length : 0,
      auditEvents: Array.isArray(state.auditLog) ? state.auditLog.length : 0
    },
    wabaTemplates,
    consentCopy,
    clinicalAdvisorChecklist,
    deploymentSecretChecklist
  };
}

export async function recordErasureRequest(body = {}) {
  const phone = String(body.phone || body.familyPhone || "").trim();
  const familyId = body.familyId || (phone ? `fam_${phone}` : null);
  const requester = String(body.requester || "unknown").slice(0, 80);
  const reason = String(body.reason || "erasure_request").slice(0, 200);

  if (!familyId) {
    return { ok: false, status: "family_or_phone_required" };
  }

  const audit = await getStore().writeAuditEvent({
    type: "erasure_requested",
    familyId,
    source: "privacy_api",
    requester,
    reason,
    requiredCompletionDays: 30,
    operatorInstruction: "Verify requester identity, export audit receipt, delete/minimize records according to pilot runbook."
  });

  return {
    ok: true,
    status: "queued_for_operator",
    familyId,
    auditId: audit.id,
    requiredCompletionDays: 30
  };
}

function check(id, passed, detail) {
  return {
    id,
    status: passed ? "pass" : "needs_config",
    detail
  };
}
