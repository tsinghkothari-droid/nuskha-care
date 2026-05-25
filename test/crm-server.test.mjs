import test from "node:test";
import assert from "node:assert/strict";

import { buildServer } from "../src/server.mjs";

test("CRM route serves real API-backed dashboard", async () => {
  const app = buildServer();
  const response = await app.inject({ method: "GET", url: "/crm" });
  await app.close();

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["content-type"], /text\/html/);
  assert.match(response.body, /Real Work Queue/);
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

