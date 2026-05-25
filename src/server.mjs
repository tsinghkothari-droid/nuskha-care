import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import { config } from "./config.mjs";
import { logger } from "./logger.mjs";
import { demoCases } from "./data/demo-cases.mjs";
import { getAiProviderStatus, runAiHealthCheck } from "./ai/provider.mjs";
import { handleInboundMessage } from "./core/pipeline.mjs";
import {
  approveReviewTask,
  editReviewTask,
  escalateReviewTask,
  getReviewTask,
  listReviewTasks
} from "./core/review-service.mjs";
import { getStore } from "./store/index.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function buildServer() {
  const app = Fastify({ loggerInstance: logger });

  app.addHook("onRequest", async (request, reply) => {
    reply.header("access-control-allow-origin", "*");
    reply.header("access-control-allow-methods", "GET,POST,OPTIONS");
    reply.header("access-control-allow-headers", "content-type");
    if (request.method === "OPTIONS") {
      return reply.code(204).send();
    }
  });

  app.get("/health", async () => ({
    ok: true,
    service: "nuskha-care",
    env: config.nodeEnv,
    ai: getAiProviderStatus()
  }));

  app.get("/health/ai", async () => runAiHealthCheck());

  app.get("/crm", async (_request, reply) => {
    const html = await fs.readFile(path.join(rootDir, "frontend", "pharmacist-crm.html"), "utf8");
    return reply.type("text/html").send(html);
  });

  app.post("/dev/whatsapp-inbound", async (request, reply) => {
    const result = await handleInboundMessage(request.body, {
      source: "baileys-dev"
    });

    return reply.code(202).send(result);
  });

  app.post("/dev/seed-fixtures", async () => {
    const runId = Date.now().toString(36);
    const results = [];

    for (const demo of demoCases) {
      await handleInboundMessage({
        messageId: `seed-${runId}-${demo.name}-consent`,
        phone: demo.inbound.phone,
        text: "YES"
      }, { source: "crm-seed" });

      const result = await handleInboundMessage({
        ...demo.inbound,
        messageId: `seed-${runId}-${demo.name}`
      }, { source: "crm-seed" });

      results.push({
        name: demo.name,
        status: result.status,
        riskPath: result.risk?.path || null,
        reviewTaskId: result.reviewTaskId || null
      });
    }

    return { ok: true, runId, results };
  });

  app.get("/dev/state", async () => ({
    ok: true,
    state: await getStore().getDebugState()
  }));

  app.post("/webhooks/waba/inbound", async (request, reply) => {
    const result = await handleInboundMessage(request.body, {
      source: "waba"
    });

    return reply.code(202).send(result);
  });

  app.get("/review/tasks", async (request) => ({
    ok: true,
    tasks: await listReviewTasks(request.query || {})
  }));

  app.get("/review/tasks/:id", async (request, reply) => {
    const task = await getReviewTask(request.params.id);
    if (!task) return reply.code(404).send({ ok: false, status: "not_found" });
    return { ok: true, task };
  });

  app.post("/review/tasks/:id/edit", async (request, reply) => {
    const result = await editReviewTask(request.params.id, request.body || {});
    return reply.code(result.ok ? 200 : 404).send(result);
  });

  app.post("/review/tasks/:id/approve", async (request, reply) => {
    const result = await approveReviewTask(request.params.id, request.body || {});
    return reply.code(result.ok ? 200 : result.status === "not_found" ? 404 : 409).send(result);
  });

  app.post("/review/tasks/:id/escalate", async (request, reply) => {
    const result = await escalateReviewTask(request.params.id, request.body || {});
    return reply.code(result.ok ? 200 : 404).send(result);
  });

  return app;
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || "")) {
  const app = buildServer();
  await app.listen({ port: config.port, host: "0.0.0.0" });
}
