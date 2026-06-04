import { Server, Socket } from "socket.io";
import { getRandomQuestions } from "./routes/leetcode";
import { NewQuestionsState } from "./interfaces";
import { getCredentials } from "./services/userService";
import {
  getRoom,
  getAllPublicRooms,
  isUserInRoom,
  requestJoin,
  respondToRequest,
  kickMember,
  leaveRoom,
} from "./services/roomService";

const CHAT_BOT = "chatBot";
const DISCONNECT_GRACE_MS = 30_000;

interface RoomUser {
  id: string;
  username: string;
  room: string;
  currentProblem: number;
}

export const setupSocket = (io: Server) => {
  let allUsers: RoomUser[] = [];
  const newQuestionsState: NewQuestionsState = {};

  const userSocketMap = new Map<string, string>(); // username → socketId
  const socketUserMap = new Map<string, string>(); // socketId → username

  const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const sendBotMessage = (room: string, message: string) => {
    io.in(room).emit("receive_message", {
      message,
      username: CHAT_BOT,
      __createdtime__: Date.now(),
    });
  };

  const getRoomUsers   = (room: string) => allUsers.filter((u) => u.room === room);
  const broadcastRooms = () => io.emit("rooms_updated", getAllPublicRooms());

  const registerSocket = (username: string, socketId: string) => {
    const oldSocketId = userSocketMap.get(username);
    if (oldSocketId && oldSocketId !== socketId) socketUserMap.delete(oldSocketId);

    userSocketMap.set(username, socketId);
    socketUserMap.set(socketId, username);
  };

  const unregisterBySocketId = (socketId: string) => {
    const username = socketUserMap.get(socketId);
    if (username) userSocketMap.delete(username);
    socketUserMap.delete(socketId);
  };

  const cancelDisconnectTimer = (username: string) => {
    const t = disconnectTimers.get(username);
    if (t) { clearTimeout(t); disconnectTimers.delete(username); }
  };

  const removeUserBySocket = (socket: Socket): RoomUser | undefined => {
    const user = allUsers.find((u) => u.id === socket.id);
    allUsers   = allUsers.filter((u) => u.id !== socket.id);
    return user;
  };

  io.on("connection", (socket) => {

    socket.on("get_rooms", () => {
      socket.emit("rooms_list", getAllPublicRooms());
    });


    socket.on("join_room", ({ username, room }: { username: string; room: string }) => {
      if (!isUserInRoom(username, room)) {
        socket.emit("join_error", { message: "Not a member of this room" });
        return;
      }
      cancelDisconnectTimer(username);

      registerSocket(username, socket.id);

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

      io.in(room).emit("chatroom_users", getRoomUsers(room));
      broadcastRooms();
    });

    socket.on("join_request", ({ roomId, username }: { roomId: string; username: string }) => {
      registerSocket(username, socket.id);

      const result = requestJoin(roomId, username);
      if (!result.success) {
        socket.emit("join_request_error", { message: result.error });
        return;
      }

      socket.emit("join_requested", { roomId });

      const room = getRoom(roomId);
      if (room) {
        const hostSocketId =
          userSocketMap.get(room.host) ??
          allUsers.find((u) => u.username === room.host)?.id;

        if (hostSocketId) {
          io.to(hostSocketId).emit("new_join_request", {
            roomId,
            username,
            roomName: room.name,
          });
        }
      }
    });

    socket.on("host_respond", ({
      roomId,
      targetUsername,
      approve,
    }: {
      roomId: string;
      targetUsername: string;
      approve: boolean;
    }) => {
      const requesterUsername = socketUserMap.get(socket.id);
      const room = getRoom(roomId);
      if (!requesterUsername || !room || room.host !== requesterUsername) return;

      const result = respondToRequest(roomId, targetUsername, approve);
      if (!result.success) return;

      const targetSocketId = userSocketMap.get(targetUsername);
      if (targetSocketId) {
        io.to(targetSocketId).emit(
          approve ? "join_approved" : "join_rejected",
          { roomId, roomName: room.name }
        );
      }

      if (approve && result.room) {
        io.in(roomId).emit("room_member_update", {
          members:         result.room.members,
          pendingRequests: result.room.pendingRequests,
        });
      }

      broadcastRooms();
    });

    socket.on("kick_member", ({
      roomId,
      targetUsername,
    }: {
      roomId: string;
      targetUsername: string;

    }) => {

      const requesterUsername = socketUserMap.get(socket.id);
      if (!requesterUsername) return;

      const result = kickMember(roomId, targetUsername, requesterUsername);
      if (!result.success) return;

      const targetSocketId = userSocketMap.get(targetUsername);
      if (targetSocketId) {
        io.to(targetSocketId).emit("you_were_kicked", { roomId });
      }

      sendBotMessage(roomId, `${targetUsername} was removed from the room.`);
      allUsers = allUsers.filter((u) => u.username !== targetUsername);
      io.in(roomId).emit("chatroom_users", getRoomUsers(roomId));

      const room = getRoom(roomId);
      if (room) {
        io.in(roomId).emit("room_member_update", {
          members:         room.members,
          pendingRequests: room.pendingRequests,
        });
      }

      broadcastRooms();
    });


    socket.on("leave_room", ({ roomId, username }: { roomId: string; username: string }) => {
      const actualUsername = socketUserMap.get(socket.id);
      if (actualUsername !== username) return;

      cancelDisconnectTimer(username);

      const result = leaveRoom(roomId, username);
      allUsers = allUsers.filter((u) => u.username !== username);
      unregisterBySocketId(socket.id);
      socket.leave(roomId);

      if (result.dissolved) {
        io.in(roomId).emit("room_dissolved", {
          message: `${username} (host) left. The room has been closed.`,
        });
      } else {
        sendBotMessage(roomId, `${username} left the room.`);
        io.in(roomId).emit("chatroom_users", getRoomUsers(roomId));
        const room = getRoom(roomId);
        if (room) {
          io.in(roomId).emit("room_member_update", {
            members:         room.members,
            pendingRequests: room.pendingRequests,
          });
        }
      }

      broadcastRooms();
    });


    socket.on("send_message", (data: any) => {

      const sender = allUsers.find((u) => u.id === socket.id && u.room === data.room);
      if (!sender) return;

      io.in(data.room).emit("receive_message", data);
    });


    socket.on("problem_changed", ({
      room,
      username,
      problemIndex,
    }: {
      room: string;
      username: string;
      problemIndex: number;
    }) => {
      const user = allUsers.find((u) => u.username === username && u.room === room);
      if (user) user.currentProblem = problemIndex;
      io.in(room).emit("chatroom_users", getRoomUsers(room));
    });


    socket.on("new_questions", async ({
      room,
      username,
      mix,
    }: {
      room: string;
      username: string;
      mix?: string[];
    }) => {
      const existing = newQuestionsState[room];
      if (existing && existing.maxResponseTime > Date.now()) return;

      const maxResponseTime = Date.now() + 10000;
      newQuestionsState[room] = { initiator: username, value: 0, maxResponseTime };

      io.in(room).emit("new_questions_request", { username, maxResponseTime, mix });

      await new Promise((r) => setTimeout(r, 10000));

      const state     = newQuestionsState[room];
      const roomUsers = getRoomUsers(room);
      const others    = roomUsers.filter((u) => u.username !== username);
      const accept    = others.length === 0 || (state?.value ?? 0) > 0;

      if (accept) {
        const roomData = getRoom(room);
        const topics   = roomData?.topics ?? [];
        const credit   = await getCredentials(username).catch(() => undefined);

        const questions = await getRandomQuestions(
          room,
          mix,
          topics,
          credit ?? undefined
        );

        io.in(room).emit("update_room_questions", questions);
        sendBotMessage(room, "New questions loaded! 🚀");
      } else {
        sendBotMessage(room, "New questions request was rejected.");
      }

      delete newQuestionsState[room];
    });

    socket.on("new_questions_response", ({ room, username, status, time }: any) => {
      const state = newQuestionsState[room];
      if (!state || time > state.maxResponseTime) return;
      if (username === state.initiator) return;
      sendBotMessage(
        room,
        `${username} ${status === "accept" ? "accepted ✓" : "rejected ✗"} the new questions request`
      );
      state.value += status === "accept" ? 1 : -1;
    });


    socket.on("disconnecting", () => {
      unregisterBySocketId(socket.id);

      const user = removeUserBySocket(socket);
      if (!user) return;

      socket.to(user.room).emit("chatroom_users", getRoomUsers(user.room));
      const timer = setTimeout(() => {
        disconnectTimers.delete(user.username);
        const result = leaveRoom(user.room, user.username);
        if (result.dissolved) {
          io.in(user.room).emit("room_dissolved", {
            message: `${user.username} (host) disconnected. The room has been closed.`,
          });
        } else {
          sendBotMessage(user.room, `${user.username} left the room.`);
          io.in(user.room).emit("chatroom_users", getRoomUsers(user.room));
        }
        broadcastRooms();
      }, DISCONNECT_GRACE_MS);

      disconnectTimers.set(user.username, timer);
    });
  });

  return { sendBotMessage };
};