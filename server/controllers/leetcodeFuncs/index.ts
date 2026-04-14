// import Problem from "../leetcode/lib/problem"
import { Credit, Problem } from "./interfaces";
import { apiRoutes } from "./routes";
import { httpRequest } from "./utils/helper";

export const getAllProblems = async (
  credits: Credit
): Promise<Array<Problem>> => {
  // console.log(Problem);
  let response = await fetch(apiRoutes.problemsAll);
  const { stat_status_pairs: problems } = await response.json();
  return problems.map((problem: any) => ({
    slug: problem.stat.question__title_slug,
    title: problem.stat.question__title,
    difficulty: problem.difficulty.level,
  }));
};

// export const getProblem = async (): Promise<Problem> => {

//     return undefined;
// }

// export const runCode = async (slug: string, body: any, credit: Credit) => {
//   const response = await httpRequest(
//     {
//       url: apiRoutes.run.replace("$slug", slug),
//       method: "POST",
//       body,
//     },
//     credit
//   );
// };
