interface HttpRequestOptions {
  method?: string;
  url: string;
  referer?: string;
  resolveWithFullResponse?: boolean;
  form?: any;
  body?: any;
}

interface GraphQLRequestOptions {
  origin?: string;
  referer?: string;
  query: string;
  variables?: object;
  operationName?: string;
}

interface Credit {
  session?: string;
  csrfToken: string;
}

interface UserObject {
  [userId: string]: Credit;
}

interface ProblemsSDE {
  [difficulty: string]: Array<String>;
}

interface submit_status {
  state: string;
  status_msg?: string;
  total_correct?: number;
  total_testcases?: number;
  input?: string;
  input_formatted?: string;
  expected_output?: string;
  runtime_percentile?: number;
  memory_percentile?: number;
}

interface Problem {
  title: String;
  slug: String;
  content?: String;
  difficulty?: String;
  tag?: Array<String>;
}

enum ProblemStatus {
  "Accept",
  "Not Accept",
  "Not Start",
}

enum ProblemDifficulty {
  "Easy",
  "Medium",
  "Hard",
}

enum SubmissionStatus {
  "Accepted",
  "Compile Error",
  "Wrong Answer",
  "Time Limit Exceeded",
}

enum EndPoint {
  "US",
  "CN",
}

interface Uris {
  base: string;
  login: string;
  graphql: string;
  problemsAll: string;
  problem: string;
  submit: string;
  run: string;
  check: string;
  submission: string;
}

export {
  HttpRequestOptions,
  GraphQLRequestOptions,
  Credit,
  ProblemStatus,
  ProblemDifficulty,
  SubmissionStatus,
  EndPoint,
  Uris,
  submit_status,
  Problem,
  UserObject,
  ProblemsSDE,
};
