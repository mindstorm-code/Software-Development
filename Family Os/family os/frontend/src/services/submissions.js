import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseApp";
import { createDoc, updateDocById } from "./firestore";
import { updateChoreInstance } from "./choreInstances";
import { addLedgerEntry } from "./pointsLedger";
import { isDemoMode } from "../utils/mode";
import { addDemoDoc, queryDemoByField, updateDemoDoc } from "./demoStore";

export const createSubmission = async (payload) => {
  if (isDemoMode()) {
    return addDemoDoc("submissions", {
      ...payload,
      submittedAt: payload.submittedAt || new Date().toISOString(),
    });
  }
  return createDoc("submissions", {
    ...payload,
    submittedAt: payload.submittedAt || serverTimestamp(),
  });
};

export const updateSubmission = async (submissionId, payload) => {
  if (isDemoMode()) {
    updateDemoDoc("submissions", submissionId, payload);
    return;
  }
  return updateDocById("submissions", submissionId, payload);
};

export const getPendingSubmissionsForParent = async (familyId) => {
  if (!familyId) return [];
  if (isDemoMode()) {
    return queryDemoByField("submissions", "familyId", familyId).filter(
      (s) => s.status === "submitted"
    );
  }
  const q = query(
    collection(db, "submissions"),
    where("familyId", "==", familyId),
    where("status", "==", "submitted")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const approveSubmission = async ({
  submissionId,
  reviewerId,
  pointsAwarded,
  notes,
  choreInstanceId,
  childId,
  familyId,
}) => {
  const safePoints = Number(pointsAwarded) || 0;
  await updateSubmission(submissionId, {
    status: "approved",
    parentReview: {
      status: "approved",
      notes: notes || "",
      pointsAwarded: safePoints,
      reviewedBy: reviewerId,
      reviewedAt: new Date().toISOString(),
    },
  });

  if (choreInstanceId) {
    await updateChoreInstance(choreInstanceId, { status: "approved" });
  }

  if (childId && familyId && safePoints) {
    await addLedgerEntry({
      childId,
      familyId,
      delta: safePoints,
      reason: "Chore approved",
      sourceType: "chore_approval",
      sourceId: submissionId,
    });
  }
};

export const rejectSubmission = async ({
  submissionId,
  reviewerId,
  notes,
  choreInstanceId,
}) => {
  await updateSubmission(submissionId, {
    status: "rejected",
    parentReview: {
      status: "rejected",
      notes: notes || "",
      pointsAwarded: 0,
      reviewedBy: reviewerId,
      reviewedAt: new Date().toISOString(),
    },
  });

  if (choreInstanceId) {
    await updateChoreInstance(choreInstanceId, { status: "rejected" });
  }
};
