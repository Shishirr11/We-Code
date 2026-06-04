import { Router, Request, Response } from "express";
import { createRoom, getRoom, getAllPublicRooms } from "../services/roomService";
import { getRandomQuestions } from "./leetcode";
import { getCredentials } from "../services/userService";

const roomRoutes = Router();

roomRoutes.get("/", (_req: Request, res: Response) => {
  res.json(getAllPublicRooms());
});

roomRoutes.get("/:id", (req: Request, res: Response) => {
  const room = getRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  res.json(room);
});

roomRoutes.post("/", async (req: Request, res: Response) => {
  const { host, name, isPublic, topics, difficultyMix, maxMembers } = req.body;

  if (!host) {
    res.status(400).json({ error: "host is required" });
    return;
  }

  const room = createRoom({
    host,
    name:         name || `${host}'s Room`,
    isPublic:     isPublic ?? true,
    topics:       topics        || [],
    difficultyMix: difficultyMix || ["Easy", "Medium", "Medium", "Hard"],
    maxMembers:   maxMembers    || 5,
  });

  const credit = await getCredentials(host).catch(() => undefined);

  await getRandomQuestions(
    room.id,
    room.difficultyMix,
    room.topics,
    credit ?? undefined
  );

  res.status(201).json(room);
});

export default roomRoutes;