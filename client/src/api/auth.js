import { BACKEND_URL } from "../config";

export const connectLeetCode = async (csrfToken, session) => {
  const res = await fetch(`${BACKEND_URL}/auth/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csrfToken, session }),
  });
  return res.json();
};

export const validateUser = async (username, sessionToken) => {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, sessionToken }),
    });
    return res.json();
  } catch {
    return false;
  }
};
