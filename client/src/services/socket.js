<<<<<<< HEAD
import { io } from "socket.io-client";
import { BACKEND_URL } from "../config";

export const socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnectionAttempts: 5,
=======
import io from "socket.io-client";
import { BACKEND_URL } from "../config";

export const socket = io(BACKEND_URL, {
  extraHeaders: { "ngrok-skip-browser-warning": "true" },
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
});
