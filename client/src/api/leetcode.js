import { BACKEND_URL } from "../config";

const headers = { "Content-Type": "application/json" };

export const getProblemDetails = async (slug) => {
  const res = await fetch(`${BACKEND_URL}/leetcode/problem/${slug}/`, { headers });
  return res.json();
};

export const getRoomProblems = async (room) => {
  const res = await fetch(`${BACKEND_URL}/leetcode/room-problems/${room}`, { headers });
  return res.json();
};

export const runCode = async (data) => {
  const res = await fetch(`${BACKEND_URL}/leetcode/run`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return res.json();
};

export const submitCode = async (data) => {
  const res = await fetch(`${BACKEND_URL}/leetcode/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return res.json();
};
