import Markdown from "@/components/markdown"
import { Collapse, Typography } from "antd"


const ScriptDesc: React.FC<{ component: any }> = ({ component }) => {
    return <>
        <Markdown data={component?.component_description}></Markdown>
        <Collapse ghost items={[
            {
                key: "1",
                label: "More",
                children: <>
                    <Typography>
                        <pre>{JSON.stringify(component, null, 2)}   </pre>
                    </Typography>
                </>
            }
        ]} />
    </>
}

export default ScriptDesc