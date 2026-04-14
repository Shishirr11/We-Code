import { Credit } from "../interfaces";
import { apiRoutes } from "./apiRoutes";
import { graphQLRequest, httpRequest } from "./leetcodeHelper";

const VALID_LANGUAGES = ["Python3", "C++", "Java", "JavaScript"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class Problem {
  private id?: string;
  private frontendId?: string;
  public title?: string;
  private difficulty?: string;
  private content?: string;
  private tags?: string[];
  private snippets?: any[];
  private exampleTestcaseList?: string;

  constructor(readonly slug: string, private credit: Credit) {}

  private async setTitleDetails() {
    if (this.id) return;
    const res: any = await graphQLRequest(
      {
        query: `query questionTitle($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId questionFrontendId title difficulty
          }
        }`,
        variables: { titleSlug: this.slug },
      },
      this.credit
    );
    this.difficulty = res.question.difficulty;
    this.frontendId = res.question.questionFrontendId;
    this.id = res.question.questionId;
    this.title = res.question.title;
  }

  private async setContentDetails() {
    if (this.content) return;
    const res: any = await graphQLRequest(
      {
        query: `query questionContent($titleSlug: String!) {
          question(titleSlug: $titleSlug) { content exampleTestcaseList }
        }`,
        variables: { titleSlug: this.slug },
      },
      this.credit
    );
    this.content = res.question.content;
    this.exampleTestcaseList = res.question.exampleTestcaseList;
  }

  private async setTagDetails() {
    if (this.tags) return;
    const res: any = await graphQLRequest(
      {
        query: `query singleQuestionTopicTags($titleSlug: String!) {
          question(titleSlug: $titleSlug) { topicTags { name } }
        }`,
        variables: { titleSlug: this.slug },
      },
      this.credit
    );
    this.tags = res.question.topicTags.map((t: any) => t.name);
  }

  private async setSnippetDetails() {
    if (this.snippets) return;
    const res: any = await graphQLRequest(
      {
        query: `query questionEditorData($titleSlug: String!) {
          question(titleSlug: $titleSlug) { codeSnippets { lang code } }
        }`,
        variables: { titleSlug: this.slug },
      },
      this.credit
    );
    this.snippets = res.question.codeSnippets.filter((s: any) =>
      VALID_LANGUAGES.includes(s.lang)
    );
  }

  async getDetails() {
    await this.setTitleDetails();
    await this.setContentDetails();
    await this.setTagDetails();
    await this.setSnippetDetails();
    return {
      id: this.frontendId,
      title: this.title,
      difficulty: this.difficulty,
      content: this.content,
      tags: this.tags,
      snippets: this.snippets,
      exampleTestcases: this.exampleTestcaseList,
    };
  }

  private async pollResult(submissionId: string) {
    return new Promise((resolve) => {
      let count = 0;
      const interval = setInterval(async () => {
        if (count >= 10) {
          clearInterval(interval);
          resolve({ error: "Timed out waiting for result" });
          return;
        }
        count++;
        const result: any = await httpRequest(
          { url: apiRoutes.check.replace("$submission_id", submissionId) },
          this.credit
        );
        if (result.state === "SUCCESS") {
          clearInterval(interval);
          resolve(result);
        }
      }, 2000);
    });
  }

  async runCode(lang: string, code: string, input: string) {
    await this.setTitleDetails();
    const res = await httpRequest(
      {
        url: apiRoutes.run.replace("$slug", this.slug),
        method: "POST",
        body: { data_input: input, lang, question_id: this.id, typed_code: code },
      },
      this.credit
    );
    return this.pollResult(res.interpret_id);
  }

  async submitCode(lang: string, code: string) {
    await this.setTitleDetails();
    const res = await httpRequest(
      {
        url: apiRoutes.submit.replace("$slug", this.slug),
        method: "POST",
        body: { lang, question_id: this.id, typed_code: code },
      },
      this.credit
    );
    return this.pollResult(res.submission_id);
  }
}
