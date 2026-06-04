import { Router, Request, Response } from "express";
import { attachCredentials } from "../middleware/auth";
import { Problem } from "../services/problem";
import { problems as hardcodedProblems } from "../data/problems";
import { problemTopics } from "../data/problemTopics";
import { fetchProblemsByTopics, FetchedProblem } from "../services/leetcodeHelper";
import { Credit } from "../interfaces";

const leetcodeRoutes = Router();

const roomQuestions: Record<
  string,
  Array<{ slug: string; title: string; difficulty: string }>
> = {};

const DEFAULT_MIX = ["Easy", "Medium", "Medium", "Hard"];

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const getRandomQuestions = async (
  room:    string,
  mix:     string[]           = DEFAULT_MIX,
  topics:  string[]           = [],
  credit?: Credit
): Promise<Array<{ slug: string; title: string; difficulty: string }>> => {


  const uniqueDifficulties = [...new Set(mix)];
  const poolByDiff: Record<string, FetchedProblem[]> = {};

  await Promise.all(
    uniqueDifficulties.map(async (difficulty) => {
      if (topics.length > 0 && credit?.session) {
        const apiProblems = await fetchProblemsByTopics(topics, difficulty, credit);
        if (apiProblems.length > 0) {
          poolByDiff[difficulty] = apiProblems;
          return;
        }
      }

      const slugs: string[] = hardcodedProblems[difficulty] ?? [];

      if (topics.length > 0) {
        const filtered = slugs.filter((slug) => {
          const tags = problemTopics[slug] ?? [];
          return topics.some((t) => tags.includes(t));
        });
        if (filtered.length > 0) {
          poolByDiff[difficulty] = filtered.map((slug) => ({
            slug,
            title: slugToTitle(slug),
            difficulty,
          }));
          return;
        }
      }

      poolByDiff[difficulty] = slugs.map((slug) => ({
        slug,
        title: slugToTitle(slug),
        difficulty,
      }));
    })
  );


  const selected = mix.map((difficulty) => {
    const pool = poolByDiff[difficulty] ?? [];
    if (!pool.length) {
      
      return { slug: "two-sum", title: "Two Sum", difficulty };
    }
    return pool[Math.floor(Math.random() * pool.length)];
  });

  roomQuestions[room] = selected;
  return selected;
};

leetcodeRoutes.get(
  "/room-problems/:room",
  async (req: Request, res: Response) => {
    const { room } = req.params;
    if (!roomQuestions[room]) {
      await getRandomQuestions(room);  
    }
    res.json(roomQuestions[room]);
  }
);

leetcodeRoutes.get(
  "/problem/:slug",
  attachCredentials,
  async (req: Request, res: Response) => {
    const { slug }    = req.params;
    const { credits } = req.body;
    try {
      const problem  = new Problem(slug, credits);
      const details  = await problem.getDetails();
      res.json(details);
    } catch (err) {
      console.error("Problem fetch error:", err);
      res.status(500).json({ error: "Failed to fetch problem" });
    }
  }
);

leetcodeRoutes.post(
  "/run",
  attachCredentials,
  async (req: Request, res: Response) => {
    const { credits, slug, code, language, input } = req.body;
    if (!credits.session) { res.json({ sessionExpired: true }); return; }
    try {
      const problem = new Problem(slug, credits);
      const result  = await problem.runCode(language, code, input);
      res.json(result);
    } catch (err) {
      console.error("Run error:", err);
      res.status(500).json({ error: "Failed to run code" });
    }
  }
);

leetcodeRoutes.post(
  "/submit",
  attachCredentials,
  async (req: Request, res: Response) => {
    const { credits, username, slug, code, language, room } = req.body;
    if (!credits.session) { res.json({ sessionExpired: true }); return; }
    try {
      const problem      = new Problem(slug, credits);
      const result: any  = await problem.submitCode(language, code);
      if (result.status_msg === "Accepted") {
        req.app.get("sendBotMessage")?.(
          room,
          `${username} solved ${problem.title} — faster than ${Math.round(
            result.runtime_percentile
          )}%! 🎉`
        );
      }
      res.json(result);
    } catch (err) {
      console.error("Submit error:", err);
      res.status(500).json({ error: "Failed to submit code" });
    }
  }
);

export default leetcodeRoutes;