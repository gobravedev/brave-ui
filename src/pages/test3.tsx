import {
  BulbOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  LoadingOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  Bubble,
  Prompts,
  Sender,
  ThoughtChain,
  Welcome,
  type ThoughtChainItemType,
} from "@ant-design/x";
import XMarkdown from "@ant-design/x-markdown";
import { Alert, Button, Card, Flex, Space, Tag, Typography, type GetProp } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sseClient } from "@/sse";

type WSIncomingEvent = {
  event: string;
  data: unknown;
};

type PermissionRequestItem = {
  requestId: string;
  sessionId: string;
  kind: string;
};

type ThoughtGroup = "thought" | "tool" | "file" | "permission";

type ChatMessage = {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
  loading?: boolean;
  think?: ThoughtChainItemType[];
  kind?: "event" | "command" | "diff" | "permission";
  eventName?: string;
  raw?: string;
  commandText?: string;
  diffText?: string;
  requestId?: string;
  requestStatus?: "pending" | "approved" | "denied";
  permissionKind?: string;
};

const QUICK_PROMPTS = [
  "解释一下当前项目的前端技术栈",
  "帮我设计一个可扩展的 LLM 聊天页面架构",
  "总结这个页面里实时消息处理的关键点",
];

function makeId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

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

function extractDeltaText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const data = payload as Record<string, unknown>;
  return (
    (typeof data.delta === "string" && data.delta) ||
    (typeof data.deltaContent === "string" && data.deltaContent) ||
    (typeof data.delta_content === "string" && data.delta_content) ||
    (typeof data.DeltaContent === "string" && data.DeltaContent) ||
    ""
  );
}

function extractContentText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const data = payload as Record<string, unknown>;
  return (
    (typeof data.content === "string" && data.content) ||
    (typeof data.Content === "string" && data.Content) ||
    (typeof data.message === "string" && data.message) ||
    ""
  );
}

function clipText(text: string, max = 1800) {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max)}\n...(truncated)`;
}

const Test = () => {
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [lastEvent, setLastEvent] = useState("");
  const [errorText, setErrorText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequestItem[]>([]);
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  const activeSessionRef = useRef("");
  const pendingAssistantIdRef = useRef("");
  const streamingRef = useRef(false);
  const handleEventRef = useRef<(evt: WSIncomingEvent, incomingSessionId: string) => void>();

  useEffect(() => {
    streamingRef.current = streaming;
  }, [streaming]);

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message].slice(-250));
  };

  const updateMessage = (id: string, updater: (msg: ChatMessage) => ChatMessage) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? updater(msg) : msg)));
  };

  const clearAll = () => {
    setMessages([]);
    setErrorText("");
    setLastEvent("");
    setExpandedKeys([]);
    setPermissionRequests([]);
    setCollapsedCards({});
  };

  const newSession = () => {
    if (streaming && activeSessionRef.current) {
      sseClient.send({
        type: "llm.chat.stop",
        session_id: activeSessionRef.current,
        require_ack: false,
      });
    }

    setStreaming(false);
    setSessionId("");
    activeSessionRef.current = "";
    pendingAssistantIdRef.current = "";
    clearAll();
  };

  const ensureAssistantMessage = () => {
    if (pendingAssistantIdRef.current) {
      return pendingAssistantIdRef.current;
    }

    const assistantId = makeId();
    pendingAssistantIdRef.current = assistantId;
    appendMessage({
      id: assistantId,
      role: "assistant",
      content: "",
      loading: true,
      think: [],
    });
    return assistantId;
  };

  const toThoughtTitle = (group: ThoughtGroup, title: string) => {
    if (group === "tool") {
      return `工具调用 · ${title}`;
    }
    if (group === "file") {
      return `文件改动 · ${title}`;
    }
    if (group === "permission") {
      return `权限 · ${title}`;
    }
    return `思考 · ${title}`;
  };

  const toThoughtIcon = (group: ThoughtGroup, status: ThoughtChainItemType["status"]) => {
    if (status === "loading") {
      return <LoadingOutlined style={{ color: "#1677ff" }} />;
    }
    if (status === "error") {
      return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
    }
    if (group === "tool") {
      return <ToolOutlined style={{ color: "#13c2c2" }} />;
    }
    if (group === "file") {
      return <FileTextOutlined style={{ color: "#fa8c16" }} />;
    }
    if (group === "permission") {
      return <SafetyCertificateOutlined style={{ color: "#722ed1" }} />;
    }
    if (status === "success") {
      return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    }
    return <BulbOutlined style={{ color: "#1677ff" }} />;
  };

  const addAssistantThought = (
    group: ThoughtGroup,
    title: string,
    description: string,
    status: ThoughtChainItemType["status"] = "success"
  ) => {
    const assistantId = ensureAssistantMessage();
    updateMessage(assistantId, (msg) => {
      const nextThink = [
        ...(msg.think || []),
        {
          key: makeId(),
          title: toThoughtTitle(group, title),
          description,
          status,
          icon: toThoughtIcon(group, status),
        },
      ].slice(-50);

      return {
        ...msg,
        think: nextThink,
      };
    });
  };

  const updateAssistantMessage = (nextText: string, mode: "append" | "replace") => {
    const assistantId = ensureAssistantMessage();
    updateMessage(assistantId, (msg) => {
      const nextContent = mode === "append" ? `${msg.content}${nextText}` : nextText;
      return {
        ...msg,
        content: nextContent,
        loading: streamingRef.current,
      };
    });
  };

  const finishAssistantMessage = () => {
    if (!pendingAssistantIdRef.current) {
      return;
    }

    const assistantId = pendingAssistantIdRef.current;
    pendingAssistantIdRef.current = "";
    updateMessage(assistantId, (msg) => ({
      ...msg,
      loading: false,
    }));
  };

  const appendSystemEvent = (event: string, payload: unknown) => {
    const raw = clipText(toPrettyJSON(payload));
    appendMessage({
      id: makeId(),
      role: "system",
      kind: "event",
      eventName: event,
      raw,
      content: "",
    });
  };

  const appendCommandCard = (event: string, commandText: string) => {
    appendMessage({
      id: makeId(),
      role: "system",
      kind: "command",
      eventName: event,
      commandText,
      content: "",
    });
  };

  const appendDiffCard = (event: string, diffText: string) => {
    const id = makeId();
    appendMessage({
      id,
      role: "system",
      kind: "diff",
      eventName: event,
      diffText,
      content: "",
    });
    setCollapsedCards((prev) => ({ ...prev, [id]: true }));
  };

  const getCardCollapsed = useCallback((msg: ChatMessage) => {
    const current = collapsedCards[msg.id];
    if (typeof current === "boolean") {
      return current;
    }
    return msg.kind === "diff";
  }, [collapsedCards]);

  const toggleCard = useCallback((id: string) => {
    setCollapsedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setErrorText("复制失败：浏览器不支持剪贴板或权限不足");
    }
  }, []);

  const setPermissionStatus = (requestId: string, status: "approved" | "denied") => {
    setMessages((prev) =>
      prev.map((item) => {
        if (item.requestId !== requestId) {
          return item;
        }
        return {
          ...item,
          requestStatus: status,
        };
      })
    );
  };

  const handlePermissionEvent = (evt: WSIncomingEvent, incomingSessionId: string) => {
    if (evt.event === "permission.request" && evt.data && typeof evt.data === "object") {
      const request = evt.data as Record<string, unknown>;
      const requiresWriteConfirm = Boolean(request.requires_write_confirm);
      const requestId = typeof request.request_id === "string" ? request.request_id : "";
      const kind = typeof request.kind === "string" ? request.kind : "unknown";
      const sid =
        typeof request.session_id === "string"
          ? request.session_id
          : typeof request.copilot_session_id === "string"
            ? request.copilot_session_id
            : incomingSessionId;

      if (requiresWriteConfirm && requestId) {
        setPermissionRequests((prev) => {
          if (prev.some((item) => item.requestId === requestId)) {
            return prev;
          }
          return [...prev, { requestId, sessionId: sid, kind }];
        });

        appendMessage({
          id: makeId(),
          role: "system",
          kind: "permission",
          requestId,
          requestStatus: "pending",
          permissionKind: kind,
          content: `需要确认权限：${kind}。请在此消息下方 Approve 或 Deny。`,
        });

        addAssistantThought("permission", "权限请求", `等待你确认 ${kind} 操作`, "loading");
      }
      return;
    }

    if (evt.event === "permission.decision" && evt.data && typeof evt.data === "object") {
      const request = evt.data as Record<string, unknown>;
      const requestId = typeof request.request_id === "string" ? request.request_id : "";
      const approved = Boolean(request.approved);
      if (requestId) {
        setPermissionRequests((prev) => prev.filter((item) => item.requestId !== requestId));
        setPermissionStatus(requestId, approved ? "approved" : "denied");
        addAssistantThought(
          "permission",
          "权限结果",
          approved ? "权限已批准，继续执行" : "权限被拒绝",
          approved ? "success" : "error"
        );
      }
    }
  };

  const handleEvent = (evt: WSIncomingEvent, incomingSessionId: string) => {
    setLastEvent(evt.event);

    const commandText = extractCommandText(evt.data);
    if (commandText) {
      addAssistantThought("tool", "执行命令", `\`\`\`bash\n${commandText}\n\`\`\``, "success");
      appendCommandCard(`command@${evt.event}`, commandText);
    }

    const patchText = maybePatchContent(evt.event, evt.data);
    if (patchText) {
      const shortDiff = clipText(patchText, 2400);
      addAssistantThought("file", "代码变更", `\`\`\`diff\n${clipText(shortDiff, 1200)}\n\`\`\``, "success");
      appendDiffCard(`patch@${evt.event}`, shortDiff);
    }

    handlePermissionEvent(evt, incomingSessionId);

    const delta = extractDeltaText(evt.data);
    if ((evt.event === "delta" || evt.event === "assistant.message_delta") && delta) {
      updateAssistantMessage(delta, "append");
    }

    const content = extractContentText(evt.data);
    if ((evt.event === "message" || evt.event === "assistant.message") && content && !delta) {
      updateAssistantMessage(content, "replace");
    }

    if (evt.event === "start" || evt.event === "session.started") {
      addAssistantThought("thought", "会话启动", `已连接会话 ${incomingSessionId}`, "success");
      appendSystemEvent(evt.event, evt.data);
    }

    if (evt.event === "completed") {
      if (content) {
        updateAssistantMessage(content, "replace");
      }
      setStreaming(false);
      addAssistantThought("thought", "完成", "回答与工具调用已结束", "success");
      finishAssistantMessage();
    }

    if (evt.event === "error") {
      const fallback = toPrettyJSON(evt.data);
      const detail =
        evt.data && typeof evt.data === "object"
          ? (() => {
              const parsed = evt.data as Record<string, unknown>;
              return (
                (typeof parsed.detail === "string" && parsed.detail) ||
                (typeof parsed.error === "string" && parsed.error) ||
                fallback
              );
            })()
          : fallback;

      setErrorText(detail);
      setStreaming(false);
      addAssistantThought("thought", "错误", detail, "error");
      appendSystemEvent("error", evt.data);
      finishAssistantMessage();
    }
  };

  useEffect(() => {
    handleEventRef.current = handleEvent;
  });

  useEffect(() => {
    const unsubscribe = sseClient.onMessage((data: unknown) => {
      if (!data || typeof data !== "object") {
        return;
      }

      const msg = data as Record<string, unknown>;
      if (msg.type !== "llm.event") {
        return;
      }

      const incomingSessionId = typeof msg.session_id === "string" ? msg.session_id : "";
      if (!incomingSessionId) {
        return;
      }

      const activeSessionId = activeSessionRef.current;
      if (activeSessionId && activeSessionId !== incomingSessionId) {
        return;
      }

      if (!activeSessionId) {
        activeSessionRef.current = incomingSessionId;
        setSessionId(incomingSessionId);
      }

      const evtName = typeof msg.event === "string" ? msg.event : "message";
      const evt: WSIncomingEvent = {
        event: evtName,
        data: msg.data,
      };

      handleEventRef.current?.(evt, incomingSessionId);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const sendPrompt = (prompt: string) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || streaming) {
      return;
    }

    setErrorText("");
    setLastEvent("connecting");

    const sid =
      activeSessionRef.current ||
      (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : makeId());

    if (!activeSessionRef.current) {
      activeSessionRef.current = sid;
      setSessionId(sid);
    }

    const assistantId = makeId();
    pendingAssistantIdRef.current = assistantId;

    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        role: "user",
        content: cleanPrompt,
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        loading: true,
        think: [
          {
            key: makeId(),
            title: "思考 · 准备中",
            description: "正在连接并发送请求",
            status: "loading",
            icon: <LoadingOutlined style={{ color: "#1677ff" }} />,
          },
        ],
      },
    ]);

    try {
      if (sseClient.getTransport() !== "websocket") {
        throw new Error("当前 realtime transport 不是 websocket");
      }
      if (sseClient.getStatus() !== "open") {
        throw new Error("realtime websocket 尚未连接，请稍后重试");
      }

      const sent = sseClient.send({
        type: "llm.chat.start",
        session_id: sid,
        prompt: cleanPrompt,
        require_ack: false,
      });

      if (!sent) {
        throw new Error("发送 llm.chat.start 失败");
      }

      setStreaming(true);
      setLastEvent("started");
      setInputValue("");
    } catch (error) {
      setStreaming(false);
      finishAssistantMessage();
      setErrorText(error instanceof Error ? error.message : String(error));
    }
  };

  const stopStream = () => {
    const sid = activeSessionRef.current;
    if (sid) {
      sseClient.send({
        type: "llm.chat.stop",
        session_id: sid,
        require_ack: false,
      });
    }

    setStreaming(false);
    setLastEvent("stopped");
    addAssistantThought("thought", "手动停止", "你已停止当前流式会话", "error");
    finishAssistantMessage();
  };

  const submitPermissionDecision = useCallback((requestId: string, approved: boolean) => {
    const pending = permissionRequests.find((item) => item.requestId === requestId);
    if (!pending) {
      return;
    }

    const ok = sseClient.send({
      type: "llm.permission.decision",
      session_id: pending.sessionId || activeSessionRef.current,
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
    setPermissionStatus(requestId, approved ? "approved" : "denied");
  }, [permissionRequests]);

  const bubbleRole = useMemo<GetProp<typeof Bubble.List, "role">>(
    () => ({
      assistant: {
        placement: "start",
        header: (content: ChatMessage) => {
          if (!content?.think?.length) {
            return null;
          }
          return (
            <ThoughtChain
              items={content.think}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys as string[])}
            />
          );
        },
        contentRender: (content: ChatMessage) => <XMarkdown content={String(content?.content ?? "")} />,
      },
      user: {
        placement: "end",
        contentRender: (content: ChatMessage) => <XMarkdown content={String(content?.content ?? "")} />,
      },
      system: {
        variant: "borderless",
        contentRender: (content: ChatMessage) => {
          
          return <></>;
        },
        footer: (content: ChatMessage) => {
          if (!content?.requestId) {
            return null;
          }

          if (content.requestStatus === "approved") {
            return <Tag color="success">Approved</Tag>;
          }

          if (content.requestStatus === "denied") {
            return <Tag color="error">Denied</Tag>;
          }

          return (
            <Space>
              <Tag color="warning">需要确认 {content.permissionKind || "permission"}</Tag>
              <Button size="small" type="primary" onClick={() => submitPermissionDecision(content.requestId!, true)}>
                Approve
              </Button>
              <Button size="small" danger onClick={() => submitPermissionDecision(content.requestId!, false)}>
                Deny
              </Button>
            </Space>
          );
        },
      },
    }),
    [expandedKeys, getCardCollapsed, toggleCard, copyToClipboard, submitPermissionDecision]
  );

  return (
    <div style={{ padding: 20 }}>
      <Card
        title="LLM Chat UI (Copilot-like Timeline)"
        extra={
          <Space>
            <Tag color={streaming ? "processing" : "default"}>
              {streaming ? "streaming" : "idle"}
            </Tag>
            <Typography.Text type="secondary">session: {sessionId || "-"}</Typography.Text>
            <Typography.Text type="secondary">last: {lastEvent || "-"}</Typography.Text>
            <Button icon={<DeleteOutlined />} onClick={newSession}>
              New Session
            </Button>
          </Space>
        }
      >
        <Flex vertical gap={12}>
          {errorText ? <Alert type="error" showIcon message={errorText} /> : null}

          <Card size="small" style={{ minHeight: 520 }}>
            {messages.length === 0 ? (
              <Flex vertical gap={12}>
                <Welcome
                  variant="borderless"
                  title="欢迎使用 LLM 聊天"
                  description="所有执行轨迹都会直接进入聊天框，包括思考链、命令、权限确认与错误。"
                />
                <Prompts
                  title="快速开始"
                  items={QUICK_PROMPTS.map((item) => ({ key: item, description: item }))}
                  onItemClick={(info) => {
                    const value = (info?.data?.description as string) || "";
                    if (value) {
                      sendPrompt(value);
                    }
                  }}
                />
              </Flex>
            ) : (
              <Bubble.List
                role={bubbleRole}
                style={{ maxHeight: "68vh", overflow: "auto", paddingInline: 8 }}
                items={messages.map((item) => ({
                  key: item.id,
                  role: item.role,
                  content: item,
                  loading: Boolean(item.loading),
                }))}
              />
            )}
          </Card>

          <Sender
            loading={streaming}
            value={inputValue}
            onChange={setInputValue}
            onCancel={stopStream}
            placeholder="输入问题，按 Enter 发送"
            onSubmit={(nextValue) => {
              sendPrompt(nextValue);
            }}
            actions={(_, info) => {
              const { SendButton, LoadingButton } = info.components;
              return (
                <Space>
                  {streaming ? <LoadingButton /> : <SendButton />}
                  <Button onClick={stopStream} disabled={!streaming}>
                    Stop
                  </Button>
                  <Button onClick={clearAll} disabled={streaming}>
                    Clear UI
                  </Button>
                </Space>
              );
            }}
          />
        </Flex>
      </Card>
    </div>
  );
};

export default Test;
