import { FC, useEffect, useState } from "react"
import Markdown from "../../components/markdown"
import { Alert, Button, Card, Col, Empty, Flex, List, message, Popconfirm, Row, Segmented, Skeleton, Tabs, Tag } from "antd"

import { chinese } from './chinese'
import { english } from './english'
import { introduction } from './introduction'

import { EmbedLLM } from '../../components/embed-llm'
// import Demo from "@/components/smart-table"
import axios from "axios"
import DashboardRender from "./dashboard-render"
import { useStickyTop } from "@/hooks/useStickyTop"
import { useDispatch, useSelector } from "react-redux"
import { setUserItem } from "@/store/userSlice"
import { useModal } from "@/hooks/useModal"
import FormProject from "@/components/form-project"
const Project: FC<any> = () => {
    const [data, setData] = useState<any>(introduction)
    const { ref: containerRef, top, isSticky } = useStickyTop(576);
    const { project, projectObj, baseURL } = useSelector((state: any) => state.user);
    const { modal, openModal, closeModal } = useModal();

    const onChange = (value: any) => {
        if (value == "chinese") {
            setData(chinese)
        } else if (value == "english") {
            setData(english)
        }
    }
    const dispatch = useDispatch()

    const [panel, setPanel] = useState<string>("llm")
    const loadProject = async () => {
        const resp = await axios.get(`/project/find-by-project-id/${project}`)
        // setQueryProject(resp.data)
        dispatch(setUserItem({ projectObj: resp.data }))
    }
    return <div >
        <Card
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                height: " 100%",
                boxShadow: "none"
            }}
            styles={{
                body: {
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    height: " 100%",
                    padding: 0,
                    overflowY: "auto"
                }
            }}
            variant="borderless" size="small" extra={
                <Flex gap={"small"}>

                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        openModal("projectForm", { project_id: project })
                    }}>Edit</Button>

                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        loadProject()
                        // setProjectObj(resp.data)
                        // dispatch(setUserItem({ projectObj: resp.data }))
                    }}>Refresh</Button>
                </Flex>

            }>

            {projectObj?.description ? <Markdown data={projectObj?.description}></Markdown> : <Empty />}
        </Card>
        {/* <Row
            ref={containerRef}
            gutter={[isSticky ? 16 : 0, 16]}>
            <Col lg={18} sm={18} xs={24}>

               
            </Col>
            <Col lg={6} sm={6} xs={24}
                style={isSticky ? {
                    overflow: "hidden",
                    // marginTop: "1rem",
                    position: "sticky",
                    top: `${top}px`, // 吸顶距离
                    alignSelf: "flex-start", // 避免被stretch
                    height: `calc(100vh - ${top}px - 1rem )`, // 可选：固定高度，让内部滚动
                } : {}}
            >
                <Card
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        height: " 100%"
                    }}
                    styles={{
                        body: {
                            // height: "90%",
                            flex: 1,
                            overflowY: "auto"
                        }
                    }}
                    title="Brave Dashboard" size="small" extra={<>
                        <Segmented size="small" value={panel}
                            onChange={(val: any) => setPanel(val)}
                            options={[
                                {
                                    label: 'LLM',
                                    value: 'llm'
                                }, {
                                    label: 'Introduce',
                                    value: 'markdown'
                                }
                            ]} />
                    </>} >
                    <DashboardRender
                        view={panel}
                        introduction={introduction}
                    ></DashboardRender>
                </Card>
            </Col>

      
        </Row> */}
        <FormProject
            research={true}
            params={modal.params}
            visible={modal.key == "projectForm" && modal.visible}
            onClose={closeModal} />
    </div>
}

export default Project