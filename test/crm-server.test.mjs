import test from "node:test";
import assert from "node:assert/strict";

import { buildServer } from "../src/server.mjs";

test("CRM route serves real API-backed dashboard", async () => {
  const app = buildServer();
  const response = await app.inject({ method: "GET", url: "/crm" });
  await app.close();

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["content-type"], /text\/html/);
  assert.match(response.body, /Work Queue/);
  assert.match(response.body, /\/review\/tasks/);
});

test("CRM seed route creates real review tasks through pipeline", async () => {
  const app = buildServer();

  const seed = await app.inject({ method: "POST", url: "/dev/seed-fixtures", payload: {} });
  assert.equal(seed.statusCode, 200);
  const seedBody = JSON.parse(seed.body);
  assert.equal(seedBody.ok, true);
  assert.ok(seedBody.results.some((item) => item.reviewTaskId));

  const tasks = await app.inject({ method: "GET", url: "/review/tasks" });
  await app.close();

  assert.equal(tasks.statusCode, 200);
  const taskBody = JSON.parse(tasks.body);
  assert.ok(taskBody.tasks.length >= 3);
  assert.ok(taskBody.tasks.some((item) => item.risk.path === "red"));
});

test("integration status exposes AI and WhatsApp state without secrets", async () => {
  const app = buildServer();
  const response = await app.inject({ method: "GET", url: "/integrations/status" });
  await app.close();

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, true);
  assert.ok(body.ai);
  assert.ok(body.whatsapp);
  assert.equal(body.whatsapp.production, false);
  assert.equal("apiKey" in body.ai, false);
});
