import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

export async function getBaileysStatus(profile = "nuskha-dev") {
  const authDir = resolve(".runtime", "baileys-auth", "profiles", profile);
  const credsPath = resolve(authDir, "creds.json");
  const qrPath = resolve(authDir, "qr.png");
  const creds = await readCreds(credsPath);
  const bridgeProcesses = findBridgeProcesses();

  return {
    profile,
    production: false,
    warning: "Baileys is for internal development only. Production must use WABA.",
    authDir,
    hasAuth: existsSync(credsPath),
    hasQr: existsSync(qrPath),
    qrUpdatedAt: fileUpdatedAt(qrPath),
    connectedAs: creds?.me?.id || creds?.me?.jid || null,
    bridgeRunning: bridgeProcesses.length > 0,
    bridgeProcesses,
    sendAvailable: existsSync(credsPath)
  };
}

async function readCreds(credsPath) {
  try {
    return JSON.parse(await readFile(credsPath, "utf8"));
  } catch {
    return null;
  }
}

function fileUpdatedAt(filePath) {
  try {
    return statSync(filePath).mtime.toISOString();
  } catch {
    return null;
  }
}

function findBridgeProcesses() {
  if (process.platform !== "win32") return [];
  try {
    // PowerShell is used only for local dev status. It does not affect production behavior.
    const output = execFileSync("powershell", [
      "-NoProfile",
      "-Command",
      "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'experimental[\\\\/]baileys-transport[\\\\/]bridge.mjs' } | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"
    ], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (!output) return [];
    const parsed = JSON.parse(output);
    return (Array.isArray(parsed) ? parsed : [parsed]).map((item) => ({
      pid: item.ProcessId,
      commandLine: item.CommandLine
    }));
  } catch {
    return [];
  }
}
