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
}

export interface Room {
  id: string;
  name: string;
  host: string;
  members: string[];
  pendingRequests: string[];
  maxMembers: number;
  isPublic: boolean;
  topics: string[];
  difficultyMix: string[];
  createdAt: number;
}

export interface RoomSummary {
  id: string;
  name: string;
  host: string;
  members: string[];      
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  topics: string[];
  difficultyMix: string[];
  createdAt: number;
}