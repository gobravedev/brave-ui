import { ScriptAnalysis } from "@/components/analysis-sotware-panel"
import { useOutletContext } from "react-router"

const ScriptComponent = ({ operatePipeline, component, ...rest }: any) => {
    const { project } = useOutletContext<any>()

    return <>
        {/* {JSON.stringify(component)} */}
        <ScriptAnalysis
            component_type={component.component_type}
            script={component}
            analysisMethod={component.parent || []}
            operatePipeline={operatePipeline}
            project={project}
        ></ScriptAnalysis>
    </>
}

export default ScriptComponent;
