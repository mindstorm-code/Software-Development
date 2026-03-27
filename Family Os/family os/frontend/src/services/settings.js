import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseApp";
import { isDemoMode } from "../utils/mode";
import { addDemoDoc, getDemoDoc, updateDemoDoc } from "./demoStore";

const DEFAULT_RATE = 0.01; // dollars per point

export const getPointsToDollarRate = async (familyId) => {
  if (!familyId) return DEFAULT_RATE;
  if (isDemoMode()) {
    const settings = getDemoDoc("settings", familyId);
    return settings?.pointsToDollarRate ?? DEFAULT_RATE;
  }
  const ref = doc(db, "settings", familyId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return DEFAULT_RATE;
  return snap.data().pointsToDollarRate ?? DEFAULT_RATE;
};

export const savePointsToDollarRate = async (familyId, rate) => {
  if (!familyId) return;
  if (isDemoMode()) {
    const existing = getDemoDoc("settings", familyId);
    if (existing) {
      updateDemoDoc("settings", familyId, { pointsToDollarRate: rate });
    } else {
      addDemoDoc("settings", { pointsToDollarRate: rate }, familyId);
    }
    return;
  }
  await setDoc(doc(db, "settings", familyId), { pointsToDollarRate: rate }, { merge: true });
};

export const calculatePoints = (usdValue, rate = DEFAULT_RATE) => {
  const safeUsd = Number(usdValue) || 0;
  const safeRate = rate || DEFAULT_RATE;
  if (safeRate <= 0) return 0;
  return Math.round(safeUsd / safeRate);
};

export const pointsToDollar = (points, rate = DEFAULT_RATE) => {
  const p = Number(points) || 0;
  const safeRate = rate || DEFAULT_RATE;
  return +(p * safeRate).toFixed(2);
};
