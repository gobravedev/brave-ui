import { useContext, useEffect, useRef } from "react";
import { SSEContext } from "./SSEProvider";

export function useSSE(callback?: (data: any) => void) {
  const ctx = useContext(SSEContext);

  // callback 引用保持稳定，避免重复订阅
  const savedCallback = useRef<typeof callback>(()=>{});
  savedCallback.current = callback;

  useEffect(() => {
    if (!ctx) return;

    // 包装成稳定函数，只调用最新的 callback
    const handler = (msg: any) => { 
      savedCallback.current?.(msg);
    };

    // 订阅
    const unsubscribe = ctx.subscribe(handler);

    // 卸载时自动取消订阅
    return () => unsubscribe();
  }, [ctx]); // ctx 变时才重新订阅

  return {
    status: ctx?.status ?? "connecting",
    reconnect: ctx?.reconnect ?? (() => {}),
  };
}