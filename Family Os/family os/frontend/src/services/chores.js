import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseApp";
import { createDoc, getDocById, updateDocById } from "./firestore";
import { isDemoMode } from "../utils/mode";
import { queryDemoByField, deleteDemoDoc } from "./demoStore";

export const createChore = async (payload) => createDoc("chores", payload);

export const updateChore = async (choreId, payload) => {
  return updateDocById("chores", choreId, payload);
};

export const getChoreById = async (choreId) => {
  return getDocById("chores", choreId);
};

export const deleteChore = async (choreId) => {
  if (isDemoMode()) {
    deleteDemoDoc("chores", choreId);
    return;
  }
  await deleteDoc(doc(db, "chores", choreId));
};

export const getChoresByChild = async (childId, familyId) => {
  if (!childId || !familyId) return [];
  if (isDemoMode()) {
    return queryDemoByField("chores", "familyId", familyId).filter(
      (c) => c.assignedChildId === childId && c.active !== false
    );
  }
  const q = query(
    collection(db, "chores"),
    where("familyId", "==", familyId),
    where("assignedChildId", "==", childId),
    where("active", "==", true),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const getChoresByFamily = async (familyId) => {
  if (!familyId) return [];
  if (isDemoMode()) {
    return queryDemoByField("chores", "familyId", familyId);
  }
  const q = query(
    collection(db, "chores"),
    where("familyId", "==", familyId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};
