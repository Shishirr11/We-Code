export interface NewQuesstionsObj {
  [room: string]: {
    initiator: string;
    maxResponseTime: number;
    value: number;
  };
}
