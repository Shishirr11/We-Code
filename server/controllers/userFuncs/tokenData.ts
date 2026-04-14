import exp from "constants";
import { Credit, UserObject } from "../leetcodeFuncs/interfaces";
import {
  graphQLRequest,
  healthCheckRequest,
} from "../leetcodeFuncs/utils/helper";
import { getHashedSessionToken } from "./auth";

const userDetails: UserObject = {
  shiva_nanda: {
    csrfToken:
      "xi5Bz9q5ynFPJYRXKoWGl3JRChRVfhTcAv04TOP4bdYFzBSnv5d1O5m9NZy8ED7s",
    session:
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiNDcwMjAyOSIsIl9hdXRoX3VzZXJfYmFja2VuZCI6ImRqYW5nby5jb250cmliLmF1dGguYmFja2VuZHMuTW9kZWxCYWNrZW5kIiwiX2F1dGhfdXNlcl9oYXNoIjoiNTgzOTA4OTdhNjJmYjg5ZWMyNGE5N2RjYzM3OWEwNmJmNDdjYWMwNGNkNjYxOGViNTE1NzU1MjJkMjJlZTA1NCIsImlkIjo0NzAyMDI5LCJlbWFpbCI6ImdzbnJoeWQ2QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoic2hpdmFfbmFuZGEiLCJ1c2VyX3NsdWciOiJzaGl2YV9uYW5kYSIsImF2YXRhciI6Imh0dHBzOi8vczMtdXMtd2VzdC0xLmFtYXpvbmF3cy5jb20vczMtbGMtdXBsb2FkL2Fzc2V0cy9kZWZhdWx0X2F2YXRhci5qcGciLCJyZWZyZXNoZWRfYXQiOjE3MDI5NjA1OTksImlwIjoiMTgzLjgyLjExNS4yIiwiaWRlbnRpdHkiOiJlM2Y4MTAxYzQxYjQwNTcyOTczMjI3ZDBhNjQ2MjBkMCIsInNlc3Npb25faWQiOjQ4Nzk4NzEwLCJfc2Vzc2lvbl9leHBpcnkiOjEyMDk2MDB9.TY2HWVTuXl1Kc6dATJXJ-CIubYGLxVmQLlfw9azHrxo",
  },
  SaiKiran_7: {
    csrfToken:
      "hXM6QD4YcgmbIYfSzsFMBEfyxpnsm5ekFdZbBogByAOPhl9BsqFMwz0nlDbsLJT6",
    session:
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiNTI1NzY5NyIsIl9hdXRoX3VzZXJfYmFja2VuZCI6ImFsbGF1dGguYWNjb3VudC5hdXRoX2JhY2tlbmRzLkF1dGhlbnRpY2F0aW9uQmFja2VuZCIsIl9hdXRoX3VzZXJfaGFzaCI6IjI4NTZjY2E3ODdiNTg1NDBjOWM2NzU4YjdkMTMyNWIzMjM5MGViZWU4Njc4Mzk4ZDRkNmVkZWNmZjFhNjBmNmQiLCJpZCI6NTI1NzY5NywiZW1haWwiOiJwb2x1a2lyYW43QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoiU2FpS2lyYW5fNyIsInVzZXJfc2x1ZyI6IlNhaUtpcmFuXzciLCJhdmF0YXIiOiJodHRwczovL3MzLXVzLXdlc3QtMS5hbWF6b25hd3MuY29tL3MzLWxjLXVwbG9hZC9hc3NldHMvZGVmYXVsdF9hdmF0YXIuanBnIiwicmVmcmVzaGVkX2F0IjoxNzAzMDY5MjgzLCJpcCI6IjE4My44Mi4xMTUuMiIsImlkZW50aXR5IjoiZjUyOWEzMjA3M2EyMjM4OGE4MzcwYzM5ZTliOTNjODYiLCJzZXNzaW9uX2lkIjo1MTI1MzU4MSwiX3Nlc3Npb25fZXhwaXJ5IjoxMjA5NjAwfQ.xCDLfY1LSQ0prp9j7okAJz7qOX58-kQfCi-QRFkgzmE",
  },
  reddykeerthana2728: {
    csrfToken:
      "ZB6FWCr1WjskWB51gaw0Jx4lJtuZJx5QALM6tuArHD2XTjExukTiMUQeJNcm7E4G",
    session:
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfYXV0aF91c2VyX2lkIjoiNDcwMTg5OCIsIl9hdXRoX3VzZXJfYmFja2VuZCI6ImFsbGF1dGguYWNjb3VudC5hdXRoX2JhY2tlbmRzLkF1dGhlbnRpY2F0aW9uQmFja2VuZCIsIl9hdXRoX3VzZXJfaGFzaCI6ImMxYWVjNDljYmYzMDRkMmMzOGU3MzcwZGFkYmIzOTE3NGVhZTY3MTIxZDNkYmU4YzM3MGQyMGIzNWU4NGQzY2UiLCJpZCI6NDcwMTg5OCwiZW1haWwiOiJyZWRkeWtlZXJ0aGFuYTI3MjhAZ21haWwuY29tIiwidXNlcm5hbWUiOiJyZWRkeWtlZXJ0aGFuYTI3MjgiLCJ1c2VyX3NsdWciOiJyZWRkeWtlZXJ0aGFuYTI3MjgiLCJhdmF0YXIiOiJodHRwczovL2Fzc2V0cy5sZWV0Y29kZS5jb20vdXNlcnMvcmVkZHlrZWVydGhhbmEyNzI4L2F2YXRhcl8xNjI4MzA2NDM2LnBuZyIsInJlZnJlc2hlZF9hdCI6MTcwMzIyNDM2OSwiaXAiOiIxODMuODIuMTE1LjIiLCJpZGVudGl0eSI6ImY1MjlhMzIwNzNhMjIzODhhODM3MGMzOWU5YjkzYzg2Iiwic2Vzc2lvbl9pZCI6NTEyMzczMDN9.1Hgv_DRlaIe9FImAo6pQL7Jdeu3-tcwFNlzLjdspaiE",
  },
};

export const getTokens = (username: string): Credit => {
  return userDetails[username];
};

export const addTokens = async (csrfToken: string, session: string) => {
  const currentUserDetails = await getUserDeatilsFromTokens(csrfToken, session);
  if (currentUserDetails.isSignedIn) {
    userDetails[currentUserDetails.username] = { csrfToken, session };
    const userSessionToken: string = getHashedSessionToken(currentUserDetails.username);
    // console.log({
    //   message: `${currentUserDetails.username} details added`,
    //   username: currentUserDetails.username,
    //   sessionToken: userSessionToken, // session token to login from front-end
    // })
    return {
      message: `${currentUserDetails.username} details added`,
      username: currentUserDetails.username,
      sessionToken: userSessionToken, // session token to login from front-end
    };
  } else {
    return { error: "user not found" };
  }
  const tokens: Credit = { csrfToken, session };
};

export const healthCheck = async (username: string) => {
  const tokens = getTokens(username);
  if (tokens) {
    if (await healthCheckRequest(tokens)) return true;
    return false;
  } else return false;
};

export const getUserDeatilsFromTokens = async (
  csrfToken: string,
  session: string
) => {
  const credit = {
    csrfToken,
    session,
  };
  const response: any = await graphQLRequest(
    {
      operationName: "globalData",
      query: `
      query globalData {
        userStatus {
          isSignedIn
          username
          realName
          
        }
      }
        
      `,
      variables: {},
    },
    credit
  )
    .then((res: any) => res["userStatus"])
    .catch((err) => {
      return { isSignedIn: false, username: "", realName: "" };
    });

  return response;
};

/*
query globalData {
  userStatus {
    isSignedIn
    username
    realName
    
  }
}*/
