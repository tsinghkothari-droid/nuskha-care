import { handleInboundMessage } from "../core/pipeline.mjs";

const scenario = process.argv[2] || "green";

const payloads = {
  consent: {
    messageId: "sim-consent",
    phone: "919999999999",
    text: "YES"
  },
  green: {
    messageId: "sim-green",
    phone: "919999999999",
    text: "Rx Metformin 500mg once daily after food"
  },
  yellow: {
    messageId: "sim-yellow",
    phone: "919999999999",
    text: "Rx Telmisartan 40mg once daily"
  },
  red: {
    messageId: "sim-red",
    phone: "919999999999",
    text: "Patient has chest pain. Insulin mentioned."
  }
};

await handleInboundMessage(payloads.consent, { source: "cli" });
const result = await handleInboundMessage(payloads[scenario] || payloads.green, { source: "cli" });
console.log(JSON.stringify(result, null, 2));

