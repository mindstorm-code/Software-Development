import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseApp";
import { createDoc, getDocById, updateDocById } from "./firestore";
import { addLedgerEntry, getChildPointsBalance } from "./pointsLedger";
import { isDemoMode } from "../utils/mode";
import { addDemoDoc, getDemoDoc, queryDemoByField, updateDemoDoc } from "./demoStore";

export const createReward = async (payload) => {
  const doc = {
    active: true,
    createdAt: new Date().toISOString(),
    ...payload,
  };
  if (isDemoMode()) {
    return addDemoDoc("rewards", doc);
  }
  return createDoc("rewards", doc);
};

export const updateReward = async (rewardId, payload) => {
  return updateDocById("rewards", rewardId, payload);
};

export const createRedemption = async (payload) => {
  return createDoc("redemptions", payload);
};

const setRedemptionStatus = async (id, status, extra = {}) => {
  if (isDemoMode()) {
    updateDemoDoc("redemptions", id, { status, ...extra });
    return;
  }
  await updateDoc(doc(db, "redemptions", id), { status, ...extra });
};

export const getRewardsByFamily = async (familyId) => {
  if (!familyId) return [];
  if (isDemoMode()) {
    const defaults = new Set(["Movie Night", "Extra Screen Time", "Ice Cream Treat"]);
    return queryDemoByField("rewards", "familyId", familyId).filter(
      (r) =>
        r.active !== false &&
        !(r.id && r.id.toString().startsWith("demo-")) &&
        !defaults.has(r.title)
    );
  }
  const q = query(collection(db, "rewards"), where("familyId", "==", familyId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .filter((r) => r.active !== false);
};

export const getRewardById = async (rewardId) => {
  if (isDemoMode()) {
    return getDemoDoc("rewards", rewardId);
  }
  return getDocById("rewards", rewardId);
};

export const getPendingRedemptions = async (familyId) => {
  if (!familyId) return [];
  if (isDemoMode()) {
    return queryDemoByField("redemptions", "familyId", familyId).filter(
      (r) => r.status === "requested"
    );
  }
  const q = query(
    collection(db, "redemptions"),
    where("familyId", "==", familyId),
    where("status", "==", "requested")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const approveRedemption = async ({ redemptionId, reward, childId, familyId }) => {
  const points = reward.pointCost || reward.pointsRequired || 0;
  await setRedemptionStatus(redemptionId, "approved", { pointsSpent: points });
  if (points) {
    await addLedgerEntry({
      childId,
      familyId,
      delta: -Math.abs(points),
      reason: `Reward redemption: ${reward.title}`,
      sourceType: "reward_redemption",
      sourceId: redemptionId,
    });
  }
};

export const rejectRedemption = async (redemptionId) => {
  await setRedemptionStatus(redemptionId, "denied");
};

export const redeemReward = async ({ reward, childId, familyId }) => {
  if (!reward || !childId || !familyId) {
    throw new Error("Missing redemption details.");
  }

  const balance = await getChildPointsBalance(childId, familyId);
  if (balance < reward.pointCost) {
    throw new Error("Insufficient points for this reward.");
  }

  const requiresApproval = reward.requiresApproval;
  const pointsSpent = reward.pointCost || reward.pointsRequired || 0;

  const baseRedemption = {
    rewardId: reward.id,
    childId,
    familyId,
    status: requiresApproval ? "requested" : "fulfilled",
    pointsSpent,
  };

  const redemptionId = isDemoMode()
    ? addDemoDoc("redemptions", baseRedemption)
    : await createRedemption(baseRedemption);

  if (!requiresApproval) {
    await addLedgerEntry({
      childId,
      familyId,
      delta: -Math.abs(pointsSpent || 0),
      reason: `Reward redemption: ${reward.title}`,
      sourceType: "reward_redemption",
      sourceId: redemptionId,
    });
  }

  return redemptionId;
};
