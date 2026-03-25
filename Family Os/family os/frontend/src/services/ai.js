import { apiFetch } from "./apiClient";
import { isDemoMode } from "../utils/mode";

export const verifyChoreSubmission = async (payload) => {
  if (isDemoMode()) {
    return {
      confidenceScore: 0.62,
      status: "needs_review",
      notes: "Demo mode mock review.",
      reviewedAt: new Date().toISOString(),
      source: "demo",
    };
  }
  return apiFetch("/api/ai/verify-chore", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const moderateSubmission = async (payload) => {
  if (isDemoMode()) {
    return {
      status: "needs_review",
      notes: "Demo moderation placeholder.",
      reviewedAt: new Date().toISOString(),
      source: "demo",
    };
  }
  return apiFetch("/api/ai/moderate-submission", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
