import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 8787),
  nodeEnv: process.env.NODE_ENV || "development",
  defaultLanguage: process.env.NUSKHA_DEFAULT_LANGUAGE || "hi",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${process.env.PORT || 8787}`,
  ai: {
    provider: process.env.NUSKHA_AI_PROVIDER || "stub",
    extractionProvider: process.env.NUSKHA_EXTRACTION_PROVIDER || "crof",
    baseUrl: process.env.OPENAI_BASE_URL || "",
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "glm-4.7-flash",
    timeoutMs: Number(process.env.NUSKHA_AI_TIMEOUT_MS || 30000)
  }
};
