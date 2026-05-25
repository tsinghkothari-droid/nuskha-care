import { config } from "../config.mjs";
import { callOpenAiCompatibleChat } from "./openai-compatible.mjs";

export function getAiProviderStatus() {
  return {
    provider: config.ai.provider,
    extractionProvider: config.ai.extractionProvider,
    configured: isAiConfigured(),
    baseUrl: config.ai.baseUrl ? redactBaseUrl(config.ai.baseUrl) : "",
    model: config.ai.model
  };
}

export function isAiConfigured() {
  if (config.ai.provider === "stub") return false;
  return Boolean(config.ai.baseUrl && config.ai.apiKey && config.ai.model);
}

export async function runAiHealthCheck() {
  if (!isAiConfigured()) {
    return {
      ok: false,
      status: "not_configured",
      ...getAiProviderStatus()
    };
  }

  const result = await runAiChat([
    {
      role: "system",
      content: "Reply with exactly: nuskha-ai-ok"
    },
    {
      role: "user",
      content: "health"
    }
  ]);

  return {
    ok: result.content.trim().toLowerCase().includes("nuskha-ai-ok"),
    status: "checked",
    provider: config.ai.provider,
    model: config.ai.model,
    sample: result.content.slice(0, 120)
  };
}

export async function runAiChat(messages, options = {}) {
  if (config.ai.provider === "nahcrof" || config.ai.provider === "openai-compatible") {
    return callOpenAiCompatibleChat({
      baseUrl: config.ai.baseUrl,
      apiKey: config.ai.apiKey,
      model: config.ai.model,
      messages,
      temperature: options.temperature ?? 0.1,
      timeoutMs: config.ai.timeoutMs
    });
  }

  throw new Error(`unsupported_ai_provider:${config.ai.provider}`);
}

function redactBaseUrl(value) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname.replace(/\/$/, "")}`;
  } catch {
    return "[configured]";
  }
}
