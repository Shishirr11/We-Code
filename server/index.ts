import "dotenv/config";

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth";
import leetcodeRoutes from "./routes/leetcode";
import roomRoutes from "./routes/rooms";
import { setupSocket } from "./socket";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

const app = express();
const httpServer = http.createServer(app);

const allowedOrigins = [
  "https://we-code-tau.vercel.app",
  "http://localhost:5173",
];

const originFn = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  if (
    !origin ||
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app")
  ) {
    callback(null, true);
  } else {
    callback(new Error("Not allowed by CORS"));
  }
};

app.use(cors({ origin: originFn }));
app.use(express.json());

const io = new Server(httpServer, {
  cors: { origin: originFn, methods: ["GET", "POST"] },
});

const { sendBotMessage } = setupSocket(io);
app.set("sendBotMessage", sendBotMessage);

app.use("/auth",     authRoutes);
app.use("/leetcode", leetcodeRoutes);
app.use("/rooms",    roomRoutes);

app.get("/", (_req, res) => res.send("WeCodes server running"));

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);