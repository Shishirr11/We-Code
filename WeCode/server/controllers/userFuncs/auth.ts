import * as crypto from "crypto";

export function getHashedSessionToken(
  data: string,
  privateKey: string = "e5f13bcbbfc88f2ed1f6f8db3b6e3b3e1250f7800aae046807a2a6ef8f4387c0"
): string {
  const hmac = crypto.createHmac("sha256", privateKey);
  hmac.update(data);
  const hash = hmac.digest("hex");
  return hash;
}

export const isSessionTokenValid = (username: string, token: string) => {
    return token === getHashedSessionToken(username);
}
