import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase/firebaseApp";
import { createUserProfile, getUserProfile } from "./firestore";
import { createFamily } from "./families";
import { isDemoMode } from "../utils/mode";
import {
  addDemoDoc,
  getDemoDoc,
  queryDemoByField,
  updateDemoDoc,
} from "./demoStore";

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
