import { Button, Card } from "antd"
import { FC } from "react"
import AIChat from '@/components/chat'
// const  AIChat  = lazy(() => import('@/components/chat'));
import { CloseOutlined, RedoOutlined } from '@ant-design/icons'
import { Copilot } from "@/pages/test"

const ChatView: FC<any> = ({ close ,height}) => {
    return <Card
        styles={{
            body: {
                padding: "0.5rem",
                height:"85vh",
                display: "flex",
                // flex:1,
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
              height: `${height}px`,
            overflow: "hidden",

        }}
    >
        <AIChat></AIChat>
        {/* <Copilot copilotOpen={true} setCopilotOpen={() => { }}></Copilot> */}

    </Card>
}

export default ChatView