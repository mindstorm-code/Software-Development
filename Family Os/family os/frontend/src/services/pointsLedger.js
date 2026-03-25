import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseApp";
import { createDoc } from "./firestore";
import { isDemoMode } from "../utils/mode";
import { addDemoDoc, queryDemoByField } from "./demoStore";

export const addLedgerEntry = async (payload) => {
  if (isDemoMode()) {
    return addDemoDoc("pointsLedger", payload);
  }
  return createDoc("pointsLedger", payload);
};

export const calculateBalance = (entries = []) => {
  return entries.reduce((sum, entry) => sum + (entry.delta || 0), 0);
};

export const getChildPointsBalance = async (childId, familyId) => {
  if (!childId || !familyId) return 0;
  if (isDemoMode()) {
    const entries = queryDemoByField("pointsLedger", "familyId", familyId).filter(
      (e) => e.childId === childId
    );
    return calculateBalance(entries);
  }
  const q = query(
    collection(db, "pointsLedger"),
    where("familyId", "==", familyId),
    where("childId", "==", childId)
  );
  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map((docSnap) => docSnap.data());
  return calculateBalance(entries);
};

export const getFamilyPointsIssued = async (familyId) => {
  if (!familyId) return 0;
  if (isDemoMode()) {
    const entries = queryDemoByField("pointsLedger", "familyId", familyId);
    return entries.reduce((sum, entry) => {
      const delta = Number(entry.delta) || 0;
      return delta > 0 ? sum + delta : sum;
    }, 0);
  }
  const q = query(
    collection(db, "pointsLedger"),
    where("familyId", "==", familyId)
  );
  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map((docSnap) => docSnap.data());
  return entries.reduce((sum, entry) => {
    const delta = Number(entry.delta) || 0;
    return delta > 0 ? sum + delta : sum;
  }, 0);
};

export const applyPenalty = async ({ childId, familyId, points, reason }) => {
  return addLedgerEntry({
    childId,
    familyId,
    delta: -Math.abs(points),
    reason: reason || "Penalty",
    sourceType: "penalty",
  });
};
