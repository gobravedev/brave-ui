import AnalysisList from '@/components/analysis-list';
import AnalysisPanel, { CreateAnalysisComp, UpstreamAnalysisInput, UpstreamAnalysisOutput } from '@/components/analysis-sotware-panel'
import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import ComponentsDetailsRender from '../../../core/ui-renderer/ComponentsDetailsRender';
import { Card, Col, Divider, Flex, Row, Segmented, Space } from 'antd';
import ResultList from '@/components/result-list';
import { useStoreRender } from '@/context/render/RenderProvider';
import AnalysisToolsComp from './anlaysis-component';
import { renderCloseViewButton, renderViewButton } from '@/utils/render-view-btn';
import { useSideViewContext } from '@/context/side/SideViewContext';

const AnalysisTools = ({ operatePipeline, component }: any) => {
    const { openAnalysis, analysisId, setAnalysisId, toolsPanelView, setRelation, setToolsPanelView, closeAnalysis,setFormParam } = useStoreRender()

    



    // 


    return <>
        {/* 处于两边 */}
        <Flex justify='center' style={{ margin: "1rem 0" }}>
            <Space>
                {/* {analysisId && renderViewButton(toolsPanelView, setToolsPanelView, "analysisNodePanel", analysis.analysis_name ? analysis.analysis_name : "Analysis")} */}
                {renderViewButton(toolsPanelView, setToolsPanelView, "inputFileComponent", "Input")}
                {renderViewButton(toolsPanelView, setToolsPanelView, "analysisList", "Analysis")}
                {renderViewButton(toolsPanelView, setToolsPanelView, "outputFileComponent", "Output")}
            </Space>

        </Flex>


        <Flex justify='space-between' style={{ marginTop: "0.5rem", marginLeft: "0.5rem" }} >
          
            <Space>
                {/* {JSON.stringify(openAnalysis)} */}
                {openAnalysis && openAnalysis.length > 0 && openAnalysis.map((item: any) => (
                    renderCloseViewButton(`${toolsPanelView}-${analysisId}`, (view) => {
                        setToolsPanelView("analysisNodePanel")
                        setAnalysisId(item.analysis_id)
                    }, `analysisNodePanel-${item.analysis_id}`, item.analysis_name ? item.analysis_name : "Analysis", () => {
                        closeAnalysis(item.analysis_id)
                        setToolsPanelView("analysisList")

                    })

                ))}
            </Space>

        </Flex>
        <Divider></Divider>

        <AnalysisToolsComp
            operatePipeline={operatePipeline}
            component={component}
            analysisId={analysisId}
            panelView={toolsPanelView}
        ></AnalysisToolsComp>
    </>

}
export default AnalysisTools;