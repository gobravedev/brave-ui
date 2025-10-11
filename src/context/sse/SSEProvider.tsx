// src/context/sse/SSEProvider.tsx
import React, { createContext, useRef, useState, useEffect, ReactNode } from "react";
import { SSEContextType, SSEStatus } from "./types";
import { useSelector } from "react-redux";

export const SSEContext = createContext<SSEContextType | null>(null);

export const SSEProvider = ({
  url = "/brave-api/sse-group",
  retryInterval = 5000,
  children,
}: {
  url?: string;
  retryInterval?: number;
  children: ReactNode;
}) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [status, setStatus] = useState<SSEStatus>("connecting");
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastReceived = useRef(Date.now());
  const timeoutMs = 15000;
  const { baseURL,authorization } = useSelector((state: any) => state.user) 

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus("connecting");
    const es = new EventSource(`${baseURL}${url}?authorization=${authorization}`);
    eventSourceRef.current = es;

    es.onopen = () => {
      setStatus("open");
      lastReceived.current = Date.now();
      console.log("✅ SSE connected");
    };

    const autoReConnect = () => {
      setStatus("closed");
      es.close();
      eventSourceRef.current = null;

      if (!retryTimerRef.current) {
        retryTimerRef.current = setTimeout(() => {
          retryTimerRef.current = null;
          connect();
        }, retryInterval);
      }
    }

    intervalRef.current = setInterval(() => {
      if (Date.now() - lastReceived.current > timeoutMs) {
        console.warn("⚠️ SSE 心跳超时，服务器可能异常退出");
        autoReConnect()
      }
    }, 5000);

    es.onerror = (err) => {
      console.warn("❌ SSE error", err);
      // autoReConnect()
    };

    es.onmessage = (event) => {
      lastReceived.current = Date.now();
      // 你也可以在这里广播消息
      const data = JSON.parse(event.data)
      if (data.type != "ping") {
        console.log("📩 SSE message:", event.data);
      }
    };
  };

  const close = () => {
    retryTimerRef.current && clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setStatus("closed");
  };

  const reconnect = () => {
    close();
    connect();
  };


  useEffect(() => {
    console.log(">>>>>>>>>>建立连接.................................")
    // setInterval(() => {
    //     console.log(eventSourceRef.current?.readyState)
    //     console.warn("EventSource closed, reconnecting...");
    //     if (eventSourceRef.current?.readyState === 2) {

    //     //   reconnect();
    //     }
    // }, 5000);
    connect();
    return () => {
      close();
      intervalRef.current && clearInterval(intervalRef.current)
    };
  }, [baseURL]);

  return (
    <SSEContext.Provider value={{ eventSourceRef, status, close, reconnect }}>
      {children}
    </SSEContext.Provider>
  );
};