import { createDeliveryPlan } from "./delivery.mjs";
import { getStore } from "../store/index.mjs";

export async function listReviewTasks(query = {}) {
  return getStore().listReviewTasks(query);
}

export async function getReviewTask(id) {
  return getStore().getReviewTask(id);
}

export async function editReviewTask(id, { draft, reviewerId } = {}) {
  const store = getStore();
  const task = await store.getReviewTask(id);
  if (!task) return { ok: false, status: "not_found" };

  const before = task.draft;
  const nextDraft = { ...task.draft, ...draft };
  const updated = await store.updateReviewTask(id, {
    draft: nextDraft,
    status: "edited",
    reviewerId: reviewerId || task.reviewerId || null
  });

  await store.recordCorrection({
    taskId: id,
    reviewerId,
    before,
    after: nextDraft
  });

  return { ok: true, task: updated };
}

export async function approveReviewTask(id, { reviewerId, force = false } = {}) {
  const store = getStore();
  const task = await store.getReviewTask(id);
  if (!task) return { ok: false, status: "not_found" };

  if (task.risk?.path === "red" && task.queue !== "doctor" && !force) {
    return {
      ok: false,
      status: "red_case_requires_doctor",
      message: "Red cases cannot be approved outside doctor review."
    };
  }

  const family = { id: task.familyId, phone: task.familyId?.replace(/^fam_/, ""), language: "hi", childLanguage: "en" };
  const delivery = await createDeliveryPlan({
    route: { queue: "auto" },
    draft: task.draft,
    family,
    reviewTaskId: task.id
  });
  const updated = await store.updateReviewTask(id, {
    status: "approved",
    approvedBy: reviewerId || null,
    approvedAt: new Date().toISOString(),
    delivery
  });

  return { ok: true, task: updated, delivery };
}

export async function escalateReviewTask(id, { reviewerId, reason } = {}) {
  const store = getStore();
  const task = await store.getReviewTask(id);
  if (!task) return { ok: false, status: "not_found" };

  const updated = await store.updateReviewTask(id, {
    queue: "doctor",
    status: "escalated",
    escalatedBy: reviewerId || null,
    escalationReason: reason || "manual_escalation",
    escalatedAt: new Date().toISOString()
  });

  return { ok: true, task: updated };
}

