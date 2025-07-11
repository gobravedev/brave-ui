// src/context/sse/types.ts
import {  RefObject } from "react";

export type SSEStatus = "connecting" | "open" | "closed";

export interface SSEContextType {
  eventSourceRef: RefObject <EventSource | null>;
  status: SSEStatus;
  reconnect: () => void;
  close: () => void;
}
