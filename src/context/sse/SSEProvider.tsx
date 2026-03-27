import React, { createContext, useEffect, useState } from "react";
import { sseClient } from "../../sse";
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

    const url = authorization
      ? `${baseURL}/brave-api/sse-group?authorization=${authorization}`
      : `${baseURL}/brave-api/sse-group`;

    // console.log("SSE 重新连接:", url);
    sseClient.connect(url);

    return () => sseClient.close();
  }, [baseURL, authorization]);
  useEffect(() => {
    const updateStatus = () => setStatus(sseClient.getStatus());

    // 用定时器轮询状态变化
    const timer = setInterval(updateStatus, 500);

    return () => clearInterval(timer);
  }, []);

  const subscribe = (fn: (data: any) => void) :()=>{}=> {
    return sseClient.onMessage(fn) as any; // onMessage 已经返回了取消订阅函数
  };

  return (
    <SSEContext.Provider value={{ status, subscribe, reconnect:()=>sseClient.reconnect() }}>
      {children}
    </SSEContext.Provider>
  );
};