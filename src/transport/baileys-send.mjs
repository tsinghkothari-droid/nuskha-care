import { resolve } from "node:path";
import makeWASocket, { fetchLatestBaileysVersion, useMultiFileAuthState } from "@whiskeysockets/baileys";
import pino from "pino";

export async function sendBaileysText({ phone, text, profile = "nuskha-dev", timeoutMs = 20000 }) {
  if (!phone || !text) {
    return { ok: false, status: "missing_phone_or_text" };
  }

  const authDir = resolve(".runtime", "baileys-auth", "profiles", profile);
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();
  const jid = `${String(phone).replace(/\D/g, "")}@s.whatsapp.net`;

  const sock = makeWASocket({
    auth: state,
    browser: ["Nuskha Care CRM", "Chrome", "1.0.0"],
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    syncFullHistory: false,
    version
  });

  sock.ev.on("creds.update", saveCreds);

  try {
    await waitForOpen(sock, timeoutMs);
    const availability = await sock.onWhatsApp(jid);
    if (!availability?.[0]?.exists) {
      return { ok: false, status: "not_on_whatsapp_or_invalid", jid };
    }

    const sent = await sock.sendMessage(jid, { text });
    return {
      ok: true,
      status: "sent",
      jid,
      messageId: sent?.key?.id || null
    };
  } finally {
    sock.end?.(undefined);
  }
}

function waitForOpen(sock, timeoutMs) {
  return new Promise((resolvePromise, reject) => {
    const timeout = setTimeout(() => reject(new Error("baileys_open_timeout")), timeoutMs);
    sock.ev.on("connection.update", (update) => {
      if (update.connection === "open") {
        clearTimeout(timeout);
        resolvePromise();
      }
      if (update.connection === "close") {
        clearTimeout(timeout);
        reject(new Error("baileys_connection_closed"));
      }
    });
  });
}

