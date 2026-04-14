<<<<<<< HEAD
export interface Credit {
  session?: string;
  csrfToken: string;
}

export interface UserObject {
  [userId: string]: Credit;
}

export interface HttpRequestOptions {
  method?: string;
  url: string;
  body?: any;
}

export interface GraphQLRequestOptions {
  origin?: string;
  referer?: string;
  query: string;
  variables?: object;
  operationName?: string;
}

export interface NewQuestionsRoom {
  initiator: string;
  maxResponseTime: number;
  value: number;
}

export interface NewQuestionsState {
  [room: string]: NewQuestionsRoom;
=======
export interface NewQuesstionsObj {
  [room: string]: {
    initiator: string;
    maxResponseTime: number;
    value: number;
  };
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
}
