import AnalysisList from '@/components/analysis-list';
import AnalysisResultViewComp from '@/components/analysis-result-view';
import AnalysisPanel, { CreateAnalysisComp, UpstreamAnalysisInput, UpstreamAnalysisOutput } from '@/components/analysis-sotware-panel'
import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router';
import ComponentsDetailsRender from '../../../render/components-details-render';
import { Card, Col, Row, Segmented } from 'antd';
import ResultList from '@/components/result-list';
import { useStoreRender } from '@/context/render/RenderProvider';
import AnalysisToolsComp from './anlaysis-component';

const AnalysisReportContent = ({ analysisId }: any) => {


    // 


    return <Card size='small'>
        <AnalysisToolsComp
            analysisId={analysisId}
            panelView={"analysisResultView"}
        ></AnalysisToolsComp>


    </Card>
}
export default AnalysisReportContent;