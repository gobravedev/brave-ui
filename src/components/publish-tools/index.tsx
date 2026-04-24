import { Button, Card, Flex, Popconfirm, Space, Switch, Tooltip } from "antd"
import axios from "axios"
import { FC, useEffect, useState } from "react"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
import { RedoOutlined } from '@ant-design/icons'
const PublishTools: FC<any> = ({ relation_id }) => {
    const [storeList, setStoreList] = useState<any>([])
    const [loading, setLoading] = useState(false)
    const [force, setForce] = useState(true)
    const message = useGlobalMessage()
    const loadStoreList = async () => {
        try {
            setLoading(true)
            const resp = await axios.get(`/component-store/list-stores-directory`)
            setStoreList(resp.data)

            setLoading(false)

        } catch (error: any) {
            // message.error(error.message)
        }

    }

    // component_id: str
    // store_path:Optional[str]=None
    // force: Optional[bool]=False
    const publishToStore = async (relation_id: any, store_path: any = undefined) => {
        try {
            setLoading(true)
            const resp = await axios.post(`/publish-relation`, {
                relation_id: relation_id,
                store_path: store_path,
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

        <Button size="small" icon={<RedoOutlined></RedoOutlined>} loading={loading} onClick={loadStoreList}></Button>

    </Space>}>
        <Flex gap={"small"} style={{ marginBottom: "1rem" }}>
            {/* <Popconfirm title={"pubpish?"} onConfirm={() => publishToStore(params?.component_id, undefined)}>
                <Button size="small" color="cyan" variant="solid"

                >default</Button>
            </Popconfirm> */}
            <Button size="small" color="cyan" variant="solid" onClick={async () => {
                // /generate-tools-json
                const resp = await axios.post(`/generate-tools-json/${relation_id}`)
                message.success("Generated successfully")
            }}> Generate </Button>
            <Switch style={{ marginLeft: "1rem" }} checked={force} onChange={(checked) => { setForce(checked) }} />
            {storeList && Array.isArray(storeList) && storeList.map((item: any, index: any) => (
                <Tooltip title={item.store_path} key={index}>
                    <Popconfirm title={"pubpish?"} onConfirm={() => publishToStore(relation_id, item.store_path)}>

                        <Button size="small" color="cyan" variant="solid"

                        >{item.name}</Button>

                    </Popconfirm>
                </Tooltip>
            ))}
        </Flex>

    </Card>
}

export default PublishTools;