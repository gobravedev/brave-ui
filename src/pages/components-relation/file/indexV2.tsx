import { CreateOrUpdatePipeline } from "@/components/create-pipeline"
import Code from "@/components/module-edit/code"
import { Card, Segmented } from "antd"
import { FC, useEffect, useState } from "react"
import AnalysisResultPage from "@/components/result-list/page";

const ScriptV2: FC<any> = ({ component, callback, component_type }) => {
    const [panel, setPanel] = useState<string>("structure")
    useEffect(() => {
        if (!component?.component_id && panel === "files") {
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
                            label: "files",
                            value: "files"
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

        {panel === "files" && <>
            <AnalysisResultPage
                title="Analysis Results"

                // ref={tableRef}
                setComponent={()=>{}}
                component={component}
                params={{ component_id: component?.component_id }}
                // operatePipeline={{
                //     openModal: openModal,
                //     openModals: openModals
                // }}

            ></AnalysisResultPage>
        </>}
    </Card >

}

export default ScriptV2