import { io } from "socket.io-client";
import { BACKEND_URL } from "../config";
export const socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
});
