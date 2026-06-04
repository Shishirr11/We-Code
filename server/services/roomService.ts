import { Room, RoomSummary } from "../interfaces";

const rooms       = new Map<string, Room>();
const userRoomMap = new Map<string, string>();

const ADJ  = ["swift","brave","calm","bold","keen","wild","sharp","cool"];
const NOUN = ["tiger","eagle","wolf","hawk","bear","lion","fox","lynx"];

function generateRoomId(): string {
  const adj  = ADJ[Math.floor(Math.random() * ADJ.length)];
  const noun = NOUN[Math.floor(Math.random() * NOUN.length)];
  const num  = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}-${noun}-${num}`;
}

export function createRoom(data: {
  host: string; name: string; isPublic: boolean;
  topics: string[]; difficultyMix: string[]; maxMembers?: number;
}): Room {
  const existingId = userRoomMap.get(data.host);
  if (existingId) leaveRoom(existingId, data.host);

  const id = generateRoomId();
  const room: Room = {
    id,
    name:            data.name.trim() || `${data.host}'s Room`,
    host:            data.host,
    members:         [data.host],
    pendingRequests: [],
    maxMembers:      Math.min(Math.max(data.maxMembers ?? 5, 2), 5),
    isPublic:        data.isPublic,
    topics:          data.topics,
    difficultyMix:   data.difficultyMix,
    createdAt:       Date.now(),
  };
  rooms.set(id, room);
  userRoomMap.set(data.host, id);
  return room;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function getAllPublicRooms(): RoomSummary[] {
  return Array.from(rooms.values())
    .filter((r) => r.isPublic)
    .map(toSummary)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getUserRoomId(username: string): string | undefined {
  return userRoomMap.get(username);
}

export function isUserInRoom(username: string, roomId: string): boolean {
  return getRoom(roomId)?.members.includes(username) ?? false;
}

export function requestJoin(
  roomId: string,
  username: string
): { success: boolean; error?: string } {
  const room = rooms.get(roomId);
  if (!room)                               return { success: false, error: "Room not found" };
  if (room.members.includes(username))     return { success: false, error: "Already a member" };
  if (room.members.length >= room.maxMembers) return { success: false, error: "Room is full" };
  if (room.pendingRequests.includes(username)) return { success: false, error: "Request already pending" };
  if (userRoomMap.has(username))           return { success: false, error: "Already in another room" };


  room.pendingRequests.push(username);
  return { success: true };
}

export function respondToRequest(
  roomId: string,
  targetUsername: string,
  approve: boolean
): { success: boolean; room?: Room; error?: string } {
  const room = rooms.get(roomId);
  if (!room) return { success: false, error: "Room not found" };
  const idx = room.pendingRequests.indexOf(targetUsername);
  if (idx === -1) return { success: false, error: "No pending request" };
  room.pendingRequests.splice(idx, 1);
  if (approve) {
    if (room.members.length >= room.maxMembers)
      return { success: false, error: "Room is now full" };
    room.members.push(targetUsername);
    userRoomMap.set(targetUsername, roomId);
  }
  return { success: true, room };
}

export function kickMember(
  roomId: string,
  targetUsername: string,
  requesterUsername: string
): { success: boolean; error?: string } {
  const room = rooms.get(roomId);
  if (!room)                           return { success: false, error: "Room not found" };
  if (room.host !== requesterUsername) return { success: false, error: "Only the host can kick" };
  if (targetUsername === room.host)    return { success: false, error: "Cannot kick yourself" };
  const idx = room.members.indexOf(targetUsername);
  if (idx === -1) return { success: false, error: "User not in room" };
  room.members.splice(idx, 1);
  userRoomMap.delete(targetUsername);
  return { success: true };
}

export function leaveRoom(
  roomId: string,
  username: string
): { dissolved: boolean } {
  const room = rooms.get(roomId);
  if (!room) return { dissolved: false };
  room.members         = room.members.filter((u) => u !== username);
  room.pendingRequests = room.pendingRequests.filter((u) => u !== username);
  userRoomMap.delete(username);
  if (room.members.length === 0 || username === room.host) {
    rooms.delete(roomId);
    return { dissolved: true };
  }
  return { dissolved: false };
}

function toSummary(room: Room): RoomSummary {
  return {
    id:           room.id,
    name:         room.name,
    host:         room.host,
    members:      room.members,
    memberCount:  room.members.length,
    maxMembers:   room.maxMembers,
    isPublic:     room.isPublic,
    topics:       room.topics,
    difficultyMix: room.difficultyMix,
    createdAt:    room.createdAt,
  };
}