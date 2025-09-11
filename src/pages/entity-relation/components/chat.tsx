import { Button, Card } from "antd"
import { FC } from "react"
import AIChat from '@/components/chat'
// const  AIChat  = lazy(() => import('@/components/chat'));
import { CloseOutlined, RedoOutlined } from '@ant-design/icons'

const ChatView: FC<any> = ({ close }) => {
    return <div
        style={{
            width: "100%",
            // display: "flex",
            // height: "100%",
            justifyContent: "center",
            // padding: "20px 0",
            

        }}
    >
        <Card
            styles={{
                body: {
                    padding: "0.5rem"
                }
            }}
            size="small"
            extra={<>
                {/* <Button size="small" color="cyan" variant="solid" onClick={() => {
                    close()
                }}>关闭对话框</Button> */}
                <CloseOutlined onClick={close} />
            </>}
            style={{
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                padding: "0.5rem",
                overflow: "hidden",
            }}
        >
            {/* <h2>聊天窗口</h2> */}
            <AIChat></AIChat>
        </Card>
    </div>
}

export default ChatView