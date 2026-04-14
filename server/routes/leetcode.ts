import { Router, Request, Response } from "express";
import { attachCredentials } from "../middleware/auth";
import { Problem } from "../services/problem";
import { problems } from "../data/problems";

const leetcodeRoutes = Router();

const roomQuestions: Record<string, Array<{ slug: string; title: string; difficulty: string }>> = {};

const difficultyOrder = ["Easy", "Medium", "Medium", "Hard"];

export const getRandomQuestions = (
  room: string,
  mix: string[] = difficultyOrder
): Array<{ slug: string; title: string; difficulty: string }> => {
  const selected = mix.map((difficulty) => {
    const pool = problems[difficulty];
    const slug = pool[Math.floor(Math.random() * pool.length)];
    return { slug, title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), difficulty };
  });
  roomQuestions[room] = selected;
  return selected;
};

leetcodeRoutes.get("/room-problems/:room", (req: Request, res: Response) => {
  const { room } = req.params;
  if (!roomQuestions[room]) getRandomQuestions(room);
  res.json(roomQuestions[room]);
});

leetcodeRoutes.get("/problem/:slug", attachCredentials, async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { credits } = req.body;
  try {
    const problem = new Problem(slug, credits);
    const details = await problem.getDetails();
    res.json(details);
  } catch (err) {
    console.error("Problem fetch error:", err);
    res.status(500).json({ error: "Failed to fetch problem" });
  }
});

leetcodeRoutes.post("/run", attachCredentials, async (req: Request, res: Response) => {
  const { credits, slug, code, language, input } = req.body;
  if (!credits.session) { res.json({ sessionExpired: true }); return; }
  try {
    const problem = new Problem(slug, credits);
    const result = await problem.runCode(language, code, input);
    res.json(result);
  } catch (err) {
    console.error("Run error:", err);
    res.status(500).json({ error: "Failed to run code" });
  }
});

leetcodeRoutes.post("/submit", attachCredentials, async (req: Request, res: Response) => {
  const { credits, username, slug, code, language } = req.body;
  if (!credits.session) { res.json({ sessionExpired: true }); return; }
  try {
    const problem = new Problem(slug, credits);
    const result: any = await problem.submitCode(language, code);
    if (result.status_msg === "Accepted") {
      req.app.get("sendBotMessage")?.(
        "room",
        `${username} solved ${problem.title} — faster than ${Math.round(result.runtime_percentile)}%! 🎉`
      );
    }
    res.json(result);
  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ error: "Failed to submit code" });
  }
});

export default leetcodeRoutes;
