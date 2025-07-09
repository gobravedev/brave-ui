import { Button } from "antd"
import { Card, Spin, Typography } from "antd"
import axios from "axios"
import { FC, useEffect, useState } from "react"

const FileBrowser: FC<any> = ({ output_dir: dir }) => {
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState<any>()
    const browseOutputDir = async () => {
        setLoading(true)
        const resp = await axios.get(`/file-operation/file-list-recursive?directory=${dir}`)
        setData(resp.data)
        setLoading(false)
    }
    useEffect(() => {
        console.log("file-list-recursive dir", dir);

        browseOutputDir()
    }, [dir])
    return <Card title="文件列表" extra={
        <Button size="small" color="cyan" variant="solid" onClick={browseOutputDir}>
            刷新
        </Button>
    }>
        <Spin spinning={loading}>

            <Typography>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </Typography>
        </Spin>
    </Card>
}

export default FileBrowser