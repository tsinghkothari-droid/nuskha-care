import { classifyDocument } from "./classifier.mjs";
import { createDeliveryPlan } from "./delivery.mjs";
import { generateExplanationDraft } from "./explanation.mjs";
import { extractStructuredData } from "./extractor.mjs";
import { routeRisk } from "./risk-engine.mjs";
import { chooseReviewPath } from "./review-router.mjs";
import { validateMedicalFacts } from "./validator.mjs";
import { parseInboundMessage } from "../schemas/inbound.mjs";
import { getStore } from "../store/index.mjs";
import { config } from "../config.mjs";

export async function handleInboundMessage(payload, context = {}) {
  const store = getStore();
  const parsed = parseInboundMessage(payload);
  if (!parsed.ok) {
    return parsed;
  }

  const inbound = parsed.value;
  let family = await store.getOrCreateFamily(inbound);

  if (await store.hasProcessedMessage(inbound.messageId)) {
    return {
      ok: true,
      status: "duplicate_ignored",
      messageId: inbound.messageId,
      familyId: family.id
    };
  }

  if (looksLikeConsentAcceptance(inbound.text)) {
    family = await store.recordConsent(family, { messageId: inbound.messageId });
  }

  if (!family.consent) {
    const audit = await store.writeAuditEvent({
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

  await store.markMessageProcessed({
    messageId: inbound.messageId,
    familyId: family.id,
    source: context.source || inbound.source || "unknown"
  });

  const classification = classifyDocument(inbound);
  if (classification.type === "unsupported") {
    const audit = await store.writeAuditEvent({
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

  const extraction = await extractStructuredData(inbound, classification);
  const validation = validateMedicalFacts(extraction, family);
  const risk = routeRisk({ extraction, validation, familyMemory: family });
  const draft = generateExplanationDraft({ extraction, validation, risk, family });
  const initialRoute = chooseReviewPath(risk, draft.safety);
  const route = applyPilotReviewGate(initialRoute, risk);
  const delivery = await createDeliveryPlan({ route, draft, family });

  let reviewTask = null;
  if (route.queue !== "auto") {
    reviewTask = await store.createReviewTask({
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

  await store.updateFamilyMemory(family, validation, { reviewed: false });

  const audit = await store.writeAuditEvent({
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

function applyPilotReviewGate(route, risk) {
  if (!config.pilotMode || route.queue !== "auto") return route;
  return {
    queue: "pharmacist",
    reason: "pilot_manual_review",
    slaMinutes: 30,
    pilotMode: true,
    originalPath: risk.path
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
