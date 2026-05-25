import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";

const profile = process.argv[2] || "nuskha-dev";
const stayAlive = process.argv.includes("--stay-alive");
const authDir = resolve(".runtime", "baileys-auth", "profiles", profile);
const qrPath = resolve(authDir, "qr.png");

mkdirSync(authDir, { recursive: true });

console.log(`profile=${profile}`);
console.log(`authDir=${authDir}`);
console.log(`qrPath=${qrPath}`);

await start();

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    browser: ["Nuskha Care Dev", "Chrome", "1.0.0"],
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
      console.log(`${new Date().toISOString()} connected`);
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const reason = DisconnectReason[statusCode] || "unknown";
      console.log(`${new Date().toISOString()} closed status=${statusCode} reason=${reason}`);

      if (stayAlive && statusCode !== DisconnectReason.loggedOut) {
        console.log("restarting login loop in 2s");
        setTimeout(() => start().catch((error) => console.error(error)), 2000);
        return;
      }

      process.exitCode = statusCode === DisconnectReason.loggedOut ? 1 : 0;
    }
  });
}

