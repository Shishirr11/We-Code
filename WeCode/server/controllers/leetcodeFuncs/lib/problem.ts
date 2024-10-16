import { Credit } from "../interfaces";
import { apiRoutes } from "../routes";
import { graphQLRequest, httpRequest } from "../utils/helper";

export class NewProblem {
  constructor(
    readonly slug: string,
    public credit: Credit,
    public id?: string,
    public frontendId?: string,
    public title?: string,
    public difficulty?: string,
    public content?: string,
    public tags?: Array<string>,
    public snippets?: Array<any>,
    public exampleTestcaseList?: string
  ) {
    this.slug = slug;
    this.credit = credit;
    // console.log(slug);
  }

  validLanguages = ["Python3", "C++", "Java", "JavaScript"];

  setTitleDetails = async () => {
    if (this.id !== undefined) return;
    // console.log(this.slug);
    const titleResponse: any = await graphQLRequest(
      {
        query: `
            query questionTitle($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                questionId
                questionFrontendId
                title
                difficulty
                }
            }
              `,
        variables: {
          titleSlug: this.slug,
        },
      },
      this.credit
    );
    this.difficulty = titleResponse.question.difficulty;
    (this.frontendId = titleResponse.question.questionFrontendId),
      (this.id = titleResponse.question.questionId);
    this.title = titleResponse.question.title;
  };

  setContentDetails = async () => {
    if (this.content !== undefined) return;
    const contentResponse: any = await graphQLRequest(
      {
        operationName: "questionContent",
        query: `
              query questionContent($titleSlug: String!) {
                  question(titleSlug: $titleSlug) {
                  content
                  exampleTestcaseList
                  }
              }
            `,
        variables: {
          titleSlug: this.slug,
        },
      },
      this.credit
    );
    // console.log("first", contentResponse, contentResponse.exampleTestcaseList);
    this.content = contentResponse.question.content;
    this.exampleTestcaseList = contentResponse.question.exampleTestcaseList;
  };

  setTagDetails = async () => {
    if (this.tags !== undefined) return;
    const tagsResponse: any = await graphQLRequest(
      {
        operationName: "singleQuestionTopicTags",
        query: `
        query singleQuestionTopicTags($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              topicTags {
                name
              }
            }
          }
          `,
        variables: {
          titleSlug: this.slug,
        },
      },
      this.credit
    );
    this.tags = tagsResponse.question.topicTags.map((tag: any) => tag.name);
  };

  setSnippetsDetails = async () => {
    if (this.snippets !== undefined) return;
    const snippetsResponse: any = await graphQLRequest(
      {
        operationName: "questionEditorData",
        query: `
        query questionEditorData($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              codeSnippets {
                lang
                code
              }
            }
          }
          
        `,
        variables: {
          titleSlug: this.slug,
        },
      },
      this.credit
    );

    // console.log(snippetsResponse);
    this.snippets = snippetsResponse.question.codeSnippets.filter(
      (snippet: any) => this.validLanguages.includes(snippet.lang)
    );
  };

  getDetails = async () => {
    await this.setTitleDetails();
    // console.log(this.title);
    await this.setContentDetails();
    await this.setTagDetails();
    // console.log("second", this.exampleTestcaseList);
    return {
      id: this.frontendId,
      title: this.title,
      difficulty: this.difficulty,
      content: this.content,
      tags: this.tags,
      exampleTestcases: this.exampleTestcaseList,
    };
  };

  getSnippets = async () => {
    await this.setSnippetsDetails();
    // console.log("in snippets", this.snippets);
    return this.snippets;
  };

  runCode = async (lang: string, code: string, input: string) => {
    // console.log("called run");
    await this.setTitleDetails();
    // console.log("title details set", this.id);
    // console.log({
    //   data_input: input,
    //   lang: lang,
    //   question_id: this.id,
    //   typed_code: code,
    // });
    const runResponse = await httpRequest(
      {
        url: apiRoutes.run.replace("$slug", this.slug),
        method: "POST",
        body: {
          data_input: input,
          lang: lang,
          question_id: this.id,
          typed_code: code,
        },
      },
      this.credit
    );
    // console.log("run response ", runResponse);
    const interpret_id = runResponse.interpret_id;
    // console.log("submitted the code to run ", interpret_id);
    let runDetails: any = { state: "PENDING" };

    return new Promise((resolve: any, reject: any) => {
      var count = 0;
      const interval = setInterval(async () => {
        if (runDetails.state === "SUCCESS") {
          clearInterval(interval);
          // console.log(runDetails)
          resolve(runDetails);
        }
        if (count >= 10) {
          clearInterval(interval);
          resolve({ error: "something went wrong", ...runDetails });
        }
        count++;
        runDetails = await httpRequest(
          {
            url: apiRoutes.check.replace("$submission_id", interpret_id),
            method: "GET",
          },
          this.credit
        );
        // console.log(runDetails);
      }, 2000);
    });
  };
  submitCode = async (lang: string, code: string, input: string) => {
    // console.log("called run");
    await this.setTitleDetails();
    // console.log("title details set", this.id);
    // console.log("apiRoute", apiRoutes.run.replace("$slug", this.slug));
    const runResponse = await httpRequest(
      {
        url: apiRoutes.submit.replace("$slug", this.slug),
        method: "POST",
        body: {
          lang: lang,
          question_id: this.id,
          typed_code: code,
        },
      },
      this.credit
    );

    const submission_id = runResponse.submission_id;
    // console.log("submitted the code to submit ", submission_id);
    let runDetails: any = { state: "PENDING" };

    return new Promise((resolve: any, reject: any) => {
      var count = 0;
      const interval = setInterval(async () => {
        if (runDetails.state === "SUCCESS") {
          clearInterval(interval);
          // console.log(runDetails)
          resolve(runDetails);
        }
        if (count >= 10) {
          clearInterval(interval);
          resolve({ error: "something went wrong", ...runDetails });
        }
        count++;
        runDetails = await httpRequest(
          {
            url: apiRoutes.check.replace("$submission_id", submission_id),
            method: "GET",
          },
          this.credit
        );
        // console.log(runDetails);
      }, 2000);
    });
  };
}
