export const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
};

export const getEndOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
};

export const formatTimestamp = (value) => {
  if (!value) return "";
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString();
  }
  return new Date(value).toLocaleString();
};
