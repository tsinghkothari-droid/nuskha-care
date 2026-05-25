import { getStore } from "../store/index.mjs";

const STOCK_CATALOG = [
  { medicine: "Metformin", category: "diabetes", stockOnHand: 42, reorderBelow: 24, nextExpiryDays: 118, mrp: 58 },
  { medicine: "Telmisartan", category: "blood pressure", stockOnHand: 19, reorderBelow: 20, nextExpiryDays: 74, mrp: 142 },
  { medicine: "Thyronorm", category: "thyroid", stockOnHand: 55, reorderBelow: 18, nextExpiryDays: 212, mrp: 126 },
  { medicine: "Insulin", category: "diabetes", stockOnHand: 7, reorderBelow: 10, nextExpiryDays: 36, mrp: 520 },
  { medicine: "Ecosprin", category: "cardiac", stockOnHand: 28, reorderBelow: 18, nextExpiryDays: 96, mrp: 38 }
];

const STAFF = [
  { id: "staff_asha", name: "Asha P.", role: "Pharmacist", queue: "pharmacist" },
  { id: "staff_rahul", name: "Rahul K.", role: "Care operator", queue: "whatsapp" },
  { id: "staff_dr_mehta", name: "Dr. Mehta", role: "Doctor reviewer", queue: "doctor" }
];

export async function buildPharmacyOpsSummary() {
  const rawState = await getStore().getDebugState();
  const state = normalizeState(rawState);
  const now = Date.now();

  const reviewTasks = state.reviewTasks;
  const families = state.families;
  const refillTasks = buildRefillTasks(reviewTasks, families, now);
  const orders = buildOrders(refillTasks);
  const inboxThreads = buildInboxThreads(reviewTasks, state.deliveries, families);
  const portalSummaries = buildPortalSummaries(families, refillTasks, state.voiceNotes, state.deliveries);
  const inventory = buildInventory(refillTasks);
  const medSync = buildMedicationSync(families, refillTasks);
  const campaigns = buildCampaigns(families, refillTasks);
  const adherence = buildAdherence(families, refillTasks, state.voiceNotes);
  const staffWorkflow = buildStaffWorkflow(reviewTasks, inboxThreads);
  const consentCenter = buildConsentCenter(families);
  const fulfillment = buildFulfillment(orders, state.deliveries);
  const metrics = buildMetrics({
    families,
    reviewTasks,
    refillTasks,
    orders,
    inboxThreads,
    adherence,
    staffWorkflow,
    consentCenter,
    fulfillment
  });

  return {
    ok: true,
    generatedAt: new Date(now).toISOString(),
    productPosition: "safe prescription explanation + refill recovery + WhatsApp family CRM",
    modules: buildModuleCoverage({
      refillTasks,
      inboxThreads,
      portalSummaries,
      orders,
      inventory,
      medSync,
      campaigns,
      adherence,
      staffWorkflow,
      consentCenter,
      fulfillment
    }),
    metrics,
    refillRecovery: {
      summary: `${refillTasks.length} refill candidate(s) inferred from reviewed medicines and open cases.`,
      tasks: refillTasks
    },
    whatsappInbox: {
      summary: `${inboxThreads.length} two-way WhatsApp thread(s) from cases and delivery records.`,
      threads: inboxThreads
    },
    patientFamilyPortal: {
      summary: `${portalSummaries.length} family portal profile(s) available for caregiver sharing.`,
      families: portalSummaries
    },
    paymentOrders: {
      summary: `${orders.length} draft order(s) waiting for confirmation or payment.`,
      orders
    },
    inventoryHooks: {
      summary: `${inventory.filter((item) => item.action !== "ok").length} inventory or expiry alert(s).`,
      items: inventory
    },
    medicationSynchronization: {
      summary: `${medSync.length} family med-sync schedule(s).`,
      schedules: medSync
    },
    campaignsSegmentation: {
      summary: `${campaigns.length} consent-guarded campaign segment(s).`,
      campaigns
    },
    adherenceTracking: {
      summary: `${adherence.length} adherence account(s) estimated from refill and voice-note signals.`,
      accounts: adherence
    },
    staffWorkflow,
    consentOptOut: consentCenter,
    pickupDelivery: fulfillment
  };
}

function normalizeState(state = {}) {
  return {
    families: Array.isArray(state.families) ? state.families : [],
    reviewTasks: Array.isArray(state.reviewTasks) ? state.reviewTasks : [],
    auditLog: Array.isArray(state.auditLog) ? state.auditLog : [],
    corrections: Array.isArray(state.corrections) ? state.corrections : [],
    voiceNotes: Array.isArray(state.voiceNotes) ? state.voiceNotes : [],
    deliveries: Array.isArray(state.deliveries) ? state.deliveries : [],
    processedMessages: Array.isArray(state.processedMessages) ? state.processedMessages : []
  };
}

function buildRefillTasks(reviewTasks, families, now) {
  const knownFamilies = new Map(families.map((family) => [family.id, family]));
  const rows = [];

  for (const [taskIndex, task] of reviewTasks.entries()) {
    const family = knownFamilies.get(task.familyId) || { id: task.familyId, phone: phoneFromFamilyId(task.familyId), language: "hi" };
    const medicines = matchedMedicines(task);

    for (const [medicineIndex, medicine] of medicines.entries()) {
      const risk = task.risk?.path || "yellow";
      const dueInDays = risk === "red" ? 0 : 3 + ((taskIndex + medicineIndex) % 5) * 3;
      const amount = priceForMedicine(medicine.normalizedName || medicine.raw_text) * (risk === "red" ? 1 : 2);
      rows.push({
        id: `refill_${task.id}_${medicineIndex + 1}`,
        familyId: family.id,
        familyPhone: family.phone || phoneFromFamilyId(family.id),
        familyLabel: familyLabel(family.id),
        medicine: medicine.normalizedName || medicine.raw_text || "Unknown medicine",
        salt: medicine.salt || null,
        medicineClass: medicine.class || "general",
        dueInDays,
        nextTouchAt: new Date(now + dueInDays * 86400000).toISOString(),
        estimatedValue: amount,
        risk,
        status: risk === "red" ? "hold_for_doctor" : dueInDays <= 3 ? "recover_now" : "scheduled",
        sourceReviewTaskId: task.id,
        nextAction: risk === "red" ? "Do not sell or counsel until doctor path clears" : "Send WhatsApp refill confirmation"
      });
    }
  }

  return rows.sort((a, b) => a.dueInDays - b.dueInDays);
}

function buildOrders(refillTasks) {
  return refillTasks.map((task, index) => ({
    id: `order_${task.id}`,
    familyId: task.familyId,
    familyLabel: task.familyLabel,
    medicine: task.medicine,
    amount: task.estimatedValue,
    paymentStatus: task.risk === "red" ? "blocked" : index % 3 === 0 ? "payment_link_ready" : "draft",
    orderStatus: task.risk === "red" ? "clinical_hold" : index % 2 === 0 ? "awaiting_family_confirmation" : "awaiting_payment",
    channel: "WhatsApp",
    nextAction: task.risk === "red" ? "Wait for clinician clearance" : "Confirm quantity and send payment link"
  }));
}

function buildInboxThreads(reviewTasks, deliveries, families) {
  const familyMap = new Map(families.map((family) => [family.id, family]));
  const taskThreads = reviewTasks.map((task) => ({
    id: `thread_${task.id}`,
    familyId: task.familyId,
    familyLabel: familyLabel(task.familyId),
    phone: familyMap.get(task.familyId)?.phone || phoneFromFamilyId(task.familyId),
    channel: "WhatsApp",
    lastMessage: task.draft?.childSummary || task.draft?.parentScript || "Incoming medical document needs review.",
    status: task.queue === "doctor" ? "doctor_waiting" : task.status || "open",
    assignedTo: task.queue === "doctor" ? "Dr. Mehta" : "Asha P.",
    sla: task.risk?.path === "red" ? "2h" : "30m",
    sourceReviewTaskId: task.id
  }));

  const deliveryThreads = deliveries.map((delivery) => ({
    id: `thread_${delivery.id}`,
    familyId: delivery.familyId,
    familyLabel: familyLabel(delivery.familyId),
    phone: phoneFromFamilyId(delivery.familyId),
    channel: delivery.provider || "WhatsApp",
    lastMessage: delivery.status === "sent" ? "Voice/text update sent to family." : delivery.failureReason || "Delivery pending.",
    status: delivery.status || "delivery_pending",
    assignedTo: "Rahul K.",
    sla: "same day",
    sourceReviewTaskId: delivery.reviewTaskId || null
  }));

  return [...taskThreads, ...deliveryThreads].slice(0, 20);
}

function buildPortalSummaries(families, refillTasks, voiceNotes, deliveries) {
  const refillsByFamily = groupBy(refillTasks, "familyId");
  const voicesByFamily = groupBy(voiceNotes, "familyId");
  const deliveriesByFamily = groupBy(deliveries, "familyId");

  return families.map((family) => ({
    familyId: family.id,
    phone: family.phone || phoneFromFamilyId(family.id),
    language: family.language || "hi",
    childLanguage: family.childLanguage || "en",
    consent: Boolean(family.consent),
    activeMedicines: (family.activeMedicines || []).map((medicine) => medicine.name || medicine.normalizedName || medicine).slice(0, 8),
    labTrendCount: (family.labTrends || []).length,
    openRefills: (refillsByFamily.get(family.id) || []).length,
    voiceNotes: (voicesByFamily.get(family.id) || []).length,
    deliveries: (deliveriesByFamily.get(family.id) || []).length,
    portalStatus: family.consent ? "shareable_family_view_ready" : "consent_required"
  }));
}

function buildInventory(refillTasks) {
  const demand = new Map();
  for (const refill of refillTasks) {
    const key = catalogKey(refill.medicine);
    demand.set(key, (demand.get(key) || 0) + 1);
  }

  return STOCK_CATALOG.map((item) => {
    const demandCount = demand.get(catalogKey(item.medicine)) || 0;
    const projectedStock = item.stockOnHand - demandCount;
    const action = item.nextExpiryDays <= 45 ? "expiry_watch" : projectedStock <= item.reorderBelow ? "reorder" : "ok";
    return {
      ...item,
      demandCount,
      projectedStock,
      action,
      nextAction: action === "expiry_watch" ? "Move old batch first" : action === "reorder" ? "Create distributor PO" : "No action"
    };
  });
}

function buildMedicationSync(families, refillTasks) {
  const refillsByFamily = groupBy(refillTasks, "familyId");
  return families.map((family, index) => {
    const medicineCount = Math.max((family.activeMedicines || []).length, (refillsByFamily.get(family.id) || []).length);
    return {
      familyId: family.id,
      familyLabel: familyLabel(family.id),
      medicineCount,
      syncDate: new Date(Date.now() + (7 + index * 2) * 86400000).toISOString().slice(0, 10),
      status: medicineCount > 1 ? "sync_candidate" : "monitor",
      nextAction: medicineCount > 1 ? "Align refill dates into one monthly pack" : "Wait for second recurring medicine"
    };
  });
}

function buildCampaigns(families, refillTasks) {
  const diabetes = refillTasks.filter((item) => /diabetes|metformin|insulin/i.test(`${item.medicine} ${item.medicineClass}`));
  const bp = refillTasks.filter((item) => /cardiac|blood|telmisartan|ecosprin/i.test(`${item.medicine} ${item.medicineClass}`));
  const thyroid = refillTasks.filter((item) => /thyroid|thyronorm/i.test(`${item.medicine} ${item.medicineClass}`));

  return [
    campaign("diabetes_refill", "Diabetes refill recovery", diabetes, families),
    campaign("bp_adherence", "BP and cardiac adherence check", bp, families),
    campaign("thyroid_monthly", "Thyroid monthly refill reminder", thyroid, families),
    campaign("lab_followup", "Overdue lab follow-up", families.filter((family) => (family.labTrends || []).length > 0), families)
  ];
}

function buildAdherence(families, refillTasks, voiceNotes) {
  const refillsByFamily = groupBy(refillTasks, "familyId");
  const voicesByFamily = groupBy(voiceNotes, "familyId");
  return families.map((family) => {
    const refills = refillsByFamily.get(family.id) || [];
    const voiceCount = (voicesByFamily.get(family.id) || []).length;
    const score = Math.max(42, Math.min(96, 72 + voiceCount * 4 - refills.filter((item) => item.dueInDays <= 3).length * 8));
    return {
      familyId: family.id,
      familyLabel: familyLabel(family.id),
      adherenceScore: score,
      missedSignalCount: refills.filter((item) => item.dueInDays <= 3).length,
      lastVoiceNoteCount: voiceCount,
      status: score < 65 ? "needs_call" : score < 80 ? "watch" : "stable",
      nextAction: score < 65 ? "Call child and parent" : "Send WhatsApp check-in"
    };
  });
}

function buildStaffWorkflow(reviewTasks, inboxThreads) {
  const red = reviewTasks.filter((task) => task.risk?.path === "red").length;
  const yellow = reviewTasks.filter((task) => task.risk?.path === "yellow").length;
  const open = reviewTasks.filter((task) => ["open", "edited", "escalated"].includes(task.status)).length;
  const assignments = STAFF.map((staff) => {
    const queueCount = staff.queue === "doctor"
      ? red
      : staff.queue === "whatsapp"
        ? inboxThreads.length
        : yellow;
    return {
      ...staff,
      openCount: queueCount,
      slaBreached: staff.queue === "doctor" ? Math.max(0, red - 1) : 0,
      nextAction: queueCount ? "Work oldest SLA first" : "Available"
    };
  });

  return {
    summary: `${open} open care workflow item(s) assigned across pharmacist, doctor, and WhatsApp operator.`,
    openCount: open,
    slaBreached: assignments.reduce((sum, item) => sum + item.slaBreached, 0),
    assignments
  };
}

function buildConsentCenter(families) {
  const records = families.map((family) => ({
    familyId: family.id,
    familyLabel: familyLabel(family.id),
    consentStatus: family.consent ? "active" : "needed",
    optOutStatus: "not_requested",
    language: family.language || "hi",
    nextAction: family.consent ? "Respect care-only messaging" : "Send DPDP consent prompt before processing"
  }));

  return {
    summary: `${records.filter((item) => item.consentStatus === "active").length}/${records.length} family consent record(s) active.`,
    records
  };
}

function buildFulfillment(orders, deliveries) {
  const deliveriesByTask = new Map(deliveries.map((delivery) => [delivery.reviewTaskId, delivery]));
  const jobs = orders.map((order, index) => {
    const taskId = order.id.replace(/^order_refill_/, "").replace(/_\d+$/, "");
    const delivery = deliveriesByTask.get(taskId);
    return {
      id: `fulfillment_${order.id}`,
      orderId: order.id,
      familyId: order.familyId,
      medicine: order.medicine,
      mode: index % 2 === 0 ? "pickup" : "delivery",
      status: delivery?.status || (order.paymentStatus === "blocked" ? "blocked" : "not_started"),
      eta: order.paymentStatus === "blocked" ? null : new Date(Date.now() + (index + 1) * 3600000).toISOString(),
      nextAction: delivery?.status === "sent" ? "Wait for family acknowledgement" : order.paymentStatus === "blocked" ? "Clinical hold" : "Prepare after payment"
    };
  });

  return {
    summary: `${jobs.length} pickup/delivery job(s) connected to refill orders.`,
    jobs
  };
}

function buildModuleCoverage(parts) {
  return [
    coverage("refill_recovery", "Refill recovery engine", parts.refillTasks.length, "Live from review medicines"),
    coverage("whatsapp_inbox", "Two-way WhatsApp inbox", parts.inboxThreads.length, "Live case/delivery threads"),
    coverage("family_portal", "Patient/family portal", parts.portalSummaries.length, "Caregiver profile summaries"),
    coverage("payment_orders", "Payment/order completion", parts.orders.length, "Draft order states"),
    coverage("inventory_expiry", "Billing/inventory/expiry hooks", parts.inventory.filter((item) => item.action !== "ok").length, "Stock alerts"),
    coverage("med_sync", "Medication synchronization", parts.medSync.filter((item) => item.status === "sync_candidate").length, "Monthly pack candidates"),
    coverage("clinical_scheduling", "Clinical services scheduling", parts.staffWorkflow.assignments.find((item) => item.queue === "doctor")?.openCount || 0, "Doctor review queue"),
    coverage("campaigns", "Campaigns and segmentation", parts.campaigns.length, "Consent-guarded segments"),
    coverage("adherence", "Adherence tracking", parts.adherence.filter((item) => item.status !== "stable").length, "Risk accounts"),
    coverage("staff_sla", "Staff workflow and SLA", parts.staffWorkflow.openCount, "Assignment board"),
    coverage("consent", "Consent/opt-out center", parts.consentCenter.records.length, "DPDP guard"),
    coverage("fulfillment", "Pickup/delivery tracking", parts.fulfillment.jobs.length, "Order fulfillment jobs")
  ];
}

function buildMetrics({ families, reviewTasks, refillTasks, orders, inboxThreads, adherence, staffWorkflow, consentCenter, fulfillment }) {
  return {
    families: families.length,
    pendingReviews: reviewTasks.filter((task) => ["open", "edited", "escalated"].includes(task.status)).length,
    refillValueAtRisk: refillTasks.reduce((sum, item) => sum + item.estimatedValue, 0),
    refillCandidates: refillTasks.length,
    draftOrders: orders.length,
    inboxThreads: inboxThreads.length,
    lowAdherenceAccounts: adherence.filter((item) => item.status !== "stable").length,
    slaBreached: staffWorkflow.slaBreached,
    consentActive: consentCenter.records.filter((item) => item.consentStatus === "active").length,
    fulfillmentJobs: fulfillment.jobs.length
  };
}

function coverage(id, label, count, basis) {
  return {
    id,
    label,
    status: count > 0 ? "live_l1" : "ready_empty",
    count,
    basis,
    nextAction: count > 0 ? "Operate from CRM" : "Will populate as cases arrive"
  };
}

function campaign(id, name, audience, families) {
  const familyIds = new Set(audience.map((item) => item.familyId || item.id).filter(Boolean));
  const activeConsent = families.filter((family) => familyIds.has(family.id) && family.consent).length;
  return {
    id,
    name,
    audienceCount: familyIds.size,
    consentReadyCount: activeConsent,
    consentGuard: "send only to active consent and care-context families",
    nextAction: activeConsent ? "Draft utility WhatsApp reminder" : "Collect consent first"
  };
}

function matchedMedicines(task) {
  const medicines = task.validation?.medicines || [];
  return medicines
    .filter((medicine) => medicine.matchStatus === "matched" || medicine.normalizedName)
    .map((medicine) => ({
      raw_text: medicine.raw_text || medicine.name_guess || medicine.normalizedName,
      normalizedName: medicine.normalizedName || medicine.name_guess || medicine.raw_text,
      salt: medicine.salt || null,
      class: medicine.class || null,
      matchStatus: medicine.matchStatus || "matched"
    }));
}

function priceForMedicine(name = "") {
  const item = STOCK_CATALOG.find((stock) => catalogKey(name).includes(catalogKey(stock.medicine)) || catalogKey(stock.medicine).includes(catalogKey(name)));
  return item?.mrp || 180;
}

function catalogKey(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function groupBy(items, key) {
  const grouped = new Map();
  for (const item of items) {
    const value = item?.[key];
    if (!value) continue;
    if (!grouped.has(value)) grouped.set(value, []);
    grouped.get(value).push(item);
  }
  return grouped;
}

function phoneFromFamilyId(familyId = "") {
  return String(familyId).replace(/^fam_/, "");
}

function familyLabel(familyId = "") {
  const phone = phoneFromFamilyId(familyId);
  return phone ? phone.replace(/^(\d{2})(\d{5})(\d+)$/, "+$1 $2 $3") : "Unknown family";
}
