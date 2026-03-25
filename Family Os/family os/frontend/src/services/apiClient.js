const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.error || "API request failed.";
    throw new Error(message);
  }

  return response.json();
};
