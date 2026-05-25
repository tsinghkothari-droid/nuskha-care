import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: ["phone", "*.phone", "remoteJid", "*.remoteJid"],
    censor: "[redacted]"
  }
});

