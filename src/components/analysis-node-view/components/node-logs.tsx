import { Button, Flex, Skeleton, Space, Typography } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import { ReloadOutlined } from '@ant-design/icons'
const NodeLogs:FC<any> = ({ analysis_node_id }) => {

    const [data,setData] = useState<any>(null)  
    const [loading,setLoading] = useState(false)    

    const loadData = async () => {
        // /analysis/node-logs/{analysis_node_id}
        setLoading(true)
        const resp = await axios.get(`/analysis/node-logs/${analysis_node_id}`)
        setData(resp.data)
        setLoading(false)
    }
    
    useEffect(() => {
        loadData()
    },[])

    return <>
        <Flex justify="end">
            <Space>
                <Button size="small" onClick={loadData} loading={loading} icon={<ReloadOutlined />}></Button>
            </Space>
        </Flex>
        {data ?<>
        <Typography>
            {data.split("\n").map((line: string, index: number) => (
                <div key={index}>{line}</div>
            ))}
        </Typography>
        </>:<Skeleton active></Skeleton>}
    </>
}

export default NodeLogs