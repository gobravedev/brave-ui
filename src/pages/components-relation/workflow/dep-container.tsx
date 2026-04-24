import { de } from "@faker-js/faker";
import { Button, Card, Skeleton, Space, Table } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import { RedoOutlined } from '@ant-design/icons'
import { useGlobalMessage } from "@/hooks/useGlobalMessage";
const DepContainer: FC<any> = ({ relation_id }) => {
    const [data,setData]  = useState<any>(null)
    const [loadling,setLoading] = useState(false)
    const message = useGlobalMessage()
    const loadData = async () => {
        // /tools/get-dep-container/{relation_id}
        setLoading(true)
        const resp = await axios.get(`/tools/get-dep-container/${relation_id}`)
        setData(resp.data)
        setLoading(false)
    }
    
    useEffect(() => {
        if (relation_id) {
            loadData();
        }
    }, [relation_id]);

    return <>
        {/* {relation_id} */}
        <Card size="small" extra={<Space>
            <Button size="small" color="cyan" variant="solid"  onClick={async ()=>{
                    // /update-container-status
                    const resp = await axios.post(`/update-container-status`)
                    loadData();
                    message.success("Container status updated!")

            }}>Refresh Status</Button>
            <Button size="small" icon={<RedoOutlined></RedoOutlined>} onClick={loadData} loading={loadling}></Button>

        </Space>}>
            {data ?<>
                {/* {JSON.stringify(data)} */}
                <Table
                dataSource={data}
                columns={[
                    {
                        title: 'component_name',
                        dataIndex: 'component_name',
                        key: 'component_name',
                    }, {
                        title: 'container_name',
                        dataIndex: 'container_name',
                        key: 'container_name',
                    }, {
                        title: 'image',
                        dataIndex: 'image',
                        key: 'image',
                    }, {
                        title: 'image_status',
                        dataIndex: 'image_status',
                        key: 'image_status',
                    }
                ]}
                ></Table>
            </>:<Skeleton active></Skeleton>}
        </Card>
    </>
}

export default DepContainer