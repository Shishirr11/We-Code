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

export const graphQLRequest = async (options: GraphQLRequestOptions, credit: Credit) => {
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
        operationName: "globalData",
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
