import { CreateOrUpdatePipeline } from "@/components/create-pipeline"
import Code from "@/components/module-edit/code"
import { Card, Segmented } from "antd"
import { FC, useEffect, useState } from "react"

const ScriptV2: FC<any> = ({ component, callback, component_type }) => {
    const [panel, setPanel] = useState<string>("structure")
    useEffect(() => {
        if (!component?.component_id && panel === "code") {
            setPanel("structure")
        }

    }, [component])
    return <Card
        size="small"
        title={`${component?.component_name || ''}`}
        extra={<>
            {component?.component_id &&
                <Segmented size="small" value={panel}
                    onChange={(val: any) => setPanel(val)}
                    options={[
                        {
                            label: "structure",
                            value: "structure"
                        }, {
                            label: "code",
                            value: "code"
                        }
                    ]} />}
        </>}

    >
        {panel === "structure" && <CreateOrUpdatePipeline
            callback={callback}
            structure={{
                component_type: component_type,
            }}
            data={component}
        ></CreateOrUpdatePipeline>}

        {panel === "code" && <Code component_id={component?.component_id}></Code>}
    </Card >

}

export default ScriptV2