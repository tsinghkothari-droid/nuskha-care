import test from "node:test";
import assert from "node:assert/strict";

import { handleInboundMessage } from "../src/core/pipeline.mjs";
import { approveReviewTask, editReviewTask, escalateReviewTask } from "../src/core/review-service.mjs";

test("review task can be edited and approved", async () => {
  const phone = "910000000101";
  await handleInboundMessage({ messageId: "review-consent", phone, text: "YES" });
  const result = await handleInboundMessage({
    messageId: "review-yellow",
    phone,
    text: "Rx Glucorinex 10mg once daily"
  });

  assert.equal(result.route.queue, "pharmacist");
  assert.ok(result.reviewTaskId);

  const edited = await editReviewTask(result.reviewTaskId, {
    reviewerId: "pharm_1",
    draft: {
      childSummary: "Unknown medicine needs pharmacist confirmation."
    }
  });
  assert.equal(edited.ok, true);
  assert.equal(edited.task.status, "edited");

  const approved = await approveReviewTask(result.reviewTaskId, { reviewerId: "pharm_1" });
  assert.equal(approved.ok, true);
  assert.equal(approved.task.status, "approved");
  assert.ok(approved.delivery.voice);
});

test("red review task can be escalated", async () => {
  const phone = "910000000102";
  await handleInboundMessage({ messageId: "red-review-consent", phone, text: "YES" });
  const result = await handleInboundMessage({
    messageId: "red-review",
    phone,
    text: "Rx Insulin 10 units once daily. Patient is breathless."
  });

  assert.equal(result.route.queue, "doctor");
  const escalated = await escalateReviewTask(result.reviewTaskId, {
    reviewerId: "pharm_1",
    reason: "doctor confirmation required"
  });

  assert.equal(escalated.ok, true);
  assert.equal(escalated.task.queue, "doctor");
});

test("duplicate inbound message is ignored", async () => {
  const phone = "910000000103";
  await handleInboundMessage({ messageId: "duplicate-consent", phone, text: "YES" });
  await handleInboundMessage({ messageId: "duplicate-rx", phone, text: "Rx Metformin 500mg once daily" });
  const duplicate = await handleInboundMessage({ messageId: "duplicate-rx", phone, text: "Rx Metformin 500mg once daily" });

  assert.equal(duplicate.status, "duplicate_ignored");
});

