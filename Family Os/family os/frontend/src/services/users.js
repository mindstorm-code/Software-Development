import { collection, doc, getDocs, query, updateDoc, where, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseApp";
import { createUserProfile, getUserProfile, createDoc } from "./firestore";
import { createFamily } from "./families";
import { isDemoMode } from "../utils/mode";
import {
  addDemoDoc,
  getDemoDoc,
  queryDemoByField,
  updateDemoDoc,
  deleteDemoDoc,
} from "./demoStore";
import { hashPin } from "../utils/pin";

const VALID_ROLES = ["parent", "child"];

export const ensureUserProfile = async (user) => {
  if (!user) {
    return { profile: null, error: null };
  }

  let profile = isDemoMode()
    ? getDemoDoc("users", user.uid)
    : await getUserProfile(user.uid);

  if (!profile) {
    // TODO: when parents create child accounts, set role to "child".
    const defaultRole = "parent";
    const baseProfile = {
      email: user.email || "",
      displayName: user.displayName || "Parent",
      role: defaultRole,
      familyId: null,
    };
    if (isDemoMode()) {
      addDemoDoc("users", baseProfile, user.uid);
    } else {
      await createUserProfile(user.uid, baseProfile);
    }
    profile = { id: user.uid, ...baseProfile };
  }

  if (!VALID_ROLES.includes(profile.role)) {
    return { profile, error: "missing_role" };
  }

  if (!profile.familyId) {
    if (profile.role === "parent") {
      const familyId = isDemoMode()
        ? addDemoDoc("families", {
            name: `${profile.displayName || "Family"}'s Home`,
            parentIds: [user.uid],
            childIds: [],
            settings: { leaderboardEnabled: true, aiDefaultEnabled: false, reminderSettings: {} },
          })
        : await createFamily({
            name: `${profile.displayName || "Family"}'s Home`,
            parentId: user.uid,
          });
      if (isDemoMode()) {
        updateDemoDoc("users", user.uid, { familyId });
      } else {
        await updateDoc(doc(db, "users", user.uid), { familyId });
      }
      profile = { ...profile, familyId };
    } else {
      return { profile, error: "missing_family" };
    }
  }

  return { profile, error: null };
};

export const getChildrenByFamily = async (familyId) => {
  if (!familyId) return [];
  if (isDemoMode()) {
    return queryDemoByField("users", "familyId", familyId).filter(
      (u) => u.role === "child"
    );
  }
  const q = query(
    collection(db, "users"),
    where("familyId", "==", familyId),
    where("role", "==", "child")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const updateUserPin = async ({ userId, pinHash, pinResetRequired }) => {
  if (isDemoMode()) {
    updateDemoDoc("users", userId, { pinHash, pinResetRequired });
    return;
  }
  await updateDoc(doc(db, "users", userId), { pinHash, pinResetRequired });
};

export const findUserByPin = async (pin) => {
  const hashed = await hashPin(pin);
  if (isDemoMode()) {
    const users = queryDemoByField("users", "pinHash", hashed);
    return users[0] || null;
  }
  const q = query(collection(db, "users"), where("pinHash", "==", hashed));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

export const findChildByPin = async (familyId, pinHash) => {
  if (isDemoMode()) {
    return queryDemoByField("users", "familyId", familyId).find(
      (u) => u.role === "child" && u.pinHash === pinHash
    );
  }
  const q = query(
    collection(db, "users"),
    where("familyId", "==", familyId),
    where("role", "==", "child"),
    where("pinHash", "==", pinHash)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

export const createChildUser = async ({ displayName, pinHash, familyId }) => {
  if (isDemoMode()) {
    return addDemoDoc("users", {
      displayName,
      role: "child",
      familyId,
      pinHash,
      createdAt: new Date().toISOString(),
    });
  }
  return createDoc("users", {
    displayName,
    role: "child",
    familyId,
    pinHash,
    createdAt: new Date().toISOString(),
  });
};

export const updateUserProfileFields = async (userId, data) => {
  if (isDemoMode()) {
    updateDemoDoc("users", userId, data);
    return;
  }
  await updateDoc(doc(db, "users", userId), data);
};

export const updateChildProfile = async (userId, { displayName, age, ageGroup, skillLevel, photoUrl }) => {
  const payload = { displayName, age, ageGroup, skillLevel, photoUrl };
  if (isDemoMode()) {
    updateDemoDoc("users", userId, payload);
    return;
  }
  await updateDoc(doc(db, "users", userId), payload);
};

export const deleteChildUser = async (userId) => {
  if (isDemoMode()) {
    deleteDemoDoc("users", userId);
    return;
  }
  await deleteDoc(doc(db, "users", userId));
};
