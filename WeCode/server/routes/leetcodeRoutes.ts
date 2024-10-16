import express, { Express, Request, Response } from "express";
import { checkAuth } from "../middleware/authMiddleware";
import { NewProblem } from "../controllers/leetcodeFuncs/lib/problem";
import { getAllProblems } from "../controllers/leetcodeFuncs";
import { Credit } from "../controllers/leetcodeFuncs/interfaces";
import { sendMessageFromBot } from "..";
import { problems } from "../data/problems";

const leetcodeRoutes = express.Router();
const currentRoomQUestions: Record<string, Array<string>> = {}
export function getRandomQuestions(room: string): string[] {
  const questions = problems;
  const selectedQuestions: Array<string> = [];
  for (const difficulty of ["Easy", "Medium", "Medium", "Hard"]) {
    const difficultyQuestions = questions[difficulty];
    const randomQuestion =
      difficultyQuestions[
        Math.floor(Math.random() * difficultyQuestions.length)
      ];
    selectedQuestions.push(randomQuestion);
  }
  currentRoomQUestions[room] = selectedQuestions;
  return selectedQuestions;
}

leetcodeRoutes.get(
  "/problems",
  checkAuth,
  async (req: Request, res: Response) => {
    const leetcode_credits: Credit = req.body.credits;
    res.send(await getAllProblems(leetcode_credits));
  }
);

leetcodeRoutes.get("/roomProblems/:room", (req: Request, res: Response) => {
  const { room } = req.params;
  // const probs = getRandomQuestions();
  if (!currentRoomQUestions[room]) getRandomQuestions(room);
  const probs = currentRoomQUestions[room];
  res.send(probs);
});

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

leetcodeRoutes.get(
  "/problem/:slug",
  checkAuth,
  async (req: Request, res: Response) => {
    const { slug } = req.params;
    const { credits } = req.body;
    console.log("probelm req", slug, credits);
    // console.log(slug);
    // console.log(req.params);
    const problem = new NewProblem(slug, credits);
    const problemDetails: any = await problem.getDetails();
    const snippets: any = await problem.getSnippets();
    problemDetails["snippets"] = snippets;
    // console.log(problemDetails);
    // await sleep(100000)
    res.send(problemDetails);
  }
);

leetcodeRoutes.post(
  "/run-code",
  checkAuth,
  async (req: Request, res: Response) => {
    //   res.send('Express + TypeScript Server');
    const leetcode_credits: Credit = req.body.credits;
    const { slug, code, language, input } = req.body;
    // console.log(code, language, input);
    let details;
    try {
      const problem = new NewProblem(slug, leetcode_credits);
      details = await problem.runCode(language, code, input);
    } catch (err) {
      console.log("main error", err);
      details = { error: "something went wrong", state: "PENDING" };
    }
    // console.log("details sent", details);
    res.send(details);
  }
);

leetcodeRoutes.post(
  "/submit-code",
  checkAuth,
  async (req: Request, res: Response) => {
    const leetcode_credits: Credit = req.body.credits;
    // console.log("creds", leetcode_credits);
    const { username, slug, code, language, input } = req.body;
    // console.log(code, language, input);
    let details: any;
    try {
      const problem = new NewProblem(slug, leetcode_credits);
      details = await problem.submitCode(language, code, input);
      if (details.status_msg === "Accepted") {
        sendMessageFromBot(
          "room",
          `${username} has solved ${problem.title} faster than ${Math.round(
            details.runtime_percentile
          )}% 🎉`
        );
      }
    } catch (err) {
      console.log(err);
      details = { error: "something went wrong", state: "PENDING" };
    }
    // console.log("details sent", details);
    res.send(details);
  }
);

export { leetcodeRoutes };
