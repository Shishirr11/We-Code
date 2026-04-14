import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import authRoutes from "./routes/auth";
import leetcodeRoutes from "./routes/leetcode";
import { setupSocket } from "./socket";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:5173", methods: ["GET", "POST"] },
});

const { sendBotMessage } = setupSocket(io);
app.set("sendBotMessage", sendBotMessage);

app.use("/auth", authRoutes);
app.use("/leetcode", leetcodeRoutes);

app.get("/", (_req, res) => res.send("WeCodes server running"));

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));