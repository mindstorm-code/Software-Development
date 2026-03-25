import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, firebaseConfigMissing, firebaseInitError } from "../firebase/firebaseApp";
import { createUserProfile } from "../services/firestore";
import { ensureUserProfile } from "../services/users";
import { isDemoMode } from "../utils/mode";

const AuthContext = createContext(null);
const VALID_ROLES = ["parent", "child"];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (isDemoMode()) {
      const demoUser = { uid: "demo-parent", email: "parent@example.com" };
      setUser(demoUser);
      setRole("parent");
      setProfile({
        id: "demo-parent",
        email: demoUser.email,
        displayName: "Demo Parent",
        role: "parent",
        familyId: "demo-family",
      });
      setFamilyId("demo-family");
      setAuthError("");
      setLoading(false);
      console.log("[Auth] Demo mode active: auto parent login");
      return undefined;
    }

    if (firebaseConfigMissing || firebaseInitError || !auth) {
      setAuthError("firebase_init");
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setProfile(null);
        setFamilyId(null);
        setAuthError("");
        setLoading(false);
        console.log("[Auth] No user session");
        return;
      }

      setUser(firebaseUser);
      console.log("[Auth] User loaded:", firebaseUser.uid);
      try {
        const { profile: ensuredProfile, error } = await ensureUserProfile(firebaseUser);

        if (error) {
          setAuthError(error);
        } else {
          setAuthError("");
        }

        if (ensuredProfile) {
          const safeRole = VALID_ROLES.includes(ensuredProfile.role)
            ? ensuredProfile.role
            : null;
          setProfile(ensuredProfile);
          setRole(safeRole);
          setFamilyId(ensuredProfile.familyId || null);
          console.log("[Auth] Role resolved:", safeRole);
          if (ensuredProfile.createdAt === undefined) {
            console.log("[Auth] Profile missing on first load, created in ensureUserProfile");
          }
        } else {
          setProfile(null);
          setRole(null);
          setFamilyId(null);
          console.log("[Auth] Profile missing and not created");
        }
      } catch (err) {
        setAuthError("profile_error");
        console.error("[Auth] Profile load error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async ({ email, password }) => {
    if (isDemoMode()) {
      const isChild = email?.toLowerCase().includes("child") || email?.toLowerCase().includes("kid");
      const demoUser = { uid: isChild ? "demo-child" : "demo-parent", email };
      setUser(demoUser);
      setRole(isChild ? "child" : "parent");
      setFamilyId("demo-family");
      setProfile({
        id: demoUser.uid,
        email,
        displayName: isChild ? "Demo Kid" : "Demo Parent",
        role: isChild ? "child" : "parent",
        familyId: "demo-family",
      });
      return demoUser;
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("[Auth] Login with Firebase:", result.user.uid);
    return result.user;
  };

  const signupParent = async ({ email, password, displayName }) => {
    if (isDemoMode()) {
      const demoUser = { uid: "demo-parent", email };
      setUser(demoUser);
      setRole("parent");
      setFamilyId("demo-family");
      setProfile({
        id: "demo-parent",
        email,
        displayName: displayName || "Demo Parent",
        role: "parent",
        familyId: "demo-family",
      });
      return demoUser;
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user.uid, {
      email,
      displayName,
      role: "parent",
    });
    console.log("[Auth] Signup parent created profile:", result.user.uid);
    return result.user;
  };

  const logout = async () => {
    if (isDemoMode()) {
      setUser(null);
      setRole(null);
      setProfile(null);
      setFamilyId(null);
      return;
    }
    await signOut(auth);
    console.log("[Auth] Logged out");
  };

  const value = useMemo(
    () => ({
      user,
      role,
      profile,
      familyId,
      loading,
      authError,
      login,
      signupParent,
      logout,
      setRole,
      setProfile,
    }),
    [user, role, profile, familyId, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
