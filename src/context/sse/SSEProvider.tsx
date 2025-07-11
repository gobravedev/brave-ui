// src/context/sse/SSEProvider.tsx
import React, { createContext, useRef, useState, useEffect, ReactNode } from "react";
import { SSEContextType, SSEStatus } from "./types";

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
  
    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
  
      setStatus("connecting");
      const es = new EventSource(url);
      eventSourceRef.current = es;
  
      es.onopen = () => {
        setStatus("open");
        console.log("✅ SSE connected");
      };
  
      es.onerror = (err) => {
        console.warn("❌ SSE error", err);
        setStatus("closed");
        es.close();
        eventSourceRef.current = null;
  
        if (!retryTimerRef.current) {
          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null;
            connect();
          }, retryInterval);
        }
      };
  
      es.onmessage = (event) => {
        // 你也可以在这里广播消息
        console.log("📩 SSE message:", event.data);
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
      };
    }, []);
  
    return (
      <SSEContext.Provider value={{ eventSourceRef, status, close, reconnect }}>
        {children}
      </SSEContext.Provider>
    );
  };