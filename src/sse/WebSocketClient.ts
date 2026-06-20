import {
  RealtimeClient,
  RealtimeClientConfig,
  RealtimeStatus,
  RealtimeTransport,
} from "./types";

export class WebSocketClient implements RealtimeClient {
  private url = "";
  private ws: WebSocket | null = null;
  private listeners: Set<(data: any) => void> = new Set();
  private status: RealtimeStatus = "closed";

  private retryInterval: number;
  private heartbeatTimeout: number;
  private ackEnabled = true;
  private ackHandler?: RealtimeClientConfig["ackHandler"];
  private lastReceived = Date.now();
  private heartbeatTimer: any = null;
  private retryTimer: any = null;

  constructor(retryInterval = 5000, heartbeatTimeout = 30000) {
    this.retryInterval = retryInterval;
    this.heartbeatTimeout = heartbeatTimeout;
  }

  getStatus() {
    return this.status;
  }

  getTransport(): RealtimeTransport {
    return "websocket";
  }

  setTransport() {
    // WebSocket client transport is fixed.
  }

  configure(config: Partial<RealtimeClientConfig>) {
    if (typeof config.retryInterval === "number") {
      this.retryInterval = config.retryInterval;
    }
    if (typeof config.heartbeatTimeout === "number") {
      this.heartbeatTimeout = config.heartbeatTimeout;
    }
    if (typeof config.ackEnabled === "boolean") {
      this.ackEnabled = config.ackEnabled;
    }
    if (typeof config.ackHandler === "function") {
      this.ackHandler = config.ackHandler;
    }
  }

  onMessage(fn: (data: any) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  close() {
    this.clearTimers();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.status = "closed";
  }

  reconnect() {
    this.close();
    this.connect(this.url);
  }

  connect(url: string) {
    this.url = url;
    this.clearTimers();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.status = "connecting";
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.status = "open";
      this.lastReceived = Date.now();
      this.startHeartbeatCheck();
      console.log("🟢 WebSocket connected:", this.url);
    };

    this.ws.onclose = () => {
      console.warn("🔴 WebSocket closed, scheduling reconnect...");
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      console.warn("🔴 WebSocket error, scheduling reconnect...");
      this.scheduleReconnect();
    };

    this.ws.onmessage = (event) => {
      this.lastReceived = Date.now();

      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      if (data?.type === "ping") {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
        }
        return;
      }

      this.listeners.forEach((fn) => fn(data));
      this.tryAck(data);
    };
  }

  private startHeartbeatCheck() {
    this.clearTimers();

    this.heartbeatTimer = setInterval(() => {
      if (Date.now() - this.lastReceived > this.heartbeatTimeout) {
        console.warn("⚠ WebSocket heartbeat timeout, reconnecting...");
        this.scheduleReconnect();
      }
    }, 5000);
  }

  private scheduleReconnect() {
    this.status = "closed";

    this.clearTimers();

    if (!this.retryTimer) {
      this.retryTimer = setTimeout(() => {
        this.retryTimer = null;
        this.reconnect();
      }, this.retryInterval);
    }
  }

  private clearTimers() {
    this.heartbeatTimer && clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;

    this.retryTimer && clearTimeout(this.retryTimer);
    this.retryTimer = null;
  }

  private tryAck(data: any) {
    if (!this.ackEnabled) {
      return;
    }

    const seq = this.extractSeq(data);
    if (seq === undefined || seq === null) {
      return;
    }

    if (this.ackHandler) {
      Promise.resolve(
        this.ackHandler({ seq, raw: data, transport: "websocket" })
      ).catch((error) => {
        console.warn("⚠ WebSocket ACK failed:", error);
      });
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "ack", seq }));
    }
  }

  private extractSeq(data: any) {
    return data?.seq ?? data?.sequence ?? data?.meta?.seq;
  }
}
