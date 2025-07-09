import axios from "axios"
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { Button } from "antd"

const AnalysisFile = () => {
    const { fileId } = useParams()
    const [file, setFile] = useState<any>(null)
    const loadData = async () => {
        const resp = await axios.get(`/get-pipeline-v2/${fileId}?component_type=file`)
        // const data = resp.data
        // const content = JSON.parse(data['content'])
        // const software = { ...data, ...content }
        setFile(resp.data)
       
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
            {fileId}
            <h1>File Page</h1>
            {JSON.stringify(file)}
        </div>
    )
}

export default AnalysisFile;