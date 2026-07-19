import { Button, Flex, Skeleton, Space, Typography, Spin, Empty } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import { ReloadOutlined } from '@ant-design/icons'
import { http } from "@/api/client/http";
const NodeLogs:FC<any> = ({ analysis_node_id }) => {

    const [data,setData] = useState<any>(null)  
    const [loading,setLoading] = useState(false)    

    const loadData = async () => {
        // /analysis/node-logs/{analysis_node_id}
        setLoading(true)
        const resp = await http.get(`/analysis/${analysis_node_id}/node-logs`)
        setData(resp.data)
        setLoading(false)
    }
    
    useEffect(() => {
        loadData()
    },[analysis_node_id])

    return <Spin spinning={loading}>
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
        </>:<Empty></Empty>}
    </Spin>
}

export default NodeLogs