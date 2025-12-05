import AnalysisPanel, { UpstreamAnalysisInput, UpstreamAnalysisOutput } from '@/components/analysis-sotware-panel'

const SoftwareComponent = ({ operatePipeline, component, componentLayout, ...rest }: any) => {

    // 
    return <>


        <AnalysisPanel
            componentLayout={componentLayout}
            // inputAnalysisMethod={item.inputAnalysisMethod}
            // analysisPipline={item.analysisPipline}
            // analysisMethod={item.analysisMethod}
            // upstreamFormJson={item.upstreamFormJson}
            {...component}
            // pipeline={{
            //     component_id: component.component_id

            // }}
            // editor={editor}
            // updateEditor={updateEditor}
            operatePipeline={operatePipeline}

        >
        </AnalysisPanel>
    </>

}
export default SoftwareComponent;