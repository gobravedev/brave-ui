import type { BubbleItemType, BubbleListProps, ThoughtChainItemType, ThoughtChainProps } from '@ant-design/x';
import { Bubble, Sender, ThoughtChain } from '@ant-design/x';
import { AbstractChatProvider, DefaultMessageInfo, useXChat, XRequest, XRequestOptions } from '@ant-design/x-sdk';
import { Button, Card, Flex, GetProp, Popconfirm, Space, Tag, Typography } from 'antd';
import React, { FC, forwardRef, useEffect, useImperativeHandle } from 'react';
import { useSelector } from 'react-redux';
import XMarkdown from '@ant-design/x-markdown';
import axios from 'axios';
import { CheckCircleOutlined, ClearOutlined, CodeOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined, LoadingOutlined, RedoOutlined } from '@ant-design/icons';
import { de } from '@faker-js/faker';
import { useGlobalMessage } from '@/hooks/useGlobalMessage';
import { Footer } from 'antd/es/layout/layout';
const { Text } = Typography;

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
    think?: any[];
    role: 'user' | 'assistant' | 'system';
}
interface CustomProviderOptions {
    setThoughtChainItems?: any
}


function getStatusIcon(status: ThoughtChainItemType['status']) {
    switch (status) {
        case 'success':
            return <CheckCircleOutlined />;
        case 'error':
            return <InfoCircleOutlined />;
        case 'loading':
            return <LoadingOutlined />;
        default:
            return undefined;
    }
}


// 自定义Provider实现：继承AbstractChatProvider实现自定义聊天逻辑
// Custom Provider implementation: extend AbstractChatProvider to implement custom chat logic
class CustomProvider<
    ChatMessage extends CustomMessage = CustomMessage,
    Input extends CustomInput = CustomInput,
    Output extends CustomOutput = CustomOutput,
> extends AbstractChatProvider<ChatMessage, Input, Output> {

    private setThoughtChainItems?: any;
    constructor(
        options: any,
        customOptions?: CustomProviderOptions,
    ) {
        super(options);
        this.setThoughtChainItems = customOptions?.setThoughtChainItems;
    }

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
        // console.log('stream info:', info);
        if (chunk?.event == "status") {
            const chunkJson: any = JSON.parse(chunk.data);
            // this.setThoughtChainItems((prev: any) => [
            //     ...prev,
            //     {
            //         title: chunkJson?.title,
            //         description: chunkJson?.content,
            //         status: 'success',
            //         icon: getStatusIcon('success'),
            //     },
            // ]);
            // console.log('updated thought chain items:', chunkJson?.content);

            // this.setThoughtChainItems(chunkJson?.content);
            const data = {
                think: [...(originMessage?.think || []), chunkJson],
                content: originMessage?.content || '',
                role: 'assistant',
            } as ChatMessage;
            console.log('status chunk data:', data);
            return data
        } else {
            // debugger
            // 处理完成标记或空数据
            // Handle completion marker or empty data
            if (!chunk || !chunk?.data || (chunk?.data && chunk?.data?.includes('[DONE]'))) {
                return {
                    think: originMessage?.think || [],
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
                    think: originMessage?.think || [],
                    content: `${content}${chunkJson.content || ''}`,
                    role: 'assistant',
                } as ChatMessage;
            } catch (error) {
                // 如果解析失败，直接使用原始数据
                // If parsing fails, use raw data directly
                return {
                    think: originMessage?.think || [],
                    content: `${originMessage?.content || ''}${chunk.data || ''}`,
                    role: 'assistant',
                } as ChatMessage;
            }
        }


    }
}

// 消息角色配置：定义不同角色消息的布局和样式
// Message role configuration: define layout and styles for different role messages
const roles = (
    setMessage: any,
    loadHistoryMessage: any,
    thoughtChainItems?: ThoughtChainProps['items'],
    expandedKeys: string[] = [],
    onExpandedKeys?: any,
): GetProp<typeof Bubble.List, 'role'> => (
    {

        assistant: {
            footerPlacement: 'inner-start',
            placement: 'start',
            header: (content, { status }) => {
                // console.log('assistant header content:', content);
                // const config = ThoughtChainConfig[status as keyof typeof ThoughtChainConfig];
                return <>
                    <ThoughtChain items={content.think} expandedKeys={expandedKeys} onExpand={onExpandedKeys} />

                </>
            },
            contentRender(content: CustomMessage) {
                // return (content as any)?.content;
                const newContent = content.content //.replace(/\n\n/g, '<br/><br/>');
                return (<>

                    <XMarkdown content={newContent} />
                </>)
            }, footer: (
                (content, { status, key }) => (
                    <div style={{ display: 'flex' }}>
                        {/* <Footer content={content} status={status} id={key} /> */}

                        {content?.chat_history_id && <>
                            <Popconfirm title="Are you sure to delete this message?" onConfirm={async () => {
                                const resp = await axios.delete(`/llm/chat/history/del-by-chat-history-id/${content?.chat_history_id}`);
                                loadHistoryMessage();

                            }}>
                                <Button style={{ color: "red" }} type="text" size="small" icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </>}

                        {/* {JSON.stringify(content)} */}
                        {/* <Button type="text" size="small" icon={<ReloadOutlined />} />
                <Button type="text" size="small" icon={<CopyOutlined />} />
                <Button type="text" size="small" icon={<LikeOutlined />} />
                <Button type="text" size="small" icon={<DislikeOutlined />} /> */}
                    </div>
                )
            ),
        },
        user: {
            placement: 'end',
            footerPlacement: 'inner-start',
            contentRender(content: CustomMessage) {
                return (content as any)?.content;
            }, footer: (
                (content) => (
                    <div style={{ display: 'flex' }}>
                        {content?.chat_history_id && <>
                            <Popconfirm title="Are you sure to delete this message?" onConfirm={async () => {
                                const resp = await axios.delete(`/llm/chat/history/del-by-chat-history-id/${content?.chat_history_id}`);
                                loadHistoryMessage()
                            }}>
                                <Button style={{ color: "red" }} type="text" size="small" icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </>}

                        {/* {JSON.stringify(content)} */}
                        {/* <Button type="text" size="small" icon={<ReloadOutlined />} />
                <Button type="text" size="small" icon={<CopyOutlined />} />
                <Button type="text" size="small" icon={<LikeOutlined />} />
                <Button type="text" size="small" icon={<DislikeOutlined />} /> */}
                    </div>
                )
            ),
        },
        system: {
            variant: 'borderless', // 无边框样式
            contentRender(content: CustomMessage) {
                return content?.content;
            },
        },
    }
)
// const role: BubbleListProps['role'] = 

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
    const messageApi = useGlobalMessage()
    const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);
    const [thoughtChainItems, setThoughtChainItems] = React.useState<any>([]);
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
            return { id: item.id, message: { think: item.thought_chain, content: item.content, role: item.role ,chat_history_id: item.chat_history_id} , status: 'local' }
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
            })
        }, { setThoughtChainItems }),
    );

    // 聊天消息管理：使用聊天钩子管理消息和请求
    // Chat message management: use chat hook to manage messages and requests
    const { onRequest, messages, abort, isRequesting, setMessages, setMessage } = useXChat({
        provider,
        requestPlaceholder: { content: locale.waiting, role: 'assistant' },
        // requestFallback: (_, { error, errorInfo, messageInfo }) => {
        //     console.error('Request failed:', error, errorInfo, messageInfo);
        //     return { content: locale.mockFailed, role: 'assistant' }
        // },
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
    // console.log('chat messages:', messages);

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

    // const buildThoughtChainItems = (messageContent: any) => {
    //     const items: ThoughtChainProps['items'] = [
    //         {
    //             key: 'query_databases',
    //             title: 'Query Databases',
    //             icon: false,
    //             collapsible: true,
    //             content: (
    //                 <Flex gap="small" vertical>
    //                     {messageContent?.map((item: any, index: any) => (
    //                         <Text key={index} type="secondary">{item}</Text>

    //                     ))}
    //                     {/* <ThoughtChain.Item
    //                 variant="solid"
    //                 icon={<CodeOutlined />}
    //                 title="Executing command"
    //                 description="mkdir -p component"
    //             />
    //             <Text type="secondary">Creating files needed for new component</Text>
    //             <ThoughtChain.Item
    //                 variant="solid"
    //                 icon={<EditOutlined />}
    //                 title="Creating file"
    //                 description="component/index.tsx"
    //             />
    //             <Text type="secondary">Creating Chinese description file for new component</Text>
    //             <ThoughtChain.Item
    //                 variant="solid"
    //                 icon={<EditOutlined />}
    //                 title="Creating file"
    //                 description="component/index.zh-CN.md"
    //             />
    //             <Text type="secondary">Creating English description file for new component</Text>
    //             <ThoughtChain.Item
    //                 variant="solid"
    //                 icon={<EditOutlined />}
    //                 title="Creating file"
    //                 description="component/index.en-US.md"
    //             /> */}
    //                 </Flex>
    //             ),
    //         },
    //     ];

    //     return items;
    // }


    useEffect(() => {
        loadHistoryMessage();
    }, [project])

    useImperativeHandle(ref, () => ({
        loadHistoryMessage
    }))

    return (
        // <Card
        //     title={`Chat with ${biz_id}`}
        //     extra={<Space>
        //         <RedoOutlined style={{ cursor: "pointer" }} onClick={loadHistoryMesage} />
        //     </Space>}>
        <>
            <Flex justify='end'>
                <Tag>{`LLM - ${biz_type}  ${biz_id}`}</Tag>
                <Button size='small' icon={<RedoOutlined />} onClick={loadHistoryMessage} >
                </Button>
                <Popconfirm title="Are you sure to clear chat history?" onConfirm={async () => {
                    const resp = await axios.post(`/llm/chat/history/clear`, {
                        biz_id: biz_id,
                        project_id: project,
                    });
                    // setMessages([])
                    messageApi.success('Chat history cleared')
                    loadHistoryMessage()
                }}>
                    <Button size='small' icon={<ClearOutlined />} ></Button>
                </Popconfirm>

            </Flex>
            <Flex vertical gap="small">

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
                    role={roles(setMessage, loadHistoryMessage, thoughtChainItems, expandedKeys, setExpandedKeys)}

                    style={{ height: "70vh" }}
                    items={messages.map(({ id, message, status }) => {
                        // console.log('message item:', message, status);
                        return {
                            key: id,
                            loading: status === 'loading',
                            role: message.role,
                            content: message,
                        }
                    })}
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
                        setThoughtChainItems([])
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
        </>

        // </Card>

    );
})

export default App;