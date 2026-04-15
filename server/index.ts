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

const allowedOrigins = [
  "https://we-code-tau.vercel.app",
  "https://we-code-dh8m2r7mk-shishirr11s-projects.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin === "http://localhost:5173") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origin.endsWith(".vercel.app") || origin === "http://localhost:5173") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  },
});

const { sendBotMessage } = setupSocket(io);
app.set("sendBotMessage", sendBotMessage);

app.use("/auth", authRoutes);
app.use("/leetcode", leetcodeRoutes);

app.get("/", (_req, res) => res.send("WeCodes server running"));

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));