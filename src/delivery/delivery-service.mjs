import { config } from "../config.mjs";

export async function sendDelivery({ family, voice, childSummary, reviewTaskId = null }) {
  const provider = config.deliveryProvider;

  if (provider === "baileys") {
    return {
      provider: "baileys-dev",
      status: "ready_for_baileys_bridge",
      providerMessageId: null,
      reviewTaskId,
      payload: {
        to: family.phone,
        script: voice.script,
        childSummary
      }
    };
  }

  if (provider === "waba") {
    return {
      provider: "waba",
      status: "waba_not_configured",
      providerMessageId: null,
      reviewTaskId,
      payload: {
        to: family.phone,
        mediaUrl: voice.mediaUrl,
        childSummary
      }
    };
  }

  return {
    provider: "stub",
    status: "recorded_not_sent",
    providerMessageId: null,
    reviewTaskId,
    payload: {
      to: family.phone,
      script: voice.script,
      childSummary
    }
  };
}

