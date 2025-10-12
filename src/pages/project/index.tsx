import { FC, useEffect, useState } from "react"
import Markdown from "../../components/markdown"
import { Button, Card, Col, Flex, message, Popconfirm, Row, Skeleton, Tabs, Tag } from "antd"

import { chinese } from './chinese'
import { english } from './english'
import { introduction } from './introduction'

import { EmbedLLM } from '../../components/embed-llm'
import Demo from "@/components/smart-table"
import axios from "axios"
const Project: FC<any> = () => {
    const [data, setData] = useState<any>(introduction)
    const onChange = (value: any) => {
        if (value == "chinese") {
            setData(chinese)
        } else if (value == "english") {
            setData(english)
        }
    }
    return <div style={{ maxWidth: "1800px", margin: "1rem auto" }}>
        <Row>
            <Col xs={24} sm={6} md={6} lg={6} xl={6}>

                <ContainerComp keys={["traefik", "code-server"]}></ContainerComp>

            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12} style={{ padding: "0 1rem" }}>

                <Card >
                    <Markdown data={data}></Markdown>
                </Card>
            </Col>
            <Col xs={24} sm={6} md={6} lg={6} xl={6}>
                <Card style={{ width: "100%" }}></Card>
            </Col>
        </Row>
        {/* <Tabs onChange={onChange} items={[
            {
                key:"english",
                label:"英文",
            },{
                key:"chinese",
                label:"中文",
            }
        ]}></Tabs> */}
        {/* <EmbedLLM content={"hi"}>LLM</EmbedLLM> */}


        {/* <Demo></Demo> */}
    </div>
}
import { containerData } from '@/pages/container/container.ts'
import { ContainerOpt } from "../container"
import { CloseOutlined, RedoOutlined } from '@ant-design/icons'
import { useSSEContext } from "@/context/sse/useSSEContext"
import { useSelector } from "react-redux"

const ContainerComp: FC<any> = ({ keys }) => {
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)
    const { namespace } = useSelector((state: any) => state.user);


    // const { eventSourceRef, status, reconnect } = useSSEContext();

    // useEffect(() => {
    //     if (eventSourceRef) {
    //         const handler = (event: MessageEvent) => {
    //             // console.log('event', event)
    //             const data = JSON.parse(event.data)
    //             // console.log('analysisId', analysisIdRef.current)
    //             // if (analysisIdRef.current.includes(data.analysis_id)) {



    //             // }
    // if (data.run_type == "retry") {
    //     if (data.event == "container_pulled" || data.event == "analysis_complete" || data.event == "analysis_failed" || data.event == "analysis_started") {
    //         loadData()
    //     }
    // }

    //         };

    //         eventSourceRef.current?.addEventListener('message', handler);

    //         return () => {
    //             console.log("removeEventListener")
    //             eventSourceRef.current?.removeEventListener('message', handler);
    //         };
    //     }


    const [messageApi, contextHolder] = message.useMessage();


    // }, [eventSourceRef.current]);
    const sseData = useSelector((state: any) => state.global.sseData)
    const [containerIds, setContainerIds] = useState<any>([])
    useEffect(() => {
        try {
            const sseData_ = JSON.parse(sseData)
            if (containerIds.includes(sseData_.analysis_id)) {
                // if (data.event == "container_pulled" || data.event == "analysis_complete" || data.event == "analysis_failed" || data.event == "analysis_started") {
                loadData()
                // }
            }
        } catch (error) {

        }

    }, [sseData])
    const loadData = async () => {
        setLoading(true)
        const resp = await axios.post(`/container/list-container-key`, {
            container_key: keys,
            namespace: namespace
        })
        setContainerIds(resp.data.map((item: any) => item.container_id))
        const obj = Object.fromEntries(resp.data.map((item: any) => [item.container_key, item]));
        setData(obj)
        setLoading(false)


        console.log(obj)
    }
    useEffect(() => {
        loadData()
    }, [namespace])


    return <Card size="small" loading={loading} extra={<>
        <RedoOutlined style={{ cursor: "pointer" }} onClick={() => loadData()}></RedoOutlined>
    </>}>
        {contextHolder}
        {/* {JSON.stringify(containerIds)}
        {JSON.stringify(sseData)} */}
        {/* {JSON.stringify(data)} */}
        {keys.map((name: any, index: any) => (<div key={index} style={{ marginBottom: "1rem" }}>
            {data && data[name] ? <>

                {/* <a href={`http://localhost:${getPort(data.traefik.port, "80")}`} target="_blank">
                {`http://localhost:${getPort(data.traefik.port, "80")}`}
                </a> */}
                <div style={{ marginBottom: "1rem" }}>
                    <Tag>{data[name].image}</Tag>
                </div>
                <Flex gap="small">
                    <ContainerOpt record={data[name]} reload={loadData} traefikUI={name == "traefik"}></ContainerOpt>

                </Flex>


                {/* {JSON.stringify(data?.traefik.image)} */}

            </> : <>
                <Popconfirm title="Install?" onConfirm={async () => {

                    const templete: any = containerData.find((item: any) => item.container_key == name)
                    if (!templete) {
                        messageApi.error(`${name} templete not exist!`)
                    }
                    const newParams = JSON.parse(JSON.stringify(templete));

                    newParams.envionment = JSON.stringify(templete.envionment)
                    newParams.labels = JSON.stringify(templete.labels)
                    console.log(newParams)

                    await axios.post(`/container/add-or-update-container`, newParams)
                    loadData()

                }}>
                    <Button size="small" color="cyan" variant="solid">Install {name}</Button>
                </Popconfirm>
            </>}

        </div>))}

    </Card>


}

export default Project