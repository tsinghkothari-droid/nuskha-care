import Fastify from "fastify";
import { config } from "./config.mjs";
import { logger } from "./logger.mjs";
import { getAiProviderStatus, runAiHealthCheck } from "./ai/provider.mjs";
import { handleInboundMessage } from "./core/pipeline.mjs";

export function buildServer() {
  const app = Fastify({ logger });

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

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = buildServer();
  await app.listen({ port: config.port, host: "0.0.0.0" });
}
