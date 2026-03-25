export const isDemoMode = () => {
  const envFlag = import.meta.env.VITE_DEMO_MODE;
  const explicitDemo =
    envFlag === true ||
    envFlag === "true" ||
    envFlag === "1" ||
    envFlag === "yes" ||
    envFlag === "on";

  if (explicitDemo) return true;

  return false;
};
