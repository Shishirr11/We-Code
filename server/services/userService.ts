import * as crypto from "crypto";
import { Credit, UserObject } from "../interfaces";
import { getUserFromTokens, healthCheckRequest } from "./leetcodeHelper";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const getHmacSecret = () =>
  process.env.HMAC_SECRET || "dev_secret_replace_in_production";

export const hashSessionToken = (username: string): string => {
  const hmac = crypto.createHmac("sha256", getHmacSecret());
  hmac.update(username);
  return hmac.digest("hex");
};

export const isSessionTokenValid = (username: string, token: string): boolean =>
  token === hashSessionToken(username);

export const getCredentials = async (username: string): Promise<Credit | undefined> => {
  const data = await redis.get<Credit>(`user:${username}`);
  return data ?? undefined;
};

export const registerUser = async (csrfToken: string, session: string) => {
  const userStatus = await getUserFromTokens(csrfToken, session);
  if (!userStatus.isSignedIn) {
    return { error: "Invalid LeetCode credentials. Please check your tokens." };
  }
  await redis.set(`user:${userStatus.username}`, { csrfToken, session });
  return {
    username: userStatus.username,
    sessionToken: hashSessionToken(userStatus.username),
  };
};

export const checkUserHealth = async (username: string): Promise<boolean> => {
  const creds = await getCredentials(username);
  if (!creds) return false;
  return healthCheckRequest(creds);
};