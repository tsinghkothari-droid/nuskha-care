export function chooseReviewPath(risk, draftSafety) {
  if (!draftSafety.passed) {
    return {
      queue: "pharmacist",
      reason: "draft_safety_failed"
    };
  }

  if (risk.path === "green") {
    return {
      queue: "auto",
      reason: "green_path"
    };
  }

  if (risk.path === "yellow") {
    return {
      queue: "pharmacist",
      reason: "yellow_path"
    };
  }

  return {
    queue: "doctor",
    reason: "red_path"
  };
}

