import React, { createContext, useEffect, useState } from "react";
import { RealtimeTransport, sseClient } from "../../sse";
import { useSelector } from "react-redux";

export const SSEContext = createContext<{
  status: string;
  subscribe: (fn: (data: any) => void) => () => void;
  reconnect: () => void;
} | null>(null);

export const SSEProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState(sseClient.getStatus());
  const { baseURL, authorization } = useSelector((s: any) => s.user);

  useEffect(() => {
    if (!baseURL) return;

    // const transport = sseClient.getTransport();
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

    // const url = buildRealtimeUrl(baseURL, transport, authorization);

    // console.log("Realtime 重新连接:", url, "transport:", transport);
    sseClient.connect(`${baseURL}/brave-api/sse-group?authorization=${authorization}`);

    return () => sseClient.close();
  }, [baseURL, authorization]);
  useEffect(() => {
    const updateStatus = () => setStatus(sseClient.getStatus());

    // 用定时器轮询状态变化
    const timer = setInterval(updateStatus, 500);

    return () => clearInterval(timer);
  }, []);

  const subscribe = (fn: (data: any) => void): (() => void) => {
    return sseClient.onMessage(fn) as any; // onMessage 已经返回了取消订阅函数
  };

  return (
    <SSEContext.Provider value={{ status, subscribe, reconnect: () => sseClient.reconnect() }}>
      {children}
    </SSEContext.Provider>
  );
};

// function buildRealtimeUrl(
//   baseURL: string,
//   transport: RealtimeTransport,
//   authorization?: string
// ) {
//   const pathname =
//     transport === "websocket" ? "/brave-api/ws-group" : "/brave-api/sse-group";
//   const normalizedBase =
//     transport === "websocket" ? toWebSocketBase(baseURL) : baseURL;

//   return authorization
//     ? `${normalizedBase}${pathname}?authorization=${authorization}`
//     : `${normalizedBase}${pathname}`;
// }

// function toWebSocketBase(baseURL: string) {
//   if (baseURL.startsWith("https://")) {
//     return `wss://${baseURL.slice("https://".length)}`;
//   }
//   if (baseURL.startsWith("http://")) {
//     return `ws://${baseURL.slice("http://".length)}`;
//   }
//   if (baseURL.startsWith("wss://") || baseURL.startsWith("ws://")) {
//     return baseURL;
//   }
//   return `ws://${baseURL}`;
// }