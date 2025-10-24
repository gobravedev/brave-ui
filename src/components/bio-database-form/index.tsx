import { FC, useEffect, useState } from "react"
import FormJsonComp from "../form-components"
import axios from "axios"
import { Button, Flex } from "antd"

const BioDatabaseForm: FC<any> = ({ formJson, openModal }) => {
    if (!formJson) return null
    const [data, setData] = useState<any>([])

    const loadData = async () => {
        const dataKeyList = formJson.map((item: any) => item.dataKey)
        const resp = await axios.post("/list-bio-database", { "type_list": dataKeyList })
        const dataMap = (resp.data || []).reduce((acc: any, item: any) => {
            const key = item.type
            if (!acc[key]) acc[key] = []
            const { name, database_id, ...rest } = item
            acc[key].push({
                label: name,
                value: database_id,
                ...rest
            })
            return acc
        }, {})
        setData(dataMap)
        console.log(dataMap)
    }
    useEffect(() => {
        loadData()
    }, [formJson])

    return <>
        {/* {JSON.stringify(formJson)} */}

        <Flex gap={"small"}  >
            <div style={{ flex: 1 }}>
                <FormJsonComp formJson={formJson} dataMap={data}></FormJsonComp>
            </div>
            <Button size="small" color="cyan" variant="solid" onClick={openModal}>DB Settings</Button>
            <Button onClick={loadData} size="small" type="primary">Refresh</Button>
        </Flex>


    </>
}

export default BioDatabaseForm