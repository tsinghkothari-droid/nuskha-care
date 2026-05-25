import { sendDelivery } from "../delivery/delivery-service.mjs";
import { getStore } from "../store/index.mjs";
import { synthesizeVoice } from "../tts/tts-service.mjs";

export async function createDeliveryPlan({ route, draft, family, reviewTaskId = null }) {
  if (route.queue === "auto") {
    const store = getStore();
    const voice = await synthesizeVoice({
      script: draft.parentScript,
      language: family.language || "hi"
    });
    const voiceRecord = await store.recordVoiceNote({
      familyId: family.id,
      reviewTaskId,
      ...voice
    });
    const delivery = await sendDelivery({
      family,
      voice,
      childSummary: draft.childSummary,
      reviewTaskId
    });
    const deliveryRecord = await store.recordDelivery({
      familyId: family.id,
      reviewTaskId,
      ...delivery
    });

    return {
      status: delivery.status === "recorded_not_sent" ? "ready_to_send" : delivery.status,
      voice: voiceRecord,
      childSummary: draft.childSummary,
      delivery: deliveryRecord
    };
  }

  return {
    status: "queued_for_review",
    queue: route.queue,
    reviewerInstruction: route.queue === "doctor"
      ? "Doctor review required before final medical explanation."
      : "Pharmacist review required before voice generation.",
    draft
  };
}
