import {
  RealtimeClient,
  RealtimeClientConfig,
  RealtimeStatus,
  RealtimeTransport,
} from "./types";

export class SSEClient implements RealtimeClient {
  private url: string = "";
  private es: EventSource | null = null;
  private listeners: Set<(data: any) => void> = new Set();
  private status: RealtimeStatus = "closed";

  private retryInterval: number;
  private heartbeatTimeout: number;
  private ackEnabled = true;
  private ackHandler?: RealtimeClientConfig["ackHandler"];
  private lastReceived = Date.now();
  private heartbeatTimer: any = null;
  private retryTimer: any = null;

  constructor(
    retryInterval = 5000,
    heartbeatTimeout = 15000
  ) {
    this.retryInterval = retryInterval;
    this.heartbeatTimeout = heartbeatTimeout;
  }

  /** =============================
   *  对外 API
   * ============================= */
  getStatus() {
    return this.status;
  }

  getTransport(): RealtimeTransport {
    return "sse";
  }

  setTransport() {
    // SSE client transport is fixed.
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

    // 返回取消订阅函数
    return () => {
      this.listeners.delete(fn);
    };
  }

  close() {
    this.clearTimers();

    if (this.es) {
      this.es.close();
      this.es = null;
    }

    this.status = "closed";
  }

  reconnect() {
    this.close();
    this.connect(this.url);
  }

  send(_data: any): boolean {
    // SSE is server-push only and does not support client->server messages.
    return false;
  }

  /** =============================
   *  内部：连接逻辑
   * ============================= */
  public connect(url: string) {
    this.url = url;
    this.clearTimers();

    if (this.es) {
      this.es.close();
      this.es = null;
    }

    this.status = "connecting";
    this.es = new EventSource(this.url);

    this.es.onopen = () => {
      this.status = "open";
      this.lastReceived = Date.now();
      console.log("🟢 SSE connected:", this.url);

      this.startHeartbeatCheck();
    };

    this.es.onerror = () => {
      console.warn("🔴 SSE error, scheduling reconnect...");
      this.scheduleReconnect();
    };

    this.es.onmessage = (event) => {
      this.lastReceived = Date.now();

      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      console.log("📨 SSE message:", data, "listeners:", this.listeners.size);
      if (data.type !== "ping") {
        this.listeners.forEach((fn) => fn(data));
        this.tryAck(data);
      }
    };
  }

  /** =============================
   *  心跳检测
   * ============================= */
  private startHeartbeatCheck() {
    this.clearTimers();

    this.heartbeatTimer = setInterval(() => {
      if (Date.now() - this.lastReceived > this.heartbeatTimeout) {
        console.warn("⚠ SSE heartbeat timeout, reconnecting...");
        this.scheduleReconnect();
      }
    }, 5000);
  }

  /** =============================
   *  重连机制
   * ============================= */
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
    if (!this.ackEnabled || !this.ackHandler) {
      return;
    }

    const seq = this.extractSeq(data);
    if (seq === undefined || seq === null) {
      return;
    }

    Promise.resolve(
      this.ackHandler({ seq, raw: data, transport: "sse" })
    ).catch((error) => {
      console.warn("⚠ SSE ACK failed:", error);
    });
  }

  private extractSeq(data: any) {
    return data?.seq ?? data?.sequence ?? data?.meta?.seq;
  }
}