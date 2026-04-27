import { Button, Card, Popconfirm, Space, Switch, Table, Tag, Tooltip } from "antd"
import axios from "axios"
import { FC, useEffect, useState } from "react"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
import { RedoOutlined } from '@ant-design/icons'
import { invoke } from "@/core/ui-system/invokeV2"
import ViewResolver from "@/core/ui-renderer/ViewResolver"
const PublishTools: FC<any> = ({ relation_id }) => {

    const [storeList, setStoreList] = useState<any>([])
    const [loading, setLoading] = useState(false)
    const [force, setForce] = useState(true)
    const message = useGlobalMessage()
    // const loadStoreList = async () => {
    //     try {
    //         setLoading(true)
    //         const resp = await axios.get(`/component-store/list-stores-directory`)
    //         setStoreList(resp.data)

    //         setLoading(false)

    //     } catch (error: any) {
    //         // message.error(error.message)
    //     }

    // }
    const loadStoreList = async () => {
        // /list-stores
        setLoading(true)
        const resp = await axios.get(`/list-stores`)
        setStoreList(resp.data)
        setLoading(false)
    }

    // component_id: str
    // store_path:Optional[str]=None
    // force: Optional[bool]=False
    const publishToStore = async (relation_id: any, store_id: any) => {
        try {
            setLoading(true)
            const resp = await axios.post(`/publish-relation`, {
                relation_id: relation_id,
                store_id: store_id,
                force: force
            })
            message.success("Published successfully")
            setLoading(false)
        } catch (error: any) {
            // message.error(error.response?.data?.detail || error.message)
            setLoading(false)
        }
    }
    useEffect(() => {
        loadStoreList()
    }, [])

    // const { component_type, component_id} = params
    return <Card size="small" extra={<Space>
        <Button size="small" color="cyan" variant="solid" onClick={async () => {
            try {
                const resp = await invoke.createUpdateStore.openAsync({}, {
                    title: "Create Store",
                    footer: null,
                    width: 640,
                })
                if (resp) {
                    loadStoreList()
                }
            } catch (error) {

            }
        }}>Create</Button>
        <Button size="small" color="cyan" variant="solid" onClick={async () => {
            // /generate-tools-json
            const resp = await axios.post(`/generate-tools-json/${relation_id}`)
            message.success("Generated successfully")
        }}> Generate </Button>
        <Switch size="small" checked={force} onChange={(checked) => { setForce(checked) }} />


        <Button size="small" icon={<RedoOutlined></RedoOutlined>} loading={loading} onClick={loadStoreList}></Button>

    </Space>}>
        {/* <Flex gap={"small"} style={{ marginBottom: "1rem" }}>
     
            {storeList && Array.isArray(storeList) && storeList.map((item: any, index: any) => (
                <Tooltip title={item.store_path} key={index}>
                    <Popconfirm title={"pubpish?"} onConfirm={() => publishToStore(relation_id, item.store_path)}>

                        <Button size="small" color="cyan" variant="solid"

                        >{item.name}</Button>

                    </Popconfirm>
                </Tooltip>
            ))}
        </Flex> */}

        <Table
            expandable={{
                expandedRowRender: (record: any) => (
                    <>
                       
                        <ViewResolver
                            storeId={record.store_id}
                            view={"storeContent"}
                        ></ViewResolver>
                    </>
                )
            }}
            dataSource={storeList} columns={[
                {
                    title: "status",
                    dataIndex: "status",
                    key: "status",
                }, {
                    title: "name",
                    dataIndex: "name",
                    key: "name",
                }, {
                    title: "path_name",
                    dataIndex: "path_name",
                    key: "path_name",
                    render: (value: any,record: any) =>{
                        return <Tooltip title={record?.path}>
                            {value}
                            </Tooltip>
                    }
                }, {
                    title: "remote url",
                    dataIndex: "url",
                    key: "url",
                    render: (value: any) => <Tooltip title={value}>
                        <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
                    </Tooltip>
                   
                }, {
                    title: "action",
                    key: "action",
                    render: (_: any, record: any) => (
                        <Space size="small">
                            <Popconfirm title={"Delete?"} onConfirm={async () => {
                                try {
                                    await axios.post(`/delete-store/${record.store_id}`)
                                    message.success("Deleted successfully")
                                    loadStoreList()
                                } catch (error: any) {
                                    message.error(error.response?.data?.detail || error.message || "Delete failed")
                                }
                            }}>
                                <Button size="small" color="red" variant="solid">Delete</Button>
                            </Popconfirm>

                            <Button size="small" color="cyan" variant="solid" onClick={async () => {
                                try {
                                    const resp = await invoke.createUpdateStore.openAsync({ store_id: record.store_id }, {
                                        title: "Update Store",
                                        footer: null,
                                        width: 640,
                                    })
                                    if (resp) {
                                        loadStoreList()
                                    }
                                } catch (error) {

                                }
                            }}>Update</Button>

                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                publishToStore(relation_id, record.store_id)
                            }}>Publish</Button>
                        </Space>
                    ),
                }
            ]} size="small" pagination={false} loading={loading} rowKey="store_id" />

    </Card>
}

export default PublishTools;