import io from "socket.io-client";
import { BACKEND_URL } from "../config";

export const socket = io(BACKEND_URL, {
  extraHeaders: { "ngrok-skip-browser-warning": "true" },
});
