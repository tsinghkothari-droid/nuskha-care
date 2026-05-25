import "dotenv/config";

import { mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import makeWASocket, {
  DisconnectReason,
  downloadMediaMessage,
  fetchLatestBaileysVersion,
  getContentType,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";

const profile = process.argv[2] || "nuskha-dev";
const authDir = resolve(".runtime", "baileys-auth", "profiles", profile);
const mediaDir = resolve(".runtime", "baileys-media", profile);
const qrPath = resolve(authDir, "qr.png");
const webhookUrl = process.env.NUSKHA_LOCAL_WEBHOOK_URL || "http://127.0.0.1:8787/dev/whatsapp-inbound";
const startedAtSeconds = Math.floor(Date.now() / 1000);
const inFlight = new Set();

mkdirSync(authDir, { recursive: true });
mkdirSync(mediaDir, { recursive: true });

console.log("mode=baileys-dev-bridge");
console.log(`profile=${profile}`);
console.log(`authDir=${authDir}`);
console.log(`mediaDir=${mediaDir}`);
console.log(`qrPath=${qrPath}`);
console.log(`webhookUrl=${webhookUrl}`);
console.log("warning=internal testing only; production must use WABA");

await start();

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    browser: ["Nuskha Care Dev", "Chrome", "1.0.0"],
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    syncFullHistory: false,
    version
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      await QRCode.toFile(qrPath, qr, { width: 768, margin: 2 });
      console.log(`${new Date().toISOString()} wrote QR ${qrPath}`);
    }

    if (connection === "open") {
      console.log(`${new Date().toISOString()} connected and listening for fresh direct messages`);
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const reason = DisconnectReason[statusCode] || "unknown";
      console.log(`${new Date().toISOString()} closed status=${statusCode} reason=${reason}`);

      if (statusCode !== DisconnectReason.loggedOut) {
        console.log("restarting bridge loop in 2s");
        setTimeout(() => start().catch((error) => console.error(error)), 2000);
        return;
      }

      process.exitCode = 1;
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const message of messages || []) {
      await handleMessage(message).catch((error) => {
        console.error(`${new Date().toISOString()} message_error ${error?.stack || error}`);
      });
    }
  });
}

async function handleMessage(message) {
  if (message.key?.fromMe) return;

  const remoteJid = message.key?.remoteJid || "";
  if (!remoteJid || remoteJid.endsWith("@g.us")) return;

  const messageId = message.key?.id || "";
  if (inFlight.has(messageId)) return;
  inFlight.add(messageId);

  const ts = Number(message.messageTimestamp || 0);
  if (ts && ts < startedAtSeconds - 30) {
    console.log(`${new Date().toISOString()} skipped_stale jid=${remoteJid} ts=${ts}`);
    return;
  }

  const text = extractText(message.message);
  const media = await saveInboundMedia(message);

  if (!text && !media) return;

  const payload = {
    source: "baileys-dev",
    profile,
    messageId,
    remoteJid,
    phone: remoteJid.replace(/\D/g, ""),
    displayName: message.pushName || "",
    timestamp: ts ? new Date(ts * 1000).toISOString() : new Date().toISOString(),
    text,
    media
  };

  await postWebhook(payload);
}

function extractText(message = {}) {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.documentMessage?.caption ||
    ""
  ).trim();
}

async function saveInboundMedia(message) {
  const contentType = getContentType(message.message || {});
  if (!["imageMessage", "documentMessage"].includes(contentType)) return null;

  const node = message.message?.[contentType];
  const mimeType = node?.mimetype || "application/octet-stream";
  const extension = extensionForMime(mimeType, node?.fileName || "");
  const messageId = message.key?.id || `${Date.now()}`;
  const fileName = `${safeName(messageId)}${extension}`;
  const filePath = resolve(mediaDir, fileName);

  const buffer = await downloadMediaMessage(message, "buffer", {});
  await writeFile(filePath, buffer);

  return {
    type: contentType === "imageMessage" ? "image" : "document",
    mimeType,
    fileName: node?.fileName || fileName,
    localPath: filePath,
    caption: node?.caption || "",
    sha256: node?.fileSha256 ? Buffer.from(node.fileSha256).toString("base64") : ""
  };
}

async function postWebhook(payload) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`webhook_failed status=${response.status} body=${body.slice(0, 500)}`);
  }

  console.log(`${new Date().toISOString()} forwarded messageId=${payload.messageId} media=${Boolean(payload.media)}`);
}

function extensionForMime(mimeType, originalName) {
  const originalExt = extname(basename(originalName || ""));
  if (originalExt) return originalExt;

  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "application/pdf") return ".pdf";
  return ".bin";
}

function safeName(value) {
  return String(value || "message").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

