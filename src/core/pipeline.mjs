import { classifyDocument } from "./classifier.mjs";
import { createDeliveryPlan } from "./delivery.mjs";
import { generateExplanationDraft } from "./explanation.mjs";
import { extractStructuredData } from "./extractor.mjs";
import { routeRisk } from "./risk-engine.mjs";
import { chooseReviewPath } from "./review-router.mjs";
import { validateMedicalFacts } from "./validator.mjs";
import { parseInboundMessage } from "../schemas/inbound.mjs";
import {
  createReviewTask,
  getOrCreateFamily,
  recordConsent,
  updateFamilyMemory,
  writeAuditEvent
} from "../store/memory-store.mjs";

export async function handleInboundMessage(payload, context = {}) {
  const parsed = parseInboundMessage(payload);
  if (!parsed.ok) {
    return parsed;
  }

  const inbound = parsed.value;
  const family = getOrCreateFamily(inbound);

  if (looksLikeConsentAcceptance(inbound.text)) {
    recordConsent(family);
  }

  if (!family.consent) {
    const audit = writeAuditEvent({
      type: "consent_required",
      familyId: family.id,
      source: context.source || inbound.source || "unknown",
      messageId: inbound.messageId
    });

    return {
      ok: true,
      status: "consent_required",
      auditId: audit.id,
      reply: buildConsentReply(family)
    };
  }

  const classification = classifyDocument(inbound);
  if (classification.type === "unsupported") {
    const audit = writeAuditEvent({
      type: "unsupported_document",
      familyId: family.id,
      source: context.source || inbound.source || "unknown",
      messageId: inbound.messageId,
      classification
    });

    return {
      ok: true,
      status: "unsupported",
      auditId: audit.id,
      classification,
      reply: "Nuskha Care can currently explain prescriptions, lab reports, and medicine labels only."
    };
  }

  const extraction = extractStructuredData(inbound, classification);
  const validation = validateMedicalFacts(extraction, family);
  const risk = routeRisk({ extraction, validation, familyMemory: family });
  const draft = generateExplanationDraft({ extraction, validation, risk, family });
  const route = chooseReviewPath(risk, draft.safety);
  const delivery = await createDeliveryPlan({ route, draft, family });

  let reviewTask = null;
  if (route.queue !== "auto") {
    reviewTask = createReviewTask({
      queue: route.queue,
      familyId: family.id,
      messageId: inbound.messageId,
      classification,
      extraction,
      validation,
      risk,
      draft
    });
  }

  updateFamilyMemory(family, validation, { reviewed: false });

  const audit = writeAuditEvent({
    type: "case_processed",
    familyId: family.id,
    source: context.source || inbound.source || "unknown",
    messageId: inbound.messageId,
    classification,
    risk,
    route,
    reviewTaskId: reviewTask?.id || null
  });

  return {
    ok: true,
    status: delivery.status,
    auditId: audit.id,
    reviewTaskId: reviewTask?.id || null,
    classification,
    extraction,
    validation,
    risk,
    route,
    delivery
  };
}

function looksLikeConsentAcceptance(text = "") {
  const normalized = String(text || "").trim().toLowerCase();
  return ["yes", "i agree", "agree", "haan", "ha", "ok", "okay"].includes(normalized);
}

function buildConsentReply(family) {
  if ((family.language || "hi") === "hi") {
    return "Nuskha Care doctor ka replacement nahi hai. Hum paper ko simple bhaasha me samjhate hain. Dose badalne se pehle doctor se poochna zaroori hai. Agar aap sahmat hain to YES bhejein.";
  }

  return "Nuskha Care is not a doctor replacement. We explain medical papers in simple language. Ask your doctor before changing any dose. Reply YES to continue.";
}

