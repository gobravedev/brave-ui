import { FC, useEffect, useRef, useState } from "react"
import { useOutletContext } from "react-router"
import { readLogFileApi } from "@/api/file-operation";
import { useVirtualizer } from "@tanstack/react-virtual"
import { Button, Card, Flex, Space, Tag, Typography } from "antd"

const { Text } = Typography
const LogFile: FC<any> = ({ file_path, onClose }) => {

    useEffect(() => {
        console.log('fileKey', file_path)
        if (file_path) {
            readFile(file_path)
        }
    }, [file_path])

    const { messageApi } = useOutletContext<any>()
    const offsetRef = useRef(0)
    const [content, setContent] = useState<any>([])
    const readFile = async (file_path: string, showMessage: boolean = false) => {
        // console.log(currentLogFile)
        const resp = await readLogFileApi(file_path)
        offsetRef.current = resp.data.offset
        setContent(resp.data.content)
        if (showMessage) {
            messageApi.success(`日志加载成功: ${file_path}`)
        }

    }


    const parentRef = useRef<HTMLDivElement>(null)

    const virtualizer = useVirtualizer({
        count: content.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 30,
        overscan: 10,
    })

    useEffect(() => {
        if (content?.length > 0) {
            virtualizer.scrollToIndex(content.length - 1, { align: "end", behavior: "smooth" })
        }
    }, [content?.length])

    const items = virtualizer.getVirtualItems()

    return (
        <Card
            size="small"
            extra={
                <Space>
                    {onClose && <Button size="small" color="blue" variant="solid" onClick={onClose}>Close</Button>}
                    <Button size="small" type="primary" onClick={() => {
                        readFile(file_path)
                    }}>Refresh Log</Button>
                </Space>

            }
            title={
                <Flex gap="small" wrap="wrap">
                    <Tag color="blue">File: {file_path}</Tag>
                    <Tag color="purple">Offset: {offsetRef.current}</Tag>
                    {/* <Tag color="green">Analysis ID: {analysis_id}</Tag> */}
                </Flex>
            }
            bodyStyle={{ padding: 0 }}
        >
            <div
                ref={parentRef}
                style={{
                    height: "50vh",
                    overflowY: "auto",
                    fontFamily: "monospace",
                    backgroundColor: "#1e1e1e",
                    color: "#d4d4d4",
                    padding: "0 12px",
                }}
            >
                <div
                    style={{
                        height: virtualizer.getTotalSize(),
                        width: "100%",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${items[0]?.start ?? 0}px)`,
                        }}
                    >
                        {items.map((virtualRow) => (
                            <div
                                key={virtualRow.key}
                                data-index={virtualRow.index}
                                ref={virtualizer.measureElement}
                                style={{
                                    padding: "4px 0",
                                    borderBottom: "1px solid #333",
                                }}
                            >
                                <Flex gap="middle">
                                    <Text type="secondary" style={{ width: 60, color: "#d4d4d4" }}>
                                        #{virtualRow.index + 1}
                                    </Text>
                                    <Text style={{ whiteSpace: "pre-wrap", color: "#d4d4d4" }} >{content[virtualRow.index]}</Text>
                                </Flex>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
}


export default LogFile