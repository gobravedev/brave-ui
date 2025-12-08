import { Bubble, BubbleProps, Sender, useXAgent, useXChat } from "@ant-design/x";
import { Button, Flex, GetProp, Typography } from "antd";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import { AppstoreAddOutlined, CloudUploadOutlined, CopyOutlined, DislikeOutlined, LikeOutlined, OpenAIFilled, PaperClipOutlined, ProductOutlined, ReloadOutlined, ScheduleOutlined, UserOutlined } from '@ant-design/icons';
import markdownit from 'markdown-it';
import analysisList from "../analysis-list";

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
    typing: { step: 5, interval: 20 },
    style: {
      maxWidth: 600,
    }, footer: (
      <div style={{ display: 'flex' }}>
        <Button type="text" size="small" icon={<ReloadOutlined />} />
        <Button type="text" size="small" icon={<CopyOutlined />} />
        <Button type="text" size="small" icon={<LikeOutlined />} />
        <Button type="text" size="small" icon={<DislikeOutlined />} />
      </div>
    ),
  },
  local: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
  },
};
const md = markdownit({ html: true, breaks: true });

const renderMarkdown: BubbleProps['messageRender'] = (content) => {
  return (
    <Typography>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
      <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    </Typography>
  );
};

const AI:FC<any> = ({biz_id,type}) => {
  const [content, setContent] = React.useState('');
  const { baseURL } = useSelector((state: any) => state.user)

  // Agent for request
  const [agent] = useXAgent<string, { message: string }, string>({
    request: async ({ message }, { onSuccess, onUpdate, onError }) => {
      try {
        const res = await fetch(
          `${baseURL}/brave-api/llm/chat/stream/${type}/${biz_id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
          }
        );

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let reply = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            // 逐段解码
            const chunk = decoder.decode(value, { stream: true });
            reply += chunk;

            // 可以在这里实时更新 UI，例如：
            // 每次收到 chunk 就更新 Bubble 内容
            onUpdate(reply);
          }
        }

        // 最终完成
        onSuccess([reply]);
      } catch (err) {
        console.error("Request failed:", err);
        onError(err as Error);
      }
    },
  });

  // Chat messages
  const { onRequest, messages } = useXChat({
    agent,
  });

  return (
    <Flex vertical gap="middle">
      <Bubble.List
        roles={roles}
        style={{height:"70vh" }}

        items={messages.map(({ id, message, status }) => ({
          key: id,
          loading: status === 'loading',
          role: status === 'local' ? 'local' : 'ai',
          content: message,
          messageRender: renderMarkdown,

        }))}
      />
      <Sender
        loading={agent.isRequesting()}
        value={content}
        onChange={setContent}
        onSubmit={(nextContent) => {
          onRequest(nextContent);
          setContent('');
        }}
      />
    </Flex>
  );
};


export default AI;