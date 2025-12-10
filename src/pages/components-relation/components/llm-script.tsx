import AI from "@/components/chat/ai";
import { FC } from "react";
import AnalysisResultPage from "./analysis-result-page";
import { Card, Col, Row } from "antd";
import Code from "@/components/module-edit/code";

const LLMScript: FC<any> = ({ component, callback, openModal, panel, component_type }) => {

    return <Row gutter={[16, 16]}>
        <Col lg={12} sm={12} xs={24}>
            <Code component_id={component?.component_id}></Code>

        </Col>
        <Col lg={12} sm={12} xs={24}>

            <Card size="small" title="LLM Assistant">
                <AI type={component_type} biz_id={component?.component_id}></AI>

            </Card>
        </Col>

    </Row>

}

export default LLMScript