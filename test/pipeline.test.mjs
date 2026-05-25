import test from "node:test";
import assert from "node:assert/strict";

import { handleInboundMessage } from "../src/core/pipeline.mjs";

test("requires consent before processing", async () => {
  const result = await handleInboundMessage({
    messageId: "test-consent-required",
    phone: "910000000001",
    text: "Rx Metformin 500mg once daily"
  });

  assert.equal(result.ok, true);
  assert.equal(result.status, "consent_required");
});

test("processes consented low-risk prescription", async () => {
  const phone = "910000000002";
  await handleInboundMessage({ messageId: "test-consent", phone, text: "YES" });

  const result = await handleInboundMessage({
    messageId: "test-green",
    phone,
    text: "Rx Metformin 500mg once daily after food"
  });

  assert.equal(result.ok, true);
  assert.equal(result.risk.path, "green");
  assert.equal(result.status, "ready_to_send");
});

test("queues high-risk prescription for doctor review", async () => {
  const phone = "910000000003";
  await handleInboundMessage({ messageId: "test-consent-red", phone, text: "YES" });

  const result = await handleInboundMessage({
    messageId: "test-red",
    phone,
    text: "Rx Insulin 10 units once daily. Patient has chest pain."
  });

  assert.equal(result.ok, true);
  assert.equal(result.risk.path, "red");
  assert.equal(result.route.queue, "doctor");
});

