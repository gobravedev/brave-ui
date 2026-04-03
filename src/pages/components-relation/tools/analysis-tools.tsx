import AnalysisList from '@/components/analysis-list';
import AnalysisPanel, { CreateAnalysisComp, UpstreamAnalysisInput, UpstreamAnalysisOutput } from '@/components/analysis-sotware-panel'
import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import ComponentsDetailsRender from '../../../core/ui-renderer/ComponentsDetailsRender';
import { Card, Col, Row, Segmented } from 'antd';
import ResultList from '@/components/result-list';
import { useStoreRender } from '@/context/render/RenderProvider';
import AnalysisToolsComp from './anlaysis-component';

const AnalysisTools = ({ operatePipeline, component }: any) => {
    const { analysisId, toolsPanelView, setRelation } = useStoreRender()

    useEffect(() => {
        if (component) {
            setRelation(component)
        }
    }, [component])

    // 


    return  <AnalysisToolsComp
    operatePipeline={operatePipeline}
    component={component}
    analysisId={analysisId}
    panelView={toolsPanelView}
    ></AnalysisToolsComp>

}
export default AnalysisTools;