import type { BubbleListProps } from '@ant-design/x';
import { Bubble, Sender } from '@ant-design/x';
import { AbstractChatProvider, DefaultMessageInfo, useXChat, XRequest, XRequestOptions } from '@ant-design/x-sdk';
import { Button, Card, Flex, Space } from 'antd';
import React, { FC, forwardRef, useEffect, useImperativeHandle } from 'react';
import { useSelector } from 'react-redux';
import XMarkdown from '@ant-design/x-markdown';
import axios from 'axios';
import { RedoOutlined } from '@ant-design/icons';
import { de } from '@faker-js/faker';

// 类型定义：自定义聊天系统的输入输出和消息结构
// Type definitions: custom chat system input/output and message structure
interface CustomInput {
    message: string;
    role: 'user';
    stream?: boolean;
    biz_type: string;
    biz_id: string;
    project_id: string;
    is_save_prompt?: boolean;

}

interface CustomOutput {
    data: string;
}

interface CustomMessage {
    content: string;
    role: 'user' | 'assistant' | 'system';
}

// 自定义Provider实现：继承AbstractChatProvider实现自定义聊天逻辑
// Custom Provider implementation: extend AbstractChatProvider to implement custom chat logic
class CustomProvider<
    ChatMessage extends CustomMessage = CustomMessage,
    Input extends CustomInput = CustomInput,
    Output extends CustomOutput = CustomOutput,
> extends AbstractChatProvider<ChatMessage, Input, Output> {
    // 转换请求参数：将用户输入转换为标准格式
    // Transform request parameters: convert user input to standard format
    transformParams(requestParams: Partial<Input>): Input {
        if (typeof requestParams !== 'object') {
            throw new Error('requestParams must be an object');
        }
        return requestParams as Input;
    }

    // 转换本地消息：将请求参数转换为本地消息格式
    // Transform local message: convert request parameters to local message format
    transformLocalMessage(requestParams: Partial<Input>): ChatMessage {
        return {
            content: requestParams.message || '',
            role: 'user',
        } as ChatMessage;
    }

    // 转换消息：处理流式响应数据
    // Transform message: process streaming response data
    transformMessage(info: any): ChatMessage {
        const { originMessage, chunk } = info || {};
        // debugger
        // 处理完成标记或空数据
        // Handle completion marker or empty data
        if (!chunk || !chunk?.data || (chunk?.data && chunk?.data?.includes('[DONE]'))) {
            return {
                content: `${originMessage?.content}`,
                role: 'assistant',
            } as ChatMessage;
        }

        try {
            // 处理流式数据：解析JSON格式
            // Process streaming data: parse JSON format
            const chunkJson = JSON.parse(chunk.data);
            const content = originMessage?.content || '';
            return {
                content: `${content}${chunkJson.content || ''}`,
                role: 'assistant',
            } as ChatMessage;
        } catch (error) {
            // 如果解析失败，直接使用原始数据
            // If parsing fails, use raw data directly
            return {
                content: `${originMessage?.content || ''}${chunk.data || ''}`,
                role: 'assistant',
            } as ChatMessage;
        }
    }
}

// 消息角色配置：定义不同角色消息的布局和样式
// Message role configuration: define layout and styles for different role messages
const role: BubbleListProps['role'] = {
    assistant: {
        placement: 'start',
        contentRender(content: CustomMessage) {
            // return (content as any)?.content;
            const newContent = content.content //.replace(/\n\n/g, '<br/><br/>');
            return <XMarkdown content={newContent} />;
        },
    },
    user: {
        placement: 'end',
        contentRender(content: CustomMessage) {
            return (content as any)?.content;
        },
    },
    system: {
        variant: 'borderless', // 无边框样式
        contentRender(content: CustomMessage) {
            return content?.content;
        },
    },
};

// 本地化钩子：根据当前语言环境返回对应的文本
// Localization hook: return corresponding text based on current language environment
const useLocale = () => {
    const isCN = typeof location !== 'undefined' ? location.pathname.endsWith('-cn') : false;
    return {
        abort: isCN ? '中止' : 'abort',
        addUserMessage: isCN ? '添加用户消息' : 'Add a user message',
        addAIMessage: isCN ? '添加AI消息' : 'Add an AI message',
        addSystemMessage: isCN ? '添加系统消息' : 'Add a system message',
        editLastMessage: isCN ? '编辑最后一条消息' : 'Edit the last message',
        placeholder: isCN
            ? '请输入内容，按下 Enter 发送消息'
            : 'Please enter content and press Enter to send message',
        waiting: isCN ? '等待中...' : 'Waiting...',
        mockFailed: isCN ? '模拟失败返回，请稍后再试。' : 'Mock failed return. Please try again later.',
        historyUserMessage: isCN ? '这是一条历史消息' : 'This is a historical message',
        historyAIResponse: isCN
            ? '这是一条历史回答消息，请发送新消息。'
            : 'This is a historical response message, please send a new message.',
        editSystemMessage: isCN ? '编辑系统消息' : 'Edit a system message',
        editUserMessage: isCN ? '编辑用户消息' : 'Edit a user message',
        editAIResponse: isCN ? '编辑AI回复' : 'Edit an AI response',
        customProviderTitle: isCN ? '自定义Provider示例' : 'Custom Provider Example',
        customProviderDesc: isCN
            ? '这是一个使用自定义Provider的示例，展示了如何继承AbstractChatProvider来实现自定义的数据处理逻辑。'
            : 'This is an example using a custom provider, demonstrating how to extend AbstractChatProvider to implement custom data processing logic.',
    };
};

const App = forwardRef<any, any>(({ biz_id, biz_type }, ref) => {
    const { baseURL, project } = useSelector((state: any) => state.user)

    const [content, setContent] = React.useState('');
    const locale = useLocale();

    // const [defaultMessages, setDefaultMessages] = React.useState<any>([])
    const BASE_URL = `${baseURL}/brave-api/llm/chat/stream`
    // const BASE_URL = 'https://api.x.ant.design/api/custom_chat_provider_stream'
    const loadHistoryMessage = async () => {
        const resp = await axios.post(`/llm/chat/history`, {
            biz_id: biz_id,
            // biz_type: biz_type,
            project_id: project,
        });
        const data = resp.data.map((item: any) => {
            return { id: item.id, message: { content: item.content, role: item.role }, status: 'local' }
        })
        // console.log('history message resp:', data);
        setMessages(data)
        // setDefaultMessages(data)

    }




    // 使用自定义Provider：创建自定义聊天提供者实例
    // Use custom provider: create custom chat provider instance
    const [provider] = React.useState(
        new CustomProvider<CustomMessage, CustomInput, CustomOutput>({
            // 'https://api.x.ant.design/api/custom_chat_provider_stream'
            request: XRequest(BASE_URL, {
                manual: true,
                // fetch: async (
                //     url: Parameters<typeof fetch>[0],
                //     options: XRequestOptions<any, any>,
                // ) => {
                //     const response = await fetch(url, {
                //         method: 'POST',
                //         headers: { 'Content-Type': 'application/json' },
                //         body: JSON.stringify(options.params || '{}'),
                //     });
                //     return response;
                // },
                // transformStream: new TransformStream<string, any>({
                //     transform(chunk, controller) {
                //         controller.enqueue(chunk);
                //     },
                // }),
            }),
        }),
    );

    // 聊天消息管理：使用聊天钩子管理消息和请求
    // Chat message management: use chat hook to manage messages and requests
    const { onRequest, messages, abort, isRequesting, setMessages, setMessage } = useXChat({
        provider,
        requestPlaceholder: { content: locale.waiting, role: 'assistant' },
        requestFallback: (_, { error, errorInfo, messageInfo }) => {
            console.error('Request failed:', error, errorInfo, messageInfo);
            return { content: locale.mockFailed, role: 'assistant' }
        },
        // defaultMessages: defaultMessages,
        // defaultMessages: [
        //     {
        //         id: '1',
        //         message: { role: 'user', content: locale.historyUserMessage },
        //         status: 'success',
        //     },
        //     {
        //         id: '2',
        //         message: { role: 'assistant', content: locale.historyAIResponse },
        //         status: 'success',
        //     },
        // ]
    });

    // const addUserMessage = () => {
    //     setMessages([
    //         ...messages,
    //         {
    //             id: Date.now(),
    //             message: { content: locale.addUserMessage, role: 'user' },
    //             status: 'local',
    //         },
    //     ]);
    // };

    // const addAIMessage = () => {
    //     setMessages([
    //         ...messages,
    //         {
    //             id: Date.now(),
    //             message: { content: locale.addAIMessage, role: 'assistant' },
    //             status: 'success',
    //         },
    //     ]);
    // };

    // const addSystemMessage = () => {
    //     setMessages([
    //         ...messages,
    //         {
    //             id: Date.now(),
    //             message: { role: 'system', content: locale.addSystemMessage },
    //             status: 'success',
    //         },
    //     ]);
    // };

    // const editLastMessage = () => {
    //     const lastMessage = messages[messages.length - 1];
    //     setMessage(lastMessage.id, {
    //         message: { role: lastMessage.message.role, content: locale.editSystemMessage },
    //     });
    // };




    useEffect(() => {
        loadHistoryMessage();
    }, [project, biz_id])
    
    useImperativeHandle(ref, () => ({
        loadHistoryMessage
    }))

    return (
        // <Card
        //     title={`Chat with ${biz_id}`}
        //     extra={<Space>
        //         <RedoOutlined style={{ cursor: "pointer" }} onClick={loadHistoryMesage} />
        //     </Space>}>
        <Flex vertical gap="middle">

            {/* <div>
                <h3>{locale.customProviderTitle}</h3>
                <p>{locale.customProviderDesc}</p>
            </div> */}
            {/* <Flex gap="small">
                <Button disabled={!isRequesting} onClick={abort}>
                    {locale.abort}
                </Button>
                <Button onClick={addUserMessage}>{locale.addUserMessage}</Button>
                <Button onClick={addAIMessage}>{locale.addAIMessage}</Button>
                <Button onClick={addSystemMessage}>{locale.addSystemMessage}</Button>
                <Button disabled={!messages.length} onClick={editLastMessage}>
                    {locale.editLastMessage}
                </Button>
            </Flex> */}

            {/* 消息列表：显示所有聊天消息 */}
            {/* Message list: display all chat messages */}
            <Bubble.List
                role={role}
                style={{ height: "70vh" }}
                items={messages.map(({ id, message, status }) => ({
                    key: id,
                    loading: status === 'loading',
                    role: message.role,
                    content: message,
                }))}
            />

            {/* 发送器：用户输入区域，支持发送消息和中止请求 */}
            {/* Sender: user input area, supports sending messages and aborting requests */}
            <Sender
                loading={isRequesting}
                value={content}
                onChange={setContent}
                onCancel={abort}
                placeholder={"Please ask me questions related to bioinformatics ..."}
                onSubmit={(nextContent) => {
                    onRequest({
                        stream: true,
                        role: 'user',
                        message: nextContent,
                        biz_id: biz_id,
                        biz_type: biz_type,
                        project_id: project,
                        is_save_prompt: true,
                    });
                    setContent('');
                }}
            />
        </Flex>

        // </Card>

    );
})

export default App;