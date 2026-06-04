import { GraphQLClient } from "graphql-request";
import {
  Credit,
  GraphQLRequestOptions,
  HttpRequestOptions,
} from "../interfaces";
import { apiRoutes } from "../routes";

export const httpRequest = async (
  options: HttpRequestOptions,
  credit: Credit
) => {
  const response = await fetch(options.url, {
    method: options.method || "GET",
    headers: {
      Cookie: credit
        ? `LEETCODE_SESSION=${credit.session};csrftoken=${credit.csrfToken}`
        : "",
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": credit ? credit.csrfToken : "",
      Referer: apiRoutes.base,
    },
    body: JSON.stringify(options.body) || undefined,
  });
  return response.json();
};

export const healthCheckRequest = async (credit: Credit) => {
  const response = await fetch("https://leetcode.com/points/api/total/", {
    method: "GET",
    headers: {
      Cookie: credit
        ? `LEETCODE_SESSION=${credit.session};csrftoken=${credit.csrfToken}`
        : "",
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": credit ? credit.csrfToken : "",
      Referer: apiRoutes.base,
    },
  });
  const res = await response.json();
  if (res.points) return true;
  else return false;
};

export const graphQLRequest = async (
  options: GraphQLRequestOptions,
  credit: Credit
) => {
  const client = new GraphQLClient(apiRoutes.graphql, {
    headers: {
      Origin: options.origin || apiRoutes.base,
      Referer: options.referer || apiRoutes.base,
      Cookie: `LEETCODE_SESSION=${credit.session};csrftoken=${credit.csrfToken};`,
      "X-Requested-With": "XMLHttpRequest",
      "X-CSRFToken": credit.csrfToken,
    },
  });
  return await client.request(options.query, options.variables || {});
};
