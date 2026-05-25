import test from "node:test";
import assert from "node:assert/strict";

import { buildServer } from "../src/server.mjs";
import { config } from "../src/config.mjs";
import { handleInboundMessage } from "../src/core/pipeline.mjs";

test("pilot readiness exposes templates, consent, and safety checks without secrets", async () => {
  const app = buildServer();
  const response = await app.inject({ method: "GET", url: "/pilot/readiness" });
  await app.close();

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, true);
  assert.ok(Array.isArray(body.checks));
  assert.ok(body.wabaTemplates.length >= 5);
  assert.match(body.consentCopy.hi.text, /doctor/i);
  assert.match(body.consentCopy.en.text, /not a doctor replacement/i);
  assert.ok(body.clinicalAdvisorChecklist.length >= 5);
  assert.ok(body.deploymentSecretChecklist.includes("NUSKHA_PILOT_MODE=true for first controlled pilot"));
  assert.doesNotMatch(response.body, /sk_[A-Za-z0-9]{12,}/);
});

test("erasure request route records operator-handled privacy request", async () => {
  const app = buildServer();
  const response = await app.inject({
    method: "POST",
    url: "/privacy/erasure-requests",
    payload: {
      phone: "910000009999",
      requester: "child",
      reason: "pilot test"
    }
  });
  await app.close();

  assert.equal(response.statusCode, 202);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, true);
  assert.equal(body.status, "queued_for_operator");
  assert.equal(body.familyId, "fam_910000009999");
  assert.equal(body.requiredCompletionDays, 30);
});

test("WABA webhook verification fails closed without matching token", async () => {
  const app = buildServer();
  const response = await app.inject({
    method: "GET",
    url: "/webhooks/waba/inbound?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=abc"
  });
  await app.close();

  assert.equal(response.statusCode, 403);
});

test("pilot mode routes green cases to pharmacist review when enabled", async () => {
  const originalPilotMode = config.pilotMode;
  config.pilotMode = true;

  await handleInboundMessage({
    messageId: "pilot-consent-1",
    phone: "910000001111",
    text: "YES"
  }, { source: "pilot-test" });

  const result = await handleInboundMessage({
    messageId: "pilot-green-1",
    phone: "910000001111",
    text: "Rx Metformin 500mg once daily after food"
  }, { source: "pilot-test" });

  config.pilotMode = originalPilotMode;

  assert.equal(result.risk.path, "green");
  assert.equal(result.status, "queued_for_review");
  assert.equal(result.route.queue, "pharmacist");
  assert.equal(result.route.reason, "pilot_manual_review");
  assert.ok(result.reviewTaskId);
});
