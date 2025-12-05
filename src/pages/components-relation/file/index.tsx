import { UpstreamAnalysisOutput } from "@/components/analysis-sotware-panel"
import { useOutletContext } from "react-router"

const FileComponent = ({ operatePipeline, component, ...rest }: any) => {
    const { project } = useOutletContext<any>()
    return <>
        <UpstreamAnalysisOutput
            {...component}
            analysisMethod={[component]}
            operatePipeline={operatePipeline}
            project={project}
        ></UpstreamAnalysisOutput>


    </>

}

export default FileComponent;