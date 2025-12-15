import AI from "@/components/chat/ai";
import { FC, use, useEffect, useState } from "react";
// import AnalysisResultPage from "@/components/result-list/page";
import { Card, Col, Row, Space, Tag } from "antd";
import axios from "axios";
import { MonacoEditor } from "@/components/react-monaco-editor";
import ComponentStructure from "./component-structure";

const LLMFile: FC<any> = ({ component, callback, openModal, panel, component_type }) => {
    // const [analysisResultId, setAnalysisResultId] = useState<any>(null);
    // const leftSize = analysisResultId ? 12 : 24;
    // useEffect(()=>{
    //     setAnalysisResultId(undefined)
    // },[component?.component_id ])

    // // const [data, setData] = useState<any>()
    // const [content, setContent] = useState<string>("")
    // const loadData = async () => {
    //     const resp = await axios.post("/find-pipeline", { component_id: component?.component_id })
    //     // setData(resp.data)
    //     const data = resp.data
    //     setContent(data?.content || "")
    // }
    // useEffect(() => {
    //     if (component?.component_id) {
    //         loadData()
    //     }
    // }, [component?.component_id])

    return <Row gutter={[16, 16]}>
        <Col lg={12} sm={12} xs={24}>
            {/* <MonacoEditor height={"100%"}value={content} onChange={setContent}  defaultLanguage="json"></MonacoEditor> */}
            <ComponentStructure  component_id={component?.component_id}></ComponentStructure>
            {/* <AnalysisResultPage
                title="Analysis Results"

                setComponent={() => { }}
                component={component}
                params={{ component_id: component?.component_id }}
                onChangeAnalysisResultId={(analysisResultId: any) => {
                    setAnalysisResultId(analysisResultId)
                }}

            ></AnalysisResultPage> */}
        </Col>
        <Col lg={12} sm={12} xs={24}>

            <Card size="small" title={<Space>
                <span>Chat with file</span>
                <Tag>{String(component?.component_id).slice(0, 8)}</Tag>

            </Space>}>
                {/* {analysisResultId} */}
                <AI biz_type={"file"} biz_id={component?.component_id}></AI>

            </Card>
        </Col>


    </Row>

}

export default LLMFile