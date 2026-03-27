export const hashPin = async (pin) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    // Fallback simple hash
    return btoa(pin).slice(0, 32);
  }
};
