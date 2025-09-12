import { Button, Card, Flex, Popconfirm } from "antd"
import { FC, useEffect, useState } from "react"
import { CloseOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons'
import axios from "axios"
import { useOutletContext } from "react-router"

const RelationView: FC<any> = ({ close, height, data: params,loadGraph, ...rest }) => {
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)
    const { messageApi } = useOutletContext<any>()

    const loadData = async () => {
        setLoading(true)
        const resp = await axios.get(`/entity-relation/relation/${params?.relation_id}`)
        setData(resp.data)
        setLoading(false)
    }
    useEffect(() => {
        loadData()
    }, [params?.relation_id])
    return <Card
        loading={loading}
        styles={{
            body: {
                padding: "0.5rem",
                height: "100%",
                overflowY: "auto"
            }
        }}
        title={<>
            {`${rest?.label} (${data?.from_name})-[${data?.type}]-(${data?.to_name})`}
            {/* <Tag style={{ marginLeft: "0.5rem" }}>{params?.label}</Tag> */}
        </>}
        size="small"
        extra={<>
            <Flex gap="small">
                <Popconfirm title={`删除(${data?.from_name})-[${data?.type}]-(${data?.to_name})?`} onConfirm={async () => {
                     await axios.delete(`/entity-relation/relation/${data.rid}`)
                    messageApi.success("删除成功")
                    close()
                    loadGraph()
                }}>
                    <DeleteOutlined />
                </Popconfirm>
                <RedoOutlined onClick={loadData} />

                <CloseOutlined onClick={close} />
            </Flex>
        </>}
        style={{
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            padding: "0.5rem",
            overflow: "hidden",
            height: height,
        }}
    >
        {JSON.stringify(data)}

        {/* <Button size="small" danger variant="solid" onClick={async () => {
            await axios.delete(`/entity-relation/relation/${data.rid}`)
            messageApi.success("删除成功")
        }}>删除</Button> */}

    </Card>
}
export default RelationView