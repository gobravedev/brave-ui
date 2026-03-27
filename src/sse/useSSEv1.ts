import { useEffect, useState } from "react";
import { sseClient } from ".";

export function useSSE() {
  const [status, setStatus] = useState(sseClient.getStatus());

  useEffect(() => {
    const handler = () => {
      setStatus(sseClient.getStatus());
    };

    // 每次 onopen / onclose 都会触发状态变化
    const timer = setInterval(handler, 500);

    return () => clearInterval(timer);
  }, []);

  return {
    status,
    onMessage: sseClient.onMessage.bind(sseClient),
  };
}