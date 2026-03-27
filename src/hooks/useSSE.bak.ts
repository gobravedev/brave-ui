import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setSseData } from "@/store/globalSlice";

export function useSSE(
openNotification: any,
  url: string = "/brave-api/sse-group",
  retryInterval = 5000,
 
): React.RefObject < EventSource | null> {
  const dispatch = useDispatch();
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const source = new EventSource(url);
    eventSourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.msgType === "process_end") {
          const analysis: any = data.analysis;
          const msg = `${analysis.analysis_name}(${analysis.analysis_id}) 分析完成`;
          openNotification({ type: "info", message: msg });
        }

        if (data.msgType === "analysis_result") {
          openNotification({ type: "info", message: data.msg });
        }

        dispatch(setSseData(event.data));
      } catch (err) {
        console.warn("SSE 消息解析失败", err);
      }
    };

    source.onerror = (err) => {
      console.error("SSE 连接错误，将在稍后重连：", err);
      source.close();
      eventSourceRef.current = null;

      retryTimerRef.current = setTimeout(() => {
        connect();
      }, retryInterval);
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  return eventSourceRef;
}
