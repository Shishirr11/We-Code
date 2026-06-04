import { GraphQLClient } from "graphql-request";
import { Credit, HttpRequestOptions, GraphQLRequestOptions } from "../interfaces";
import { apiRoutes } from "./apiRoutes";

export const httpRequest = async (options: HttpRequestOptions, credit: Credit) => {
  const response = await fetch(options.url, {
    method: options.method || "GET",
    headers: {
      Cookie: `LEETCODE_SESSION=${credit.session};csrftoken=${credit.csrfToken}`,
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": credit.csrfToken,
      Referer: apiRoutes.base,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return response.json();
};

export const graphQLRequest = async (
  options: GraphQLRequestOptions,
  credit: Credit
) => {
  const client = new GraphQLClient(apiRoutes.graphql, {
    headers: {
      Origin: apiRoutes.base,
      Referer: apiRoutes.base,
      Cookie: `LEETCODE_SESSION=${credit.session};csrftoken=${credit.csrfToken};`,
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": credit.csrfToken,
    },
  });
  return client.request(options.query, options.variables || {});
};

export const healthCheckRequest = async (credit: Credit): Promise<boolean> => {
  try {
    const response = await fetch("https://leetcode.com/points/api/total/", {
      method: "GET",
      headers: {
        Cookie: `LEETCODE_SESSION=${credit.session};csrftoken=${credit.csrfToken}`,
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": credit.csrfToken,
        Referer: apiRoutes.base,
      },
    });
    const res = await response.json();
    return !!res.points;
  } catch {
    return false;
  }
};

export const getUserFromTokens = async (csrfToken: string, session: string) => {
  try {
    const result: any = await graphQLRequest(
      {
        query: `query globalData { userStatus { isSignedIn username } }`,
        variables: {},
      },
      { csrfToken, session }
    );
    return result?.userStatus ?? { isSignedIn: false, username: "" };
  } catch {
    return { isSignedIn: false, username: "" };
  }
};


export interface FetchedProblem {
  slug:       string;
  title:      string;
  difficulty: string;
}

const TOPIC_TO_SLUG: Record<string, string> = {
  "Array":               "array",
  "String":              "string",
  "Hash Table":          "hash-table",
  "Dynamic Programming": "dynamic-programming",
  "Binary Search":       "binary-search",
  "Two Pointers":        "two-pointers",
  "Sliding Window":      "sliding-window",
  "Greedy":              "greedy",
  "Tree":                "tree",
  "Graph":               "graph",
  "Backtracking":        "backtracking",
  "Stack":               "stack",
  "Linked List":         "linked-list",
  "Math":                "math",
  "Bit Manipulation":    "bit-manipulation",
  "Heap":                "heap-priority-queue",
};


const problemCache = new Map<
  string,
  { problems: FetchedProblem[]; fetchedAt: number }
>();
const CACHE_TTL_MS = 30 * 60 * 1000;

export const fetchProblemsByTopics = async (
  topics: string[],
  difficulty: string, 
  credit: Credit
): Promise<FetchedProblem[]> => {
  const tagSlugs = topics
    .map((t) => TOPIC_TO_SLUG[t] ?? t.toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean);

  if (!tagSlugs.length) return [];

  const cacheKey = `${tagSlugs.sort().join(",")}::${difficulty}`;
  const cached   = problemCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.problems;
  }

  try {
    const result: any = await graphQLRequest(
      {
        query: `
          query problemsetQuestionList(
            $limit: Int
            $skip: Int
            $filters: QuestionListFilterInput
          ) {
            problemsetQuestionList: questionList(
              categorySlug: ""
              limit: $limit
              skip: $skip
              filters: $filters
            ) {
              questions: data {
                title
                titleSlug
                difficulty
                isPaidOnly
              }
            }
          }
        `,
        variables: {
          limit:   100,
          skip:    0,
          filters: {
            difficulty: difficulty.toUpperCase(),
            tags:       tagSlugs,
          },
        },
      },
      credit
    );

    const raw: any[] =
      result?.problemsetQuestionList?.questions ?? [];

    const problems: FetchedProblem[] = raw
      .filter((q) => !q.isPaidOnly)
      .map((q) => ({
        slug:       q.titleSlug  as string,
        title:      q.title      as string,
        difficulty: difficulty,
      }));

    if (problems.length > 0) {
      problemCache.set(cacheKey, { problems, fetchedAt: Date.now() });
    }

    return problems;
  } catch (err) {
    console.error(
      `[problemFetch] Failed for topics=[${topics}] difficulty=${difficulty}:`,
      err
    );
    return [];
  }
};