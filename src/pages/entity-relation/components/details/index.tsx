import { Button, Card, Divider, Empty, Flex, message, Popconfirm, Tag } from "antd"
import { FC, useEffect, useState } from "react"
import { CloseOutlined, RedoOutlined, DeleteOutlined, AimOutlined, DeploymentUnitOutlined } from '@ant-design/icons'
import axios from "axios"
import Taxonomy from './components/taxonomy'
export const viewMapping: {
    key: string;
    label: string;
    component: React.ComponentType<{ data: any }>;
}[] = [
        { key: "Microbe", label: "taxonomy", component: Taxonomy },
        // { key: "details", label: "详情", component: DetailsView },
        // { key: "setting", label: "设置窗口", component: ChatView },
    ];

export const ComponentsRender: FC<{ data: any, view: string }> = ({ data, view }) => {
    if (!view) return <div>未知类型{view}</div>;
    const item = viewMapping.find((v) => v.key === view);
    if (!item) return <div>未知类型{view}</div>;
    const { component: Component, key, ...rest } = item
    // const Component = item.component;

    return <Component data={data} {...rest} />
};



const DetailsView: FC<any> = ({ data: params, close, height, graphOpt, queryParams, ...rest }) => {
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)
    const [messageApi, messageContextHolder] = message.useMessage();

    const loadData = async () => {
        // console.log(params)
        if ( params?.id) {
            try {
                setLoading(true)
                const resp = await axios.post(`/entity/details/mesh/${params?.id}`,{
                    nodes:queryParams.nodes
                })
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
    // style={{
    //     width: "100%",
    //     // display: "flex",
    //     height: "100%",
    //     justifyContent: "center",
    //     // padding: "20px 0",


    // }}
    >
        {messageContextHolder}
        <Card
            loading={loading}
            title={<>
                {data?.entity_name}
                <Tag style={{ marginLeft: "0.5rem" }}>{data?.entity_type}</Tag>
            </>}
            styles={{
                body: {
                    padding: 0,
                    height: "100%"
                }
            }}
            size="small"
            extra={<>
                {/* <Button size="small" color="cyan" variant="solid">关闭对话框</Button> */}
                <Flex gap="small">

                    {/* <button onClick={graphOpt.loadGraph}>aa</button> */}
                    {queryParams?.entity_id ?
                        <DeploymentUnitOutlined  onClick={() => { graphOpt.updateQueryParam("entity_id",undefined) }}/>
                        :
                        <AimOutlined onClick={() => { graphOpt.updateQueryParam("entity_id", params?.id) }} />
                    }
                    <RedoOutlined onClick={loadData} />
                    <Popconfirm title={`删除${params?.entity_name} (${params?.node_id})?`} onConfirm={async () => {
                        await axios.delete(`/entity/node-id/${params?.node_id}`)
                        messageApi.success("删除成功")
                        close()
                        graphOpt.loadGraph()
                    }}>
                        <DeleteOutlined />
                    </Popconfirm>
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
            {/* {JSON.stringify(params)} */}
            <div style={{ height: "100%", overflowY: "auto", }}>

                {data ? <>
                    <ComponentsRender data={data} view={data?.entity_type}  ></ComponentsRender>
                    <Divider />

                </> : <Empty description={JSON.stringify(params)}>
                </Empty>}
                {/* <Button  >详情</Button> */}

            </div>
        </Card>
    </div>
}

export default DetailsView