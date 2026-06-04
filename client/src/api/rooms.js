import { BACKEND_URL } from "../config";

const headers = { "Content-Type": "application/json" };

export const createRoom = async (data) => {
  const res = await fetch(`${BACKEND_URL}/rooms`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getPublicRooms = async () => {
  const res = await fetch(`${BACKEND_URL}/rooms`, { headers });
  return res.json();
};

export const getRoomById = async (id) => {
  const res = await fetch(`${BACKEND_URL}/rooms/${id}`, { headers });
  return res.json();
};
