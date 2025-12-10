
import Code from "@/components/module-edit/code"


const ScriptCode: React.FC<{ component: any }> = ({ component }) => {
    return <>
        <Code component_id={component?.component_id}></Code>
    </>
}

export default ScriptCode