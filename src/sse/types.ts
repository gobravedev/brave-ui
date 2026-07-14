export type RealtimeTransport = "sse" | "websocket";
export type RealtimeStatus = "connecting" | "open" | "closed";

export type MessageListener = (data: any) => void;

export type AckPayload = {
  seq: string | number;
  raw: any;
  transport: RealtimeTransport;
};

export type RealtimeClientConfig = {
  transport?: RealtimeTransport;
  retryInterval?: number;
  heartbeatTimeout?: number;
  ackEnabled?: boolean;
  ackHandler?: (payload: AckPayload) => void | Promise<void>;
};

export type RealtimeClient = {
  connect: (url: string) => void;
  close: () => void;
  reconnect: () => void;
  send: (data: any) => boolean;
  onMessage: (fn: MessageListener) => () => void;
  getStatus: () => RealtimeStatus;
  getTransport: () => RealtimeTransport;
  setTransport: (transport: RealtimeTransport) => void;
  configure: (config: Partial<RealtimeClientConfig>) => void;
};
