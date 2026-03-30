import { SSEClient } from "./SSEClient";
import { WebSocketClient } from "./WebSocketClient";
import { RealtimeClient, RealtimeTransport } from "./types";

export * from "./types";

// function resolveTransport(): RealtimeTransport {
// 	const envTransport =
// 		(import.meta.env.VITE_REALTIME_TRANSPORT as RealtimeTransport | undefined) ||
// 		"sse";

// 	if (typeof window === "undefined") {
// 		return envTransport;
// 	}

// 	const localTransport = window.localStorage.getItem(
// 		"realtime.transport"
// 	) as RealtimeTransport | null;

// 	return localTransport || envTransport;
// }

// export function createRealtimeClient(transport: RealtimeTransport): RealtimeClient {
// 	return transport === "websocket" ? new WebSocketClient() : new SSEClient();
// }

// export const realtimeClient = createRealtimeClient(resolveTransport());
// Keep backward compatibility for existing imports.
// export const sseClient = new SSEClient();
export const sseClient = new WebSocketClient();