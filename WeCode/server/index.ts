import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getRandomQuestions, leetcodeRoutes } from "./routes/leetcodeRoutes";
import { Server, ServerOptions, Socket } from "socket.io";
import http from "http";
import { addTokens, healthCheck } from "./controllers/userFuncs/tokenData";
import { NewQuesstionsObj } from "./interfaces";
import { isSessionTokenValid } from "./controllers/userFuncs/auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const mongoURL: string = process.env.MONGODB_URL ? process.env.MONGODB_URL : "";
app.use(express.json());
const options: cors.CorsOptions = {
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "X-Access-Token",
  ],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: "http://localhost:8080",
  preflightContinue: false,
};
app.use(cors());

app.use("/leetcode", leetcodeRoutes);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Server is running perfectly!");
});

app.post("/auth/updateTokens", async (req: Request, res: Response) => {
  const { csrfToken, session } = req.body;
  const response = await addTokens(csrfToken, session);
  res.send(response);
});

app.post("/checkUser", async (req: Request, res: Response) => {
  // console.log("user touched");
  const { username, sessionToken } = req.body;
  const tokensHealth = await healthCheck(username);
  const sessionValidity = isSessionTokenValid(username, sessionToken);
  res.send(tokensHealth && sessionValidity);
});

const CHAT_BOT = "chatBot";
let chatRoom = "";
let allUsers: Array<any> = [];
// const room = "myRoom";

const filterSocketConnections = (socket: Socket, username: String) => {
  // console.log("before filtering", allUsers);
  allUsers = allUsers.filter((user) => user.username !== username);
  // console.log("after filtering", allUsers);
};

export const sendMessageFromBot = (room: string, message: String) => {
  const __createdtime__ = Date.now();
  const data = { message, username: CHAT_BOT, __createdtime__, room };
  // console.log(data);
  // console.log(io.in(room));

  const socketsInRoom = io.sockets.adapter.rooms.get(room);

  io.in(room).emit("receive_message", data);
};

const removeUserFromRoom = (socket: Socket) => {
  // console.log("all users", allUsers, socket.id);
  const userDetails = allUsers.find((user) => user.id === socket.id);
  allUsers = allUsers.filter((user) => user.id !== socket.id);
  return userDetails;
};

const disconnectUser = (socket: Socket) => {
  const userDetails = removeUserFromRoom(socket);
  if (!userDetails) return;
  const { username, room } = userDetails;

  let __createdtime__ = Date.now();
  socket.to(room).emit("receive_message", {
    message: `${username} has exited the room`,
    username: CHAT_BOT,
    __createdtime__,
  });

  let chatRoomUsers = allUsers.filter((user: any) => user.room === room);
  socket.to(room).emit("chatroom_users", chatRoomUsers);
};

const newQuesstionsObj: NewQuesstionsObj = {};
/*
{
  initiator: string,
  maxResponseTime: number,
  value: number,
}
*/

io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    const { username, room } = data;
    console.log(`User ${username} joined ${socket.id}`);
    socket.join(room);

    let __createdtime__ = Date.now(); // Current timestamp
    // Send message to all users currently in the room, apart from the user that just joined
    socket.to(room).emit("receive_message", {
      message: `${username} has joined the chat room`,
      username: CHAT_BOT,
      __createdtime__,
    });
    // console.log("sending welcome message");
    socket.emit("receive_message", {
      message: `Welcome ${username}`,
      username: CHAT_BOT,
      __createdtime__,
    });
    filterSocketConnections(socket, username);
    chatRoom = room;
    allUsers.push({ id: socket.id, username, room });
    // console.log("all users after addition", allUsers);
    let chatRoomUsers = allUsers.filter((user: any) => user.room === room);
    socket.to(room).emit("chatroom_users", chatRoomUsers);
    socket.emit("chatroom_users", chatRoomUsers);
  });

  socket.on("send_message", (data) => {
    const { message, username, __createdtime__, room } = data;
    io.in(room).emit("receive_message", data); // Send to all users in room, including sender
  });

  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  socket.on("new_questions", async (data, callback) => { 
    const { room, username } = data;
    if (
      !newQuesstionsObj?.room ||
      newQuesstionsObj.room.maxResponseTime < Date.now()
    ) {
      newQuesstionsObj[room] = {
        initiator: username,
        value: 1,
        maxResponseTime: Date.now() + 10000,
      };
      io.in(room).emit("new_questions_request", {
        username,
        maxResponseTime: newQuesstionsObj[room].maxResponseTime,
      });
      await sleep(10000);
      if (newQuesstionsObj[room].value > 0) {
        const newQuestions = getRandomQuestions(room);
        io.in(room).emit("update_room_questions", newQuestions);
      }
    }
  });

  socket.on("new_questions_response", (data) => {
    const { username, room, status, time } = data;
    let __createdtime__ = Date.now();
    if (time <= newQuesstionsObj.room.maxResponseTime) {
      socket.to(room).emit("receive_message", {
        message: `${username} has ${status}ed new questions request`,
        __createdtime__,
        username: CHAT_BOT,
      });
      if (status === "accept") {
        newQuesstionsObj[room].value += 1;
      } else {
        newQuesstionsObj[room].value -= 1;
      }
    }
  });

  socket.once("disconnecting", (reason) => {
    disconnectUser(socket);
    socket.disconnect(true);
  });

  socket.on("end", () => {
    disconnectUser(socket);
    socket.disconnect();
  });
});

try {
  httpServer.listen(port, (): void => {
    console.log(`Server is running at http://localhost:${port}`);
  });
} catch (err) {
  console.log(err);
}
