import { Button, Card, Divider, Empty, Flex, message } from "antd"
import { FC, useEffect, useState } from "react"
import { CloseOutlined, RedoOutlined } from '@ant-design/icons'
import axios from "axios"
import LineageList from './lineage-list'

const DetailsView: FC<any> = ({ data: params, close, height, ...rest }) => {
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)
    const [messageApi, messageContextHolder] = message.useMessage();

    const loadData = async () => {
        if (params?.label && params?.id) {
            try {
                setLoading(true)
                const resp = await axios.get(`/entity/details/${params?.label}/${params?.id}`)
                setData(resp.data)
                // setLoading(false)
            } catch (error) {
                setData(null)
                console.log(error)
                messageApi.error("数据加载失败!")
            }
            setLoading(false)
        } else {
            setData(null)
        }
    }
    useEffect(() => {
        loadData()
    }, [JSON.stringify(params)])
    return <div
        style={{
            width: "100%",
            // display: "flex",
            height: "100%",
            justifyContent: "center",
            // padding: "20px 0",


        }}
    >
        {messageContextHolder}
        <Card
            loading={loading}
            title={`${rest?.label}(${params?.entity_name})`}
            styles={{
                body: {
                    padding: 0,
                    height:"100%"
                }
            }}
            size="small"
            extra={<>
                {/* <Button size="small" color="cyan" variant="solid">关闭对话框</Button> */}
                <Flex gap="small">
                    <CloseOutlined onClick={close} />
                    <RedoOutlined onClick={loadData} />
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

            <div style={{ height: "100%",  overflowY: "auto",}}>

                {data ? <>
                    <Card title="Lineage" style={{ marginTop: "1rem" }} styles={{
                        body: {
                            padding: "0.5rem"
                        }
                    }}
                        size="small">
                        <LineageList data={data.lineage}></LineageList>
                    </Card>
                    <Divider />
                    {JSON.stringify(data)}
                </> : <Empty description={JSON.stringify(params)}>
                </Empty>}
            </div>
        </Card>
    </div>
}

export default DetailsView