import { FC, useEffect, useState } from "react"
import Markdown from "../../components/markdown"
import { Alert, Button, Card, Col, Flex, List, message, Popconfirm, Row, Segmented, Skeleton, Tabs, Tag } from "antd"

import { chinese } from './chinese'
import { english } from './english'
import { introduction } from './introduction'

import { EmbedLLM } from '../../components/embed-llm'
// import Demo from "@/components/smart-table"
import axios from "axios"
import DashboardRender from "./dashboard-render"
const Project: FC<any> = () => {
    const [data, setData] = useState<any>(introduction)
    const onChange = (value: any) => {
        if (value == "chinese") {
            setData(chinese)
        } else if (value == "english") {
            setData(english)
        }
    }
    const [panel, setPanel] = useState<string>("llm")

    return <div style={{ maxWidth: "1000px", margin: "1rem auto" }}>
        <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} >

                <Card title="Brave Dashboard" size="small" extra={<>
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

            {/* <Col xs={24} sm={6} md={6} lg={6} xl={6}  >

                <ContainerComp keys={["traefik", "code-server", "notebook", "rstudio"]}></ContainerComp>

            </Col>

            <Col xs={24} sm={6} md={6} lg={6} xl={6}  >
                <RunningContainer></RunningContainer>
            </Col> */}
        </Row>

    </div>
}

export default Project