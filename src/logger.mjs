import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "phone",
      "*.phone",
      "remoteJid",
      "*.remoteJid",
      "text",
      "*.text",
      "script",
      "*.script",
      "parentScript",
      "*.parentScript",
      "childSummary",
      "*.childSummary",
      "apiKey",
      "*.apiKey",
      "accessToken",
      "*.accessToken"
    ],
    censor: "[redacted]"
  }
});
