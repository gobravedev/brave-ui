import { Typography } from "antd"
import axios from "axios"
import { FC, useEffect, useState } from "react"

const ContainerInspect: FC<any> = ({ params }) => {
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState<any>(false)
    const loadData = async () => {
        setLoading(true)
        const resp = await axios.get(`/container/${params.inspect}/${params?.id}${params?.run_type ? `?run_type=${params?.run_type}` : ""}`)
        setData(resp.data)
        setLoading(false)
    }
    useEffect(() => {
        if (params?.id) {
            loadData()
        }

    }, [params?.id])
    return <Typography>
        <pre>
            {JSON.stringify(data, null, 2)}
        </pre>
    </Typography>

}

export default ContainerInspect;
