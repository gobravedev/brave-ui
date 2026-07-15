import { Button, Card, Flex, Space, Tag, Typography } from 'antd';
import type { FC } from 'react';
import XMarkdown from '@ant-design/x-markdown';

const { Text } = Typography;

type WritePermissionProps = {
    requestId?: string;
    sessionId?: string;
    kind?: string;
    requiresWriteConfirm?: boolean;
    fileName?: string;
    intention?: string;
    toolCallId?: string;
    diff?: string;
    newFileContents?: string;
    request?: Record<string, unknown>;
    onOk?: (value: { approved: boolean }) => void;
    onCancel?: () => void;
};

function toPrettyJSON(value: unknown) {
    try {
        return JSON.stringify(value ?? {}, null, 2);
    } catch {
        return String(value ?? '');
    }
}

const WritePermission: FC<WritePermissionProps> = ({
    requestId,
    kind,
    fileName,
    intention,
    toolCallId,
    diff,
    newFileContents,
    request,
    onOk,
    onCancel,
}) => {
    return (
        <Card bordered={false} bodyStyle={{ padding: 0 }}>
            <Flex vertical gap='small'>
                <Flex justify='space-between' align='center' wrap='wrap' gap='small'>
                    <Space wrap>
                        <Tag color='warning'>{kind || 'unknown'}</Tag>
                        {!!requestId && <Text type='secondary'>{requestId}</Text>}
                    </Space>
                    <Space>
                        <Button onClick={() => (onOk ? onOk({ approved: false }) : onCancel && onCancel())}>
                            Deny
                        </Button>
                        <Button type='primary' onClick={() => onOk && onOk({ approved: true })}>
                            Approve
                        </Button>
                    </Space>
                </Flex>

                <Space wrap>
                    {!!fileName && <Tag color='blue'>file: {fileName}</Tag>}
                    {!!intention && <Tag color='geekblue'>intention: {intention}</Tag>}
                    {!!toolCallId && <Tag color='purple'>toolCallId: {toolCallId}</Tag>}
                </Space>

                {diff && (
                    <div>
                        <Text strong>diff</Text>
                        <XMarkdown content={`\n\`\`\`diff\n${diff}\n\`\`\``} />
                    </div>
                )}

                {newFileContents && (
                    <div>
                        <Text strong>newFileContents</Text>
                        <XMarkdown content={`\n\`\`\`python\n${newFileContents}\n\`\`\``} />
                    </div>
                )}

                <div>
                    <Text strong>request</Text>
                    <XMarkdown content={`\n\`\`\`json\n${toPrettyJSON(request)}\n\`\`\``} />
                </div>
            </Flex>
        </Card>
    );
};

export default WritePermission;