import { config } from "../config.mjs";
import * as memoryStore from "./memory-store.mjs";
import * as neonStore from "./neon-store.mjs";

export function getStore() {
  return config.databaseProvider === "neon" && config.databaseUrl ? neonStore : memoryStore;
}

