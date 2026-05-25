import path from "node:path";
import { fileURLToPath } from "node:url";
import Fastify from "fastify";
import { config } from "./config.mjs";
import { logger } from "./logger.mjs";
import { getAiProviderStatus, runAiHealthCheck } from "./ai/provider.mjs";
import { handleInboundMessage } from "./core/pipeline.mjs";
import {
  approveReviewTask,
  editReviewTask,
  escalateReviewTask,
  getReviewTask,
  listReviewTasks
} from "./core/review-service.mjs";

export function buildServer() {
  const app = Fastify({ loggerInstance: logger });

  app.get("/health", async () => ({
    ok: true,
    service: "nuskha-care",
    env: config.nodeEnv,
    ai: getAiProviderStatus()
  }));

  app.get("/health/ai", async () => runAiHealthCheck());

  app.post("/dev/whatsapp-inbound", async (request, reply) => {
    const result = await handleInboundMessage(request.body, {
      source: "baileys-dev"
    });

    return reply.code(202).send(result);
  });

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
