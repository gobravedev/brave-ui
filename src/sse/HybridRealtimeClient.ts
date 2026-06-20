import { SSEClient } from "./SSEClient";
import { WebSocketClient } from "./WebSocketClient";
import {
  MessageListener,
  RealtimeClient,
  RealtimeClientConfig,
  RealtimeStatus,
  RealtimeTransport,
} from "./types";

export class HybridRealtimeClient implements RealtimeClient {
  private transport: RealtimeTransport;
  private client: RealtimeClient;
  private url = "";
  private config: Partial<RealtimeClientConfig> = {};
  private listeners: Set<MessageListener> = new Set();

  constructor(initialTransport: RealtimeTransport = "websocket") {
    this.transport = initialTransport;
    this.client = this.createClient(initialTransport);
  }

  connect(url: string) {
    this.url = url;
    this.client.connect(url);
  }

  close() {
    this.client.close();
  }

  reconnect() {
    this.client.reconnect();
  }

  onMessage(fn: MessageListener) {
    this.listeners.add(fn);
    const unbind = this.client.onMessage(fn);

    return () => {
      this.listeners.delete(fn);
      unbind();
    };
  }

  getStatus(): RealtimeStatus {
    return this.client.getStatus();
  }

  getTransport(): RealtimeTransport {
    return this.transport;
  }

  setTransport(transport: RealtimeTransport) {
    if (transport === this.transport) {
      return;
    }

    this.client.close();

    this.transport = transport;
    this.client = this.createClient(transport);
    this.applyConfig();
    this.rebindListeners();
  }

  configure(config: Partial<RealtimeClientConfig>) {
    this.config = { ...this.config, ...config };
    this.client.configure(config);
  }

  private createClient(transport: RealtimeTransport): RealtimeClient {
    return transport === "sse" ? new SSEClient() : new WebSocketClient();
  }

  private applyConfig() {
    if (Object.keys(this.config).length > 0) {
      this.client.configure(this.config);
    }
  }

  private rebindListeners() {
    for (const listener of this.listeners) {
      this.client.onMessage(listener);
    }
  }
}
