import { createDoc, updateDocById } from "./firestore";

export const createFamily = async ({ name, parentId }) => {
  const familyId = await createDoc("families", {
    name: name || "New Family",
    parentIds: parentId ? [parentId] : [],
    childIds: [],
    settings: {
      leaderboardEnabled: true,
      aiDefaultEnabled: false,
      reminderSettings: {},
    },
  });

  return familyId;
};

export const updateFamily = async (familyId, data) => {
  return updateDocById("families", familyId, data);
};
