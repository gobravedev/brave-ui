import { FC, useEffect, useState } from "react"
import Markdown from "../../components/markdown"
import { Alert, Button, Card, Col, Flex, List, message, Popconfirm, Row, Skeleton, Tabs, Tag } from "antd"


import { EmbedLLM } from '../../components/embed-llm'
// import Demo from "@/components/smart-table"
import axios from "axios"
const InteractiveTools: FC<any> = () => {
  
    const { ref: containerRef, top, isSticky } = useStickyTop(576);

    return <div style={{ maxWidth: "1800px", margin: "1rem auto" , padding: `${isSticky ? '0 16px 0 16px' : '0'}` }}>
        <Row gutter={[isSticky?16:0, 16]}>
            {/* <Col xs={24} sm={12} md={12} lg={12} xl={12} >

               
            </Col> */}
            <Col xs={24} sm={18} md={18} lg={18} xl={18}  >

                <ContainerComp keys={["traefik", "code-server", "notebook", "rstudio"]}></ContainerComp>

            </Col>

            <Col xs={24} sm={6} md={6} lg={6} xl={6}  >
                <RunningContainer></RunningContainer>
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
import { ContainerOpt, InspectPanel } from "../container"
import { CloseOutlined, RedoOutlined } from '@ant-design/icons'
import { useSSEContext } from "@/context/sse/useSSEContext"
import { useSelector } from "react-redux"
import { useModal } from "@/hooks/useModal"
import { useStickyTop } from "@/hooks/useStickyTop"

const ContainerComp: FC<any> = ({ keys }) => {
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)
    const { baseURL } = useSelector((state: any) => state.user)



    const [messageApi, contextHolder] = message.useMessage();


    // }, [eventSourceRef.current]);
    const sseData = useSelector((state: any) => state.global.sseData)
    const [containerIds, setContainerIds] = useState<any>([])
    useEffect(() => {
        try {
            // const sseData_ = JSON.parse(sseData)
            if (containerIds.includes(sseData.analysis_id)) {
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
            container_key: keys
        })
        setContainerIds(resp.data.map((item: any) => item.container_id))
        const obj = Object.fromEntries(resp.data.map((item: any) => [item.container_key, item]));
        const appList = keys.map((item: any) => {
            if (!obj[item]) {
                return { key: item }
            } else {
                return obj[item]
            }
        })
        setData(appList)
        setLoading(false)


        // console.log(obj)
    }


    useEffect(() => {
        loadData()
    }, [baseURL])

    return <Card title="Cloud App" size="small" loading={loading} extra={<>
        <RedoOutlined style={{ cursor: "pointer" }} onClick={() => loadData()}></RedoOutlined>
    </>}>
        {contextHolder}
        {/* {JSON.stringify(containerIds)}
        {JSON.stringify(sseData)} */}
        {/* {JSON.stringify(data)} */}
        <List
            className="demo-loadmore-list"
            loading={loading}
            itemLayout="vertical"
            // loadMore={loadMore}
            dataSource={data}

            renderItem={(item: any) => (

                <>
                    {!item?.name ? <Flex align="center" style={{ padding: "1rem 0" }}>
                        <Popconfirm title="Install?" onConfirm={async () => {

                            const templete: any = containerData.find((it: any) => it.container_key == item?.key)
                            // console.log(containerData)
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
                            <Button size="small" color="cyan" variant="solid">Install {item?.key}</Button>
                        </Popconfirm>
                    </Flex> : <>
                        <List.Item

                            actions={[
                                // <Popconfirm title="Stop?" onConfirm={async () => {
                                //     await axios.post(`/container/stop-container-by-run-id/${item.name}`)
                                // }}>
                                //     <a >Stop</a>
                                // </Popconfirm>
                                <ContainerOpt record={item} reload={loadData} traefikUI={item.name == "traefik"}></ContainerOpt>
                                ,

                                // <a
                                //     onClick={() => {
                                //         openModal("inspectPanel", {
                                //             inspect: "inspect",
                                //             id: item.name
                                //         })
                                //     }}  >Inspect</a>
                            ]}
                        >

                            <Skeleton avatar title={false} loading={item.loading} active>
                                <List.Item.Meta
                                    avatar={<img
                                        draggable={false}
                                        width={100}
                                        alt="logo"
                                        src={item.img}
                                    />}
                                    title={<p style={{ wordWrap: "break-word" }}>{item.image}</p>}
                                    description={item.name}
                                />
                                {/* <div>content</div> */}
                            </Skeleton>
                        </List.Item>
                    </>}
                </>

            )}
        />

        {/* 
        {keys.map((name: any, index: any) => (<div key={index} style={{ marginBottom: "1rem" }}>
            {data && data[name] ? <>

            
                <div style={{ marginBottom: "1rem" }}>
                    <Tag>{data[name].image}</Tag>
                </div>
                <Flex gap="small">
                    <ContainerOpt record={data[name]} reload={loadData} traefikUI={name == "traefik"}></ContainerOpt>

                </Flex>



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

        </div>))} */}

    </Card>


}

const RunningContainer: FC<any> = () => {
    const [data, setData] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false)
    const { baseURL } = useSelector((state: any) => state.user)
    const [event, setEvent] = useState<any>()
    const sseData = useSelector((state: any) => state.global.sseData)
    const { modal, openModal, closeModal } = useModal();

    useEffect(() => {
        try {
            const sseData_ = sseData //JSON.parse(sseData)
            if (sseData_.event == "analysis_complete" || sseData_.event == "analysis_failed" || sseData_.event == "analysis_started") {
                // if (data.event == "container_pulled" || data.event == "analysis_complete" || data.event == "analysis_failed" || data.event == "analysis_started") {
                loadData(false)
                setEvent(sseData_)
                // }
            }
        } catch (error) {

        }

    }, [sseData])
    const loadData = async (force: any) => {
        setLoading(true)
        const resp = await axios.get(`/container/list-running-container?force=${force}`)
        setData(resp.data)
        setLoading(false)
    }

    useEffect(() => {
        loadData(false)
    }, [baseURL])


    return <Card size="small" title={<>
        <Flex justify={"space-between"} align={"center"}>
            <div>Running Container</div>
            {/* <div>
                
                <Popconfirm title="Stop All?" onConfirm={async () => {
                    try {
                        for (let i = 0; i < data.length; i++) {
                            const element = data[i];
                            await axios.post(`/container/stop-container`, {
                                container_id: element.container_id
                            })
                        }
                        message.success("Stop All Success")
                        loadData()
                    } catch (error) {
                        message.error("Stop All Fail")
                    }

                }}>
                    <Button size="small" color="red" variant="solid" icon={<CloseOutlined></CloseOutlined>}></Button>
                </Popconfirm>
            </div> */}
        </Flex>

    </>}
        extra={<>
            {/* {JSON.stringify(event)} */}
            <RedoOutlined style={{ cursor: "pointer" }} onClick={() => loadData(true)}></RedoOutlined>
        </>}
        style={{ marginBottom: "1rem" }}>
        {event && <Alert message={`${event.run_id}: ${event.event}`} type="success" />}

        <List
            className="demo-loadmore-list"
            loading={loading}
            itemLayout="vertical"
            // loadMore={loadMore}
            dataSource={data}
            renderItem={(item: any) => (
                <List.Item
                    actions={[
                        <Flex gap={"small"}>
                            <Popconfirm title="Stop?" onConfirm={async () => {
                                await axios.post(`/container/stop-container-by-run-id/${item.name}`)
                            }}>
                                <Button size="small" color="cyan" variant="solid">Stop</Button>
                            </Popconfirm>
                            <Button size="small" color="cyan" variant="solid"
                                onClick={() => {
                                    openModal("inspectPanel", {
                                        inspect: "inspect",
                                        id: item.name
                                    })
                                }}  >Inspect</Button>
                        </Flex>


                    ]}
                >
                    <Skeleton avatar title={false} loading={item.loading} active>
                        <List.Item.Meta

                            title={<p style={{ wordWrap: "break-word" }}>{item.image}</p>}
                            description={item.name}
                        />
                        {/* <div>content</div> */}
                    </Skeleton>
                </List.Item>
            )}
        />
        <InspectPanel
            visible={modal.key == "inspectPanel" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></InspectPanel>
        {/*         
        {data && data.length > 0 ? data.map((item: any, index: any) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
                <Tag>{item.image}</Tag>
             

            </div>
        )) : <div>No Running Container</div>} */}

    </Card>
}

export default InteractiveTools;
