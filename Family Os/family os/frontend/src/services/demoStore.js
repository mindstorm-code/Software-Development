const STORAGE_KEY = "familyos_demo_store_v1";

const defaultStore = {
  users: [
    {
      id: "demo-parent",
      email: "parent@example.com",
      displayName: "Demo Parent",
      role: "parent",
      familyId: "demo-family",
    },
    {
      id: "demo-child",
      email: "kid@example.com",
      displayName: "Demo Kid",
      role: "child",
      familyId: "demo-family",
      pinHash: "",
      pinResetRequired: false,
    },
  ],
  families: [
    {
      id: "demo-family",
      name: "Demo Family",
      parentIds: ["demo-parent"],
      childIds: ["demo-child"],
      settings: {
        leaderboardEnabled: true,
        aiDefaultEnabled: false,
        reminderSettings: {},
      },
    },
  ],
  chores: [
    {
      id: "demo-chore-1",
      familyId: "demo-family",
      assignedChildId: "demo-child",
      title: "Make the bed",
      description: "Smooth the sheets and straighten pillows.",
      checklist: ["Sheets tucked", "Pillows aligned"],
      pointValue: 10,
      difficulty: "easy",
      recurrence: "daily",
      recurrenceConfig: { dayOfWeek: 1, dayOfMonth: 1, month: 0 },
      proofRequired: true,
      proofType: "photo_and_checklist",
      aiVerificationEnabled: false,
      parentApprovalRequired: true,
      active: true,
      createdBy: "demo-parent",
      createdAt: new Date().toISOString(),
      beforeImageUrl: "",
      afterImageUrl: "",
    },
  ],
  choreInstances: [],
  submissions: [],
  rewards: [
    {
      id: "demo-reward-1",
      familyId: "demo-family",
      title: "Movie night pick",
      description: "Choose the Friday movie.",
      pointCost: 50,
      category: "family",
      active: true,
    },
  ],
  redemptions: [],
  pointsLedger: [
    {
      id: "seed-ledger",
      childId: "demo-child",
      familyId: "demo-family",
      delta: 20,
      reason: "Welcome bonus",
      sourceType: "manual_adjustment",
      sourceId: "seed",
      createdAt: new Date().toISOString(),
    },
  ],
  coupons: [
    {
      id: "demo-coupon-1",
      familyId: "demo-family",
      title: "Ice Cream Coupon",
      description: "One scoop at the local shop.",
      pointCost: 40,
      imageUrl: "",
      createdAt: new Date().toISOString(),
    },
  ],
};

const loadStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultStore };
    const parsed = JSON.parse(raw);
    return { ...defaultStore, ...parsed };
  } catch {
    return { ...defaultStore };
  }
};

const saveStore = (store) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage failures
  }
};

let inMemoryStore = loadStore();

const genId = (prefix) =>
  `${prefix || "id"}-${Math.random().toString(36).slice(2, 9)}-${Date.now()}`;

export const resetDemoStore = () => {
  inMemoryStore = loadStore();
  saveStore(inMemoryStore);
};

export const getCollection = (name) => {
  return inMemoryStore[name] || [];
};

export const setCollection = (name, value) => {
  inMemoryStore[name] = value;
  saveStore(inMemoryStore);
};

export const addDemoDoc = (collectionName, data, id) => {
  const collection = getCollection(collectionName);
  const newId = id || genId(collectionName);
  const doc = { ...data, id: newId };
  setCollection(collectionName, [...collection, doc]);
  return newId;
};

export const updateDemoDoc = (collectionName, id, data) => {
  const collection = getCollection(collectionName);
  const updated = collection.map((item) =>
    item.id === id ? { ...item, ...data } : item
  );
  setCollection(collectionName, updated);
};

export const getDemoDoc = (collectionName, id) => {
  const collection = getCollection(collectionName);
  return collection.find((item) => item.id === id) || null;
};

export const deleteDemoDoc = (collectionName, id) => {
  const collection = getCollection(collectionName);
  const filtered = collection.filter((item) => item.id !== id);
  setCollection(collectionName, filtered);
};

export const queryDemoByField = (collectionName, field, value) => {
  const collection = getCollection(collectionName);
  return collection.filter((item) => item[field] === value);
};

export const queryDemoByFields = (collectionName, filters = []) => {
  return getCollection(collectionName).filter((item) =>
    filters.every(([field, value, op]) => {
      if (op === ">=") return item[field] >= value;
      if (op === "<=") return item[field] <= value;
      return item[field] === value;
    })
  );
};
