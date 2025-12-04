import { UpstreamAnalysisInput } from "@/components/analysis-sotware-panel"
import { FC, useEffect, useState } from "react"
import AnalysisPanel from '@/components/analysis-sotware-panel'

const PipelineInputComponent: FC<any> = ({ component, project, operatePipeline }) => {
    const [outputFile, setOutputFile] = useState<any>([])
    useEffect(() => {
        if(component?.software && Array.isArray(component?.software)){
            const softwareFiles = component.software.flatMap((sw:any) => sw.outputFile).filter((f:any) => f);
            setOutputFile(softwareFiles)
        }
    }, [component])
    return <>
        {/* {JSON.stringify(outputFile)} */}
        <AnalysisPanel
            {...component}
            outputFile={outputFile}
            project={project}
            operatePipeline={operatePipeline}
            // inputFile={component.inputFile}
        />
    </>
}

export default PipelineInputComponent