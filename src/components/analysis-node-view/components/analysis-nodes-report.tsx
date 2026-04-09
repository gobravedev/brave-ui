import { Button, Flex, Skeleton } from "antd";
import axios from "axios"
import { FC, useEffect, useState } from "react";
import { RedoOutlined } from '@ant-design/icons'
import ViewResolver from "@/core/ui-renderer/ViewResolver";
const AnalysisNodesReport: FC<any> = ({ setTitle, analysis_id }) => {
    // const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const loadData = async () => {
        // const res = await axios.get(`/file-operation/visualization-results?path=${output_dir}`)
        const res = await axios.get(`/analysis/visualization-node-results/${analysis_id}`)
        setData(res.data?.result)
        setTitle(res.data.analysis_name + " - Report")
    }
    useEffect(() => {
        loadData()
    }, [analysis_id])

    if (!data) {
        return <Skeleton active></Skeleton>
    }
    return <>
        {/* right */}
        <Flex justify="end">
            <Button onClick={loadData} icon={<RedoOutlined />} size="small" style={{ marginBottom: 8 }}></Button>
        </Flex>
       
        <ViewResolver
            analsyisResult={{}}
            view={"analysisResultDisplay"}>
        </ViewResolver>
         {JSON.stringify(data)}

    </>
}

export default AnalysisNodesReport