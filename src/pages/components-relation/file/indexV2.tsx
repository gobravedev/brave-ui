import { CreateOrUpdatePipeline } from "@/components/create-pipeline"
import Code from "@/components/module-edit/code"
import { Card, Empty, Segmented } from "antd"
import { FC, useEffect, useState } from "react"
import AnalysisResultPage from "@/components/result-list/page";

const FileV2: FC<any> = ({ component, callback, openModal, panel, component_type }) => {

    return <>
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
                setComponent={() => { }}
                component={component}
                params={{ component_id: component?.component_id }}
            // operatePipeline={{
            //     openModal: openModal,
            //     openModals: openModals
            // }}

            ></AnalysisResultPage>
        </>}
    </>
}

export default FileV2