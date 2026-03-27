import {
  Timestamp,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseApp";
import { createDoc, getDocById, updateDocById } from "./firestore";
import { getChoresByFamily } from "./chores";
import { getStartOfToday, getEndOfToday } from "../utils/date";
import { isDemoMode } from "../utils/mode";
import { addDemoDoc, queryDemoByFields, updateDemoDoc } from "./demoStore";

export const createChoreInstance = async (payload) => {
  return createDoc("choreInstances", payload);
};

export const updateChoreInstance = async (instanceId, payload) => {
  return updateDocById("choreInstances", instanceId, payload);
};

export const getChoreInstanceById = async (instanceId) => {
  return getDocById("choreInstances", instanceId);
};

export const getChoreInstancesForToday = async (childId, familyId) => {
  if (!childId || !familyId) return [];
  const startIso = getStartOfToday().toISOString();
  const endIso = getEndOfToday().toISOString();

  const matchChild = (ci) =>
    ci.childId === childId || ci.childId === "all" || ci.childId === "open";

  if (isDemoMode()) {
    return queryDemoByFields("choreInstances", [["familyId", familyId]]).filter(
      (ci) =>
        matchChild(ci) && ci.dueDate >= startIso && ci.dueDate <= endIso
    );
  }

  const start = Timestamp.fromDate(getStartOfToday());
  const end = Timestamp.fromDate(getEndOfToday());
  // Firestore OR via 'in'
  const childIds = [childId, "all", "open"];
  const q = query(
    collection(db, "choreInstances"),
    where("familyId", "==", familyId),
    where("childId", "in", childIds),
    where("dueDate", ">=", start),
    where("dueDate", "<=", end)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const getChoreInstancesForTodayByFamily = async (familyId) => {
  if (!familyId) return [];
  if (isDemoMode()) {
    const start = getStartOfToday().toISOString();
    const end = getEndOfToday().toISOString();
    return queryDemoByFields("choreInstances", [["familyId", familyId]]).filter(
      (ci) => ci.dueDate >= start && ci.dueDate <= end
    );
  }
  const start = Timestamp.fromDate(getStartOfToday());
  const end = Timestamp.fromDate(getEndOfToday());
  const q = query(
    collection(db, "choreInstances"),
    where("familyId", "==", familyId),
    where("dueDate", ">=", start),
    where("dueDate", "<=", end)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

const isDueToday = (chore, today) => {
  const recurrence = chore.recurrence || "daily";
  const config = { ...(chore.recurrenceConfig || {}) };

  if (!config.dayOfWeek && chore.createdAt?.toDate) {
    const createdDate = chore.createdAt.toDate();
    config.dayOfWeek = createdDate.getDay();
    config.dayOfMonth = createdDate.getDate();
    config.month = createdDate.getMonth();
  }

  if (recurrence === "daily") return true;
  if (recurrence === "weekly") {
    const targetDow = config.dayOfWeek ?? today.getDay();
    return today.getDay() === targetDow;
  }
  if (recurrence === "monthly") {
    const targetDom = config.dayOfMonth ?? today.getDate();
    return today.getDate() === targetDom;
  }
  if (recurrence === "yearly") {
    const targetMonth = config.month ?? today.getMonth();
    const targetDom = config.dayOfMonth ?? today.getDate();
    return today.getMonth() === targetMonth && today.getDate() === targetDom;
  }
  return false;
};

export const generateChoreInstancesForToday = async (familyId) => {
  if (!familyId) return [];

  const today = new Date();
  const start = getStartOfToday();
  const end = getEndOfToday();

  const chores = await getChoresByFamily(familyId);
  const activeChores = chores.filter((chore) => chore.active !== false);

  let existingByChore = new Set();
  if (isDemoMode()) {
    const existing = queryDemoByFields("choreInstances", [["familyId", familyId]]).filter(
      (ci) => ci.dueDate >= start.toISOString() && ci.dueDate <= end.toISOString()
    );
    existingByChore = new Set(existing.map((ci) => ci.choreId));
  } else {
    const existingQuery = query(
      collection(db, "choreInstances"),
      where("familyId", "==", familyId),
      where("dueDate", ">=", Timestamp.fromDate(start)),
      where("dueDate", "<=", Timestamp.fromDate(end))
    );
    const existingSnapshot = await getDocs(existingQuery);
    existingByChore = new Set(
      existingSnapshot.docs.map((docSnap) => docSnap.data().choreId)
    );
  }

  const createdIds = [];

  for (const chore of activeChores) {
    if (!chore.assignedChildId) continue;
    if (!isDueToday(chore, today)) continue;
    if (existingByChore.has(chore.id)) continue;

    const payload = {
      familyId,
      choreId: chore.id,
      childId: chore.assignedChildId,
      dueDate: isDemoMode()
        ? getStartOfToday().toISOString()
        : Timestamp.fromDate(getStartOfToday()),
      status: "pending",
      streakEligible: true,
    };

    const instanceId = isDemoMode()
      ? addDemoDoc("choreInstances", payload)
      : await createChoreInstance(payload);

    createdIds.push(instanceId);
  }

  return createdIds;
};
