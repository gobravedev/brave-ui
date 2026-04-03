import AnalysisList from '@/components/analysis-list';
import AnalysisPanel, { CreateAnalysisComp, UpstreamAnalysisInput, UpstreamAnalysisOutput } from '@/components/analysis-sotware-panel'
import { FC, useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import ComponentsDetailsRender from '../../../core/ui-renderer/ComponentsDetailsRender';
import { Card, Col, Row, Segmented } from 'antd';

const AnalysisToolsComp = ({ operatePipeline, analysisId,component,panelView }: any) => {
    const { project } = useOutletContext<any>()
    const [rightPanel, setRightPanel] = useState<any>("editParamsPanel")
    // const { analysisId, toolsPanelView, setRelation } = useStoreRender()

   

    // 


    return <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
        {/* {JSON.stringify(requestParam)} */}
        <Row  >
            <Col lg={16} sm={16} xs={24} style={{ paddingRight: "0.5rem" }}>
                {/* <div style={{height:"2rem",width:"100%", background:"red"}}></div> */}
                <ComponentsDetailsRender
                    analysis_id={analysisId}
                    relation_id={component?.relation_id}
                    operatePipeline={operatePipeline}
                    project={project}
                    component={component}
                    view={panelView}
                />
                {/* analysisResultView
                analysisList
inputFileComponent */}

            </Col>
            <Col lg={8} sm={8} xs={24}>
                <Card

                    size="small"
                    extra={<>
                        <Segmented size="small" value={rightPanel}
                            onChange={(val: any) => setRightPanel(val)}
                            options={[
                                {
                                    label: "Parameters",
                                    value: "editParamsPanel"
                                },
                                // {
                                //     label: "LLM",
                                //     value: "llmAnalysis"
                                // }, 
                                {
                                    label: "Description",
                                    value: "description"
                                }
                            ]} />
                    </>}
                >
                    {/* "6a36e07a-6bff-4995-854e-7260982e2d5d" */}
                    <ComponentsDetailsRender
                        analysisId={analysisId}
                        view={rightPanel}
                    />
                </Card>

            </Col>
        </Row>
      
    </div>


}


export default AnalysisToolsComp;