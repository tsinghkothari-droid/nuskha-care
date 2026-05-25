import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 8787),
  nodeEnv: process.env.NODE_ENV || "development",
  defaultLanguage: process.env.NUSKHA_DEFAULT_LANGUAGE || "hi",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${process.env.PORT || 8787}`,
  pilotMode: process.env.NUSKHA_PILOT_MODE === "true",
  wabaWebhookVerifyToken: process.env.WABA_WEBHOOK_VERIFY_TOKEN || "",
  databaseProvider: process.env.DATABASE_PROVIDER || "memory",
  databaseUrl: process.env.DATABASE_URL || "",
  deliveryProvider: process.env.NUSKHA_DELIVERY_PROVIDER || "stub",
  ttsProvider: process.env.NUSKHA_TTS_PROVIDER || "stub",
  ai: {
    provider: process.env.NUSKHA_AI_PROVIDER || "stub",
    extractionProvider: process.env.NUSKHA_EXTRACTION_PROVIDER || "crof",
    baseUrl: process.env.OPENAI_BASE_URL || "",
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "glm-4.7-flash",
    timeoutMs: Number(process.env.NUSKHA_AI_TIMEOUT_MS || 30000),
    useLiveExtraction: process.env.NUSKHA_USE_LIVE_EXTRACTION === "true"
  }
};
