import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseApp";
import { isDemoMode } from "../utils/mode";
import {
  addDemoDoc,
  getDemoDoc,
  queryDemoByField,
  updateDemoDoc,
} from "./demoStore";

export const createDoc = async (collectionName, data, docId) => {
  if (isDemoMode()) {
    return addDemoDoc(collectionName, data, docId);
  }
  const payload = { ...data, createdAt: serverTimestamp() };
  if (docId) {
    await setDoc(doc(db, collectionName, docId), payload, { merge: true });
    return docId;
  }
  const ref = await addDoc(collection(db, collectionName), payload);
  return ref.id;
};

export const updateDocById = async (collectionName, docId, data) => {
  if (isDemoMode()) {
    updateDemoDoc(collectionName, docId, data);
    return;
  }
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const getDocById = async (collectionName, docId) => {
  if (isDemoMode()) {
    return getDemoDoc(collectionName, docId);
  }
  const snapshot = await getDoc(doc(db, collectionName, docId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

export const getCollectionByField = async (collectionName, field, value) => {
  if (isDemoMode()) {
    return queryDemoByField(collectionName, field, value);
  }
  const q = query(collection(db, collectionName), where(field, "==", value));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
};

export const createUserProfile = async (uid, data) => {
  return createDoc("users", data, uid);
};

export const getUserProfile = async (uid) => {
  return getDocById("users", uid);
};
