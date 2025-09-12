import { Button, Card } from "antd"
import { FC } from "react"
import AIChat from '@/components/chat'
// const  AIChat  = lazy(() => import('@/components/chat'));
import { CloseOutlined, RedoOutlined } from '@ant-design/icons'

const ChatView: FC<any> = ({ close }) => {
    return <Card
        styles={{
            body: {
                padding: "0.5rem"
            }
        }}
        size="small"
        extra={<>
            <CloseOutlined onClick={close} />
        </>}
        style={{
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            padding: "0.5rem",
            overflow: "hidden",
        }}
    >
        <AIChat></AIChat>
    </Card>
}

export default ChatView