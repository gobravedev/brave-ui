import AI from "@/components/chat/ai";
import { FC, useEffect, useRef, useState } from "react";
import AnalysisResultPage from "./analysis-result-page";
import { Card, Col, Row } from "antd";
import Code from "@/components/module-edit/code";
import { MonacoEditor } from "@/components/react-monaco-editor";
import axios from "axios";

const LLMScript: FC<any> = ({ component, callback, openModal, panel, component_type }) => {
    const [data, setData] = useState<any>()
    const [scriptName, setScriptName] = useState("main")
    const editorRef = useRef<any>(null)
    const [content, setContent] = useState<string>("")

    const getModuleContent = async () => {
        try {
            const resp = await axios.get(`/get-component-module-content/${component?.component_id}?script_name=${scriptName}`)
            // console.log(resp)
            setContent(resp.data.content)
        } catch (error: any) {
            console.error(`${error.response.data.detail}`)
        }


    }
    useEffect(() => {
        if (component?.component_id) {
            getModuleContent()
        }

    }, [component?.component_id, scriptName])
    return <Row gutter={[16, 16]}>
        <Col lg={12} sm={12} xs={24}>
            {/* <Code component_id={component?.component_id}></Code> */}
            <MonacoEditor height={"100%"} value={content} onChange={setContent} defaultLanguage="python" ></MonacoEditor>

        </Col>
        <Col lg={12} sm={12} xs={24}>

            <Card size="small" title="LLM Assistant">
                <AI biz_type={component_type} biz_id={component?.component_id}></AI>

            </Card>
        </Col>

    </Row>

}

export default LLMScript