import { createDoc } from "../services/firestore";

export const seedDemoData = async ({ familyId, parentId, childId }) => {
  // TODO: expand this into a safe, idempotent seed process.
  await createDoc("families", {
    name: "Demo Family",
    parentIds: [parentId],
    childIds: [childId],
    settings: {
      leaderboardEnabled: true,
      aiDefaultEnabled: false,
      reminderSettings: {},
    },
  }, familyId);

  await createDoc("chores", {
    familyId,
    assignedChildId: childId,
    title: "Make the bed",
    description: "Smooth the sheets and straighten pillows.",
    checklist: ["Sheets tucked", "Pillows aligned"],
    pointValue: 10,
    difficulty: "easy",
    recurrence: "daily",
    proofRequired: true,
    proofType: "photo",
    aiVerificationEnabled: false,
    parentApprovalRequired: true,
    active: true,
    createdBy: parentId,
  });
};
