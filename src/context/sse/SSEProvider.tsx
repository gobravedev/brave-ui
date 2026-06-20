import React, { createContext, useEffect, useRef, useState } from "react";
import { RealtimeTransport, sseClient } from "../../sse";
import { useSelector } from "react-redux";

export const SSEContext = createContext<{
  status: string;
  subscribe: (fn: (data: any) => void) => () => void;
  reconnect: () => void;
} | null>(null);

export const SSEProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState(sseClient.getStatus());
  const [effectiveTransport, setEffectiveTransport] =
    useState<RealtimeTransport>(sseClient.getTransport());
  const { baseURL, authorization } = useSelector((s: any) => s.user);
  const reconnectFailuresRef = useRef(0);

  const persistTransport = (transport: RealtimeTransport) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("realtime.transport", transport);
    }
    setEffectiveTransport(transport);
  };

  const switchTransport = (transport: RealtimeTransport) => {
    sseClient.setTransport(transport);
    persistTransport(transport);
  };

  useEffect(() => {
    if (!baseURL) return;

    const transport = effectiveTransport;
    // const ackEnabled =
    //   String(import.meta.env.VITE_REALTIME_ACK_ENABLED ?? "true") !== "false";
    // const ackEndpoint = import.meta.env.VITE_REALTIME_ACK_ENDPOINT as
    //   | string
    //   | undefined;

    sseClient.configure({
      // ackEnabled,
      // ackHandler: ackEndpoint
      //   ? async ({ seq, raw, transport: currentTransport }) => {
      //     if (currentTransport !== "sse") {
      //       return;
      //     }

      //     const endpoint = ackEndpoint.startsWith("/")
      //       ? ackEndpoint
      //       : `/${ackEndpoint}`;

      //     await fetch(`${baseURL}${endpoint}`, {
      //       method: "POST",
      //       headers: {
      //         "Content-Type": "application/json",
      //         ...(authorization ? { authorization } : {}),
      //       },
      //       body: JSON.stringify({ seq, raw }),
      //     });
      //   }
      //   : undefined,
    });

    const url = buildRealtimeUrl(baseURL, transport);

    // console.log("Realtime 重新连接:", url, "transport:", transport);
    sseClient.connect(url);

    return () => sseClient.close();
  }, [baseURL, authorization, effectiveTransport]);

  useEffect(() => {
    const updateStatus = () => setStatus(sseClient.getStatus());

    // 用定时器轮询状态变化
    const timer = setInterval(updateStatus, 500);

    return () => clearInterval(timer);
  }, []);

  const subscribe = (fn: (data: any) => void): (() => void) => {
    return sseClient.onMessage(fn) as any; // onMessage 已经返回了取消订阅函数
  };

  useEffect(() => {
    if (!baseURL) return;

    const timer = setInterval(async () => {
      if (sseClient.getStatus() === "open") {
        reconnectFailuresRef.current = 0;
        return;
      }

      reconnectFailuresRef.current += 1;
      if (reconnectFailuresRef.current < 2) {
        return;
      }

      const backendTransport = await fetchBackendTransport(baseURL, authorization);
      if (backendTransport && backendTransport !== sseClient.getTransport()) {
        switchTransport(backendTransport);
        reconnectFailuresRef.current = 0;
        return;
      }

      const fallback = sseClient.getTransport() === "websocket" ? "sse" : "websocket";
      switchTransport(fallback);
      reconnectFailuresRef.current = 0;
    }, 8000);

    return () => clearInterval(timer);
  }, [baseURL, authorization]);

  return (
    <SSEContext.Provider value={{ status, subscribe, reconnect: () => sseClient.reconnect() }}>
      {children}
    </SSEContext.Provider>
  );
};

function buildRealtimeUrl(
  baseURL: string,
  transport: RealtimeTransport
) {
  const pathname =
    transport === "websocket" ? "/api/v1/realtime/ws" : "/api/v1/realtime/sse";
  const normalizedBase =
    transport === "websocket" ? toWebSocketBase(baseURL) : baseURL;

  return `${normalizedBase}${pathname}`;
}

async function fetchBackendTransport(
  baseURL: string,
  authorization?: string
): Promise<RealtimeTransport | null> {
  try {
    const response = await fetch(`${baseURL}/api/v1/realtime/stats`, {
      method: "GET",
      headers: {
        ...(authorization ? { authorization } : {}),
      },
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const transport = data?.transport;
    if (transport === "ws") {
      return "websocket";
    }
    if (transport === "sse") {
      return "sse";
    }
    return null;
  } catch {
    return null;
  }
}

function toWebSocketBase(baseURL: string) {
  if (baseURL.startsWith("https://")) {
    return `wss://${baseURL.slice("https://".length)}`;
  }
  if (baseURL.startsWith("http://")) {
    return `ws://${baseURL.slice("http://".length)}`;
  }
  if (baseURL.startsWith("wss://") || baseURL.startsWith("ws://")) {
    return baseURL;
  }
  return `ws://${baseURL}`;
}