import { BACKEND_URL } from "../config";

export const getProblemDetails = async (problemSlug) => {
  const res = await fetch(`${BACKEND_URL}/leetcode/problem/${problemSlug}/`, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "69420",
    },
  });
  return await res.json();
};

export const getSnippets = async (problemSlug) => {
  const res = await fetch(`${BACKEND_URL}/leetcode/problem/${problemSlug}/`, {
    method: "GET",
    headers: {
      "ngrok-skip-browser-warning": "69420",
    },
  });
  return await res.json();
};

export const submitCode = async (data) => {
  const res = await fetch(`${BACKEND_URL}/leetcode/submit-code/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "ngrok-skip-browser-warning": "69420",
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};

export const runCode = async (data) => {
  const res = await fetch(`${BACKEND_URL}/leetcode/run-code/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "ngrok-skip-browser-warning": "69420",
    },
    body: JSON.stringify(data),
  });
  return await res.json();
}