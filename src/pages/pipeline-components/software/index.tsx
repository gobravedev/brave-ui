import axios from "axios"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { Button } from "antd"

const AnalysisSoftware = () => {
    const { softwareId } = useParams()
    const [software, setSoftware] = useState<any>(null)
    const loadData = async () => {
        const resp = await axios.get(`/get-pipeline-v2/${softwareId}?component_type=software`)
        // const data = resp.data
        // const content = JSON.parse(data['content'])
        // const software = { ...data, ...content }
        setSoftware(resp.data)
       
    }
    useEffect(() => {
        loadData()
    }, [])
    return (    
        <div>
            <Button onClick={() => {
                loadData()
            }}>
                刷新
            </Button>
            {softwareId}
            <h1>Software Page</h1>
            {JSON.stringify(software)}
        </div>
    )
}

export default AnalysisSoftware;