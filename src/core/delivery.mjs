export async function createDeliveryPlan({ route, draft, family }) {
  if (route.queue === "auto") {
    return {
      status: "ready_to_send",
      voice: {
        provider: "stub",
        language: family.language || "hi",
        script: draft.parentScript,
        mediaUrl: null
      },
      childSummary: draft.childSummary
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

