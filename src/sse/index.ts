import { HybridRealtimeClient } from "./HybridRealtimeClient";
import { RealtimeClient, RealtimeTransport } from "./types";

export * from "./types";

function resolveTransport(): RealtimeTransport {
	const envTransport =
		(import.meta.env.VITE_REALTIME_TRANSPORT as RealtimeTransport | undefined) ||
		"websocket";

	if (typeof window === "undefined") {
		return envTransport;
	}

	const localTransport = window.localStorage.getItem(
		"realtime.transport"
	) as RealtimeTransport | null;

	return localTransport || envTransport;
}

export function createRealtimeClient(transport: RealtimeTransport): RealtimeClient {
	return new HybridRealtimeClient(transport);
}

// Keep backward compatibility for existing imports.
export const sseClient = createRealtimeClient(resolveTransport());