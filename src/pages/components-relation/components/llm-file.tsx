import AI from "@/components/chat/ai";
import { FC, useEffect, useState } from "react";
import AnalysisResultPage from "@/components/result-list/page";
import { Card, Col, Row } from "antd";

const LLMFile: FC<any> = ({ component, callback, openModal, panel, component_type }) => {
    const [analysisResultId, setAnalysisResultId] = useState<any>(null);
    const leftSize = analysisResultId ? 12 : 24;
    // useEffect(()=>{
    //     setAnalysisResultId(undefined)
    // },[component?.component_id ])
    return <Row gutter={[16, 16]}>
        <Col lg={leftSize} sm={leftSize} xs={24}>
            <AnalysisResultPage
                title="Analysis Results"

                setComponent={() => { }}
                component={component}
                params={{ component_id: component?.component_id }}
                onChangeAnalysisResultId={(analysisResultId: any) => {
                    setAnalysisResultId(analysisResultId)
                }}

            ></AnalysisResultPage>
        </Col>
        {analysisResultId && <Col lg={12} sm={12} xs={24}>
            <Card size="small" title={`Chat with ${analysisResultId}`}>
                {/* {analysisResultId} */}
                <AI type={"file"} biz_id={analysisResultId}></AI>

            </Card>
        </Col>}


    </Row>

}

export default LLMFile