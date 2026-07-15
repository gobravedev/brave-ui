import { useEffect, useState } from "react";
import { Button, Card, Input, Space, Typography } from "antd";
import { sseClient } from "@/sse";

type WSIncomingEvent = {
  event: string;
  data: unknown;
};

type TimelineItem = {
  id: number;
  time: string;
  event: string;
  raw: string;
};

type CommandItem = {
  id: number;
  time: string;
  event: string;
  command: string;
};

type PatchItem = {
  id: number;
  time: string;
  event: string;
  content: string;
};

type PermissionRequestItem = {
  id: number;
  time: string;
  sessionId: string;
  requestId: string;
  kind: string;
  raw: string;
};

function toPrettyJSON(input: unknown): string {
  try {
    if (typeof input === "string") {
      return JSON.stringify(JSON.parse(input), null, 2);
    }
    return JSON.stringify(input, null, 2);
  } catch {
    return String(input ?? "");
  }
}

function extractCommandText(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    const direct = [obj.command, obj.cmd, obj.shellCommand, obj.input].find(
      (v) => typeof v === "string" && v.trim() !== ""
    ) as string | undefined;
    if (direct) {
      return direct;
    }
  }

  const text = toPrettyJSON(payload);
  const hit = text.match(/"command"\s*:\s*"([^"]+)"/i);
  return hit?.[1] || "";
}

function maybePatchContent(event: string, payload: unknown): string {
  const raw = toPrettyJSON(payload);
  if (/patch|diff/i.test(event)) {
    return raw;
  }
  if (/"(patch|diff|workspaceEdit|edits|newText|textEdits)"/i.test(raw)) {
    return raw;
  }
  return "";
}

function toIncomingEvent(raw: unknown): WSIncomingEvent {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.event === "string") {
      return {
        event: obj.event,
        data: obj.data,
      };
    }
  }

  return {
    event: "message",
    data: raw,
  };
}

const Test = () => {
  const [prompt, setPrompt] = useState("用一句话介绍当前项目");
  const [sessionId, setSessionId] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [deltaText, setDeltaText] = useState("");
  const [lastEvent, setLastEvent] = useState("");
  const [errorText, setErrorText] = useState("");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [commands, setCommands] = useState<CommandItem[]>([]);
  const [patches, setPatches] = useState<PatchItem[]>([]);
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequestItem[]>([]);
  const [rawJson, setRawJson] = useState("");

  useEffect(() => {
    const unsubscribe = sseClient.onMessage((data: unknown) => {
      if (!data || typeof data !== "object") {
        return;
      }

      const msg = data as Record<string, unknown>;
      if (msg.type !== "llm.event") {
        return;
      }

      const incomingSessionId =
        typeof msg.session_id === "string" ? msg.session_id : "";
      if (!incomingSessionId) {
        return;
      }

      setSessionId((current) => {
        if (current && current !== incomingSessionId) {
          return current;
        }
        return incomingSessionId;
      });

      const currentSessionId = sessionId;
      if (currentSessionId && incomingSessionId !== currentSessionId) {
        return;
      }

      const evtName = typeof msg.event === "string" ? msg.event : "message";
      handleEvent(toIncomingEvent({ event: evtName, data: msg.data }));
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  const handleEvent = (evt: WSIncomingEvent) => {
    setLastEvent(evt.event);
    const now = new Date().toLocaleTimeString();
    const payload = evt.data;
    const raw = toPrettyJSON(payload);
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setTimeline((prev) => {
      const next = [...prev, { id, time: now, event: evt.event, raw }];
      return next.slice(-300);
    });
    setRawJson(raw);

    const commandText = extractCommandText(payload);
    if (/command/i.test(evt.event) || commandText) {
      setCommands((prev) => {
        const next = [
          ...prev,
          {
            id,
            time: now,
            event: evt.event,
            command: commandText || raw,
          },
        ];
        return next.slice(-100);
      });
    }

    const patchText = maybePatchContent(evt.event, payload);
    if (patchText) {
      setPatches((prev) => {
        const next = [...prev, { id, time: now, event: evt.event, content: patchText }];
        return next.slice(-50);
      });
    }

    if (evt.event === "permission.request" && payload && typeof payload === "object") {
      const request = payload as Record<string, unknown>;
      const requiresWriteConfirm = Boolean(request.requires_write_confirm);
      const requestId = typeof request.request_id === "string" ? request.request_id : "";
      const kind = typeof request.kind === "string" ? request.kind : "unknown";
      const incomingSessionId =
        typeof request.session_id === "string"
          ? request.session_id
          : typeof request.copilot_session_id === "string"
            ? request.copilot_session_id
            : sessionId;

      if (requiresWriteConfirm && requestId) {
        setPermissionRequests((prev) => {
          if (prev.some((item) => item.requestId === requestId)) {
            return prev;
          }
          const next = [
            ...prev,
            {
              id,
              time: now,
              sessionId: incomingSessionId,
              requestId,
              kind,
              raw,
            },
          ];
          return next.slice(-20);
        });
      }
    }

    if (evt.event === "permission.decision" && payload && typeof payload === "object") {
      const request = payload as Record<string, unknown>;
      const requestId = typeof request.request_id === "string" ? request.request_id : "";
      if (requestId) {
        setPermissionRequests((prev) => prev.filter((item) => item.requestId !== requestId));
      }
    }

    if (payload && typeof payload === "object") {
      const parsed = payload as Record<string, unknown>;
      const deltaValue =
        (typeof parsed.delta === "string" && parsed.delta) ||
        (typeof parsed.deltaContent === "string" && parsed.deltaContent) ||
        (typeof parsed.delta_content === "string" && parsed.delta_content) ||
        (typeof parsed.DeltaContent === "string" && parsed.DeltaContent) ||
        "";

      if ((evt.event === "delta" || evt.event === "assistant.message_delta") && deltaValue) {
        setDeltaText((prev) => prev + deltaValue);
      }

      const contentValue =
        (typeof parsed.content === "string" && parsed.content) ||
        (typeof parsed.Content === "string" && parsed.Content) ||
        "";
      if ((evt.event === "message" || evt.event === "assistant.message") && contentValue && !deltaValue) {
        setDeltaText(contentValue);
      }

      if (evt.event === "completed" && contentValue) {
        setDeltaText(contentValue);
      }
      if (evt.event === "completed") {
        setStreaming(false);
      }

      if (evt.event === "error") {
        const detail =
          (typeof parsed.detail === "string" && parsed.detail) ||
          (typeof parsed.error === "string" && parsed.error) ||
          raw;
        setErrorText(detail);
        setStreaming(false);
      }
    }
  };

  const submitPermissionDecision = (requestId: string, approved: boolean) => {
    const pending = permissionRequests.find((item) => item.requestId === requestId);
    if (!pending) {
      return;
    }

    const ok = sseClient.send({
      type: "llm.permission.decision",
      session_id: pending.sessionId || sessionId,
      request_id: requestId,
      approved,
      reason: approved ? "" : "rejected by user",
      require_ack: false,
    });

    if (!ok) {
      setErrorText("Realtime WS 未连接，无法提交确认");
      return;
    }

    setPermissionRequests((prev) => prev.filter((item) => item.requestId !== requestId));
  };

  const startStream = async () => {
    if (!prompt.trim() || streaming) {
      return;
    }

    setStreaming(true);
    setDeltaText("");
    setErrorText("");
    setLastEvent("connecting");
    setTimeline([]);
    setCommands([]);
    setPatches([]);
    setPermissionRequests([]);
    setRawJson("");
    const newSessionId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    setSessionId(newSessionId);

    try {
      if (sseClient.getTransport() !== "websocket") {
        throw new Error("当前 realtime transport 不是 websocket");
      }
      if (sseClient.getStatus() !== "open") {
        throw new Error("realtime websocket 尚未连接，请稍后重试");
      }

      const sent = sseClient.send({
        type: "llm.chat.start",
        session_id: newSessionId,
        prompt,
        require_ack: false,
      });
      if (!sent) {
        throw new Error("发送 llm.chat.start 失败");
      }
      setLastEvent("started");
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : String(error));
      setStreaming(false);
    }
  };

  const stopStream = () => {
    if (sessionId) {
      sseClient.send({
        type: "llm.chat.stop",
        session_id: sessionId,
        require_ack: false,
      });
    }
    setStreaming(false);
    setLastEvent("stopped");
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <Card title="LLM WebSocket Test" variant="outlined">
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Input.TextArea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="输入 prompt"
          />

          <Space>
            <Button type="primary" onClick={startStream} loading={streaming}>
              Start WS Chat
            </Button>
            <Button onClick={stopStream} disabled={!streaming}>
              Stop
            </Button>
            <Typography.Text type="secondary">last event: {lastEvent || "-"}</Typography.Text>
          </Space>

          <Card size="small" title="Streaming Output">
            <Typography.Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
              {deltaText || "(empty)"}
            </Typography.Paragraph>
          </Card>

          <Card
            size="small"
            title={`Timeline (${timeline.length})`}
            extra={<Typography.Text type="secondary">latest 300</Typography.Text>}
          >
            <div style={{ maxHeight: 240, overflow: "auto", border: "1px solid #f0f0f0", padding: 8 }}>
              {timeline.length === 0 ? (
                <Typography.Text type="secondary">(empty)</Typography.Text>
              ) : (
                timeline.map((item) => (
                  <div key={item.id} style={{ marginBottom: 8 }}>
                    <Typography.Text strong>{item.time}</Typography.Text>
                    <Typography.Text style={{ marginLeft: 8 }}>{item.event}</Typography.Text>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card
            size="small"
            title={`Write Confirmations (${permissionRequests.length})`}
            extra={<Typography.Text type="secondary">need approve before file changes</Typography.Text>}
          >
            <div style={{ maxHeight: 240, overflow: "auto", border: "1px solid #f0f0f0", padding: 8 }}>
              {permissionRequests.length === 0 ? (
                <Typography.Text type="secondary">(empty)</Typography.Text>
              ) : (
                permissionRequests.map((item) => (
                  <div key={item.id} style={{ marginBottom: 12, borderBottom: "1px dashed #f0f0f0", paddingBottom: 10 }}>
                    <Typography.Text strong>{item.time}</Typography.Text>
                    <Typography.Text style={{ marginLeft: 8 }}>kind: {item.kind}</Typography.Text>
                    <Typography.Paragraph
                      style={{ marginBottom: 8, marginTop: 4, whiteSpace: "pre-wrap", fontFamily: "monospace" }}
                    >
                      {item.raw}
                    </Typography.Paragraph>
                    <Space>
                      <Button type="primary" size="small" onClick={() => submitPermissionDecision(item.requestId, true)}>
                        Approve
                      </Button>
                      <Button danger size="small" onClick={() => submitPermissionDecision(item.requestId, false)}>
                        Deny
                      </Button>
                    </Space>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card
            size="small"
            title={`Command Events (${commands.length})`}
            extra={<Typography.Text type="secondary">latest 100</Typography.Text>}
          >
            <div style={{ maxHeight: 220, overflow: "auto", border: "1px solid #f0f0f0", padding: 8 }}>
              {commands.length === 0 ? (
                <Typography.Text type="secondary">(empty)</Typography.Text>
              ) : (
                commands.map((item) => (
                  <div key={item.id} style={{ marginBottom: 10 }}>
                    <Typography.Text strong>{item.time}</Typography.Text>
                    <Typography.Text style={{ marginLeft: 8 }}>{item.event}</Typography.Text>
                    <Typography.Paragraph
                      style={{ marginBottom: 0, marginTop: 4, whiteSpace: "pre-wrap", fontFamily: "monospace" }}
                    >
                      {item.command}
                    </Typography.Paragraph>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card
            size="small"
            title={`Patch / Diff Events (${patches.length})`}
            extra={<Typography.Text type="secondary">latest 50</Typography.Text>}
          >
            <div style={{ maxHeight: 260, overflow: "auto", border: "1px solid #f0f0f0", padding: 8 }}>
              {patches.length === 0 ? (
                <Typography.Text type="secondary">(empty)</Typography.Text>
              ) : (
                patches.map((item) => (
                  <div key={item.id} style={{ marginBottom: 12 }}>
                    <Typography.Text strong>{item.time}</Typography.Text>
                    <Typography.Text style={{ marginLeft: 8 }}>{item.event}</Typography.Text>
                    <Typography.Paragraph
                      style={{ marginBottom: 0, marginTop: 4, whiteSpace: "pre-wrap", fontFamily: "monospace" }}
                    >
                      {item.content}
                    </Typography.Paragraph>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card size="small" title="Raw JSON (Latest Event)">
            <Typography.Paragraph
              style={{ marginBottom: 0, whiteSpace: "pre-wrap", fontFamily: "monospace" }}
            >
              {rawJson || "(empty)"}
            </Typography.Paragraph>
          </Card>

          {errorText ? (
            <Typography.Text type="danger">{errorText}</Typography.Text>
          ) : null}
        </Space>
      </Card>
    </div>
  );
};

export default Test;
