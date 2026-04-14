import { Server, Socket } from "socket.io";
import { getRandomQuestions } from "./routes/leetcode";
import { NewQuestionsState } from "./interfaces";

const CHAT_BOT = "chatBot";

interface RoomUser {
  id: string;
  username: string;
  room: string;
  currentProblem: number;
}

export const setupSocket = (io: Server) => {
  let allUsers: RoomUser[] = [];
  const newQuestionsState: NewQuestionsState = {};

  const sendBotMessage = (room: string, message: string) => {
    io.in(room).emit("receive_message", {
      message,
      username: CHAT_BOT,
      __createdtime__: Date.now(),
    });
  };

  const getRoomUsers = (room: string) =>
    allUsers.filter((u) => u.room === room);

  const removeUser = (socket: Socket): RoomUser | undefined => {
    const user = allUsers.find((u) => u.id === socket.id);
    allUsers = allUsers.filter((u) => u.id !== socket.id);
    return user;
  };

  io.on("connection", (socket) => {
    socket.on("join_room", ({ username, room }: { username: string; room: string }) => {
      allUsers = allUsers.filter((u) => u.username !== username);
      socket.join(room);
      allUsers.push({ id: socket.id, username, room, currentProblem: 0 });

      socket.to(room).emit("receive_message", {
        message: `${username} joined the room`,
        username: CHAT_BOT,
        __createdtime__: Date.now(),
      });
      socket.emit("receive_message", {
        message: `Welcome ${username}!`,
        username: CHAT_BOT,
        __createdtime__: Date.now(),
      });

      const roomUsers = getRoomUsers(room);
      io.in(room).emit("chatroom_users", roomUsers);
    });

    socket.on("send_message", (data: any) => {
      io.in(data.room).emit("receive_message", data);
    });

    // Track which problem each user is viewing
    socket.on("problem_changed", ({ room, username, problemIndex }: { room: string; username: string; problemIndex: number }) => {
      const user = allUsers.find((u) => u.username === username);
      if (user) user.currentProblem = problemIndex;
      io.in(room).emit("chatroom_users", getRoomUsers(room));
    });

    socket.on("new_questions", async ({ room, username, mix }: { room: string; username: string; mix?: string[] }) => {
      const existing = newQuestionsState[room];
      if (existing && existing.maxResponseTime > Date.now()) return;

      const maxResponseTime = Date.now() + 10000;
      newQuestionsState[room] = { initiator: username, value: 1, maxResponseTime };

      io.in(room).emit("new_questions_request", { username, maxResponseTime, mix });

      await new Promise((r) => setTimeout(r, 10000));

      if (newQuestionsState[room]?.value > 0) {
        const questions = getRandomQuestions(room, mix);
        io.in(room).emit("update_room_questions", questions);
        sendBotMessage(room, "New questions loaded!");
      } else {
        sendBotMessage(room, "New questions request was rejected.");
      }
    });

    socket.on("new_questions_response", ({ room, username, status, time }: any) => {
      const state = newQuestionsState[room];
      if (!state || time > state.maxResponseTime) return;
      sendBotMessage(room, `${username} ${status}ed the new questions request`);
      state.value += status === "accept" ? 1 : -1;
    });

    socket.on("disconnecting", () => {
      const user = removeUser(socket);
      if (!user) return;
      socket.to(user.room).emit("receive_message", {
        message: `${user.username} left the room`,
        username: CHAT_BOT,
        __createdtime__: Date.now(),
      });
      socket.to(user.room).emit("chatroom_users", getRoomUsers(user.room));
    });
  });

  return { sendBotMessage };
};
