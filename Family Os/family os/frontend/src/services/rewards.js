import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseApp";
import { createDoc, getDocById, updateDocById } from "./firestore";
import { addLedgerEntry, getChildPointsBalance } from "./pointsLedger";
import { isDemoMode } from "../utils/mode";
import { addDemoDoc, getDemoDoc, queryDemoByField } from "./demoStore";

export const createReward = async (payload) => {
  return createDoc("rewards", payload);
};

export const updateReward = async (rewardId, payload) => {
  return updateDocById("rewards", rewardId, payload);
};

export const createRedemption = async (payload) => {
  return createDoc("redemptions", payload);
};

export const getRewardsByFamily = async (familyId) => {
  if (!familyId) return [];
  if (isDemoMode()) {
    return queryDemoByField("rewards", "familyId", familyId).filter((r) => r.active !== false);
  }
  const q = query(
    collection(db, "rewards"),
    where("familyId", "==", familyId),
    where("active", "==", true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const getRewardById = async (rewardId) => {
  if (isDemoMode()) {
    return getDemoDoc("rewards", rewardId);
  }
  return getDocById("rewards", rewardId);
};

export const redeemReward = async ({ reward, childId, familyId }) => {
  if (!reward || !childId || !familyId) {
    throw new Error("Missing redemption details.");
  }

  const balance = await getChildPointsBalance(childId, familyId);
  if (balance < reward.pointCost) {
    throw new Error("Insufficient points for this reward.");
  }

  const redemptionId = isDemoMode()
    ? addDemoDoc("redemptions", {
        rewardId: reward.id,
        childId,
        familyId,
        status: "requested",
        pointsSpent: reward.pointCost,
      })
    : await createRedemption({
        rewardId: reward.id,
        childId,
        familyId,
        status: "requested",
        pointsSpent: reward.pointCost,
      });

  await addLedgerEntry({
    childId,
    familyId,
    delta: -Math.abs(reward.pointCost || 0),
    reason: `Reward redemption: ${reward.title}`,
    sourceType: "reward_redemption",
    sourceId: redemptionId,
  });

  return redemptionId;
};
