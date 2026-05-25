import { z } from "zod";

export const inboundMediaSchema = z.object({
  type: z.enum(["image", "document"]).optional(),
  mimeType: z.string().optional(),
  fileName: z.string().optional(),
  localPath: z.string().optional(),
  caption: z.string().optional(),
  sha256: z.string().optional()
}).passthrough();

export const inboundMessageSchema = z.object({
  source: z.string().optional(),
  profile: z.string().optional(),
  messageId: z.string().min(1).optional(),
  remoteJid: z.string().optional(),
  phone: z.string().optional(),
  displayName: z.string().optional(),
  timestamp: z.string().optional(),
  text: z.string().optional().default(""),
  media: inboundMediaSchema.nullable().optional()
}).passthrough();

export function parseInboundMessage(payload = {}) {
  const parsed = inboundMessageSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: "invalid_inbound_message",
      issues: parsed.error.issues
    };
  }

  return {
    ok: true,
    value: {
      ...parsed.data,
      text: String(parsed.data.text || "").trim(),
      phone: normalizePhone(parsed.data.phone || parsed.data.remoteJid || "")
    }
  };
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

