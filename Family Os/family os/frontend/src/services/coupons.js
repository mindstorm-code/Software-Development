import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseApp";
import { createDoc, updateDocById } from "./firestore";
import { isDemoMode } from "../utils/mode";
import { addDemoDoc, queryDemoByField, updateDemoDoc } from "./demoStore";
import { calculatePoints } from "./settings";

export const createCoupon = async (payload) => {
  if (isDemoMode()) {
    return addDemoDoc("coupons", payload);
  }
  return createDoc("coupons", payload);
};

export const updateCoupon = async (id, payload) => {
  return updateDocById("coupons", id, payload);
};

export const recalcCouponPoints = async (coupon, rate) => {
  const pointsCost = calculatePoints(coupon.usdValue, rate);
  const updated = {
    pointsCost,
    lastCalculatedAt: new Date().toISOString(),
  };
  if (isDemoMode()) {
    updateDemoDoc("coupons", coupon.id, updated);
    return updated;
  }
  await updateDoc(doc(db, "coupons", coupon.id), updated);
  return updated;
};

export const getCouponsByFamily = async (familyId) => {
  if (!familyId) return [];
  if (isDemoMode()) {
    return queryDemoByField("coupons", "familyId", familyId).filter(
      (c) => !(c.id && c.id.toString().startsWith("demo-"))
    );
  }
  const q = query(collection(db, "coupons"), where("familyId", "==", familyId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};
