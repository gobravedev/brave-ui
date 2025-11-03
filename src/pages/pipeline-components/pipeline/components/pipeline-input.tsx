import { UpstreamAnalysisInput } from "@/components/analysis-sotware-panel"
import { FC } from "react"

const PipelineInputComponent:FC<any> = ({component,project,operatePipeline}) => {
    return <UpstreamAnalysisInput
        {...component}
        project={project}
        operatePipeline={operatePipeline}
        inputAnalysisMethod={component.inputFile}
    />
}

export default PipelineInputComponent