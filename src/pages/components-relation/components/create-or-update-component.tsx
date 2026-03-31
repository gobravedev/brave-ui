import { CreateOrUpdatePipeline } from "@/components/create-pipeline"
import Code from "@/components/module-edit/code"
import { Card, Empty, Segmented } from "antd"
import { FC, useEffect, useState } from "react"
import AnalysisResultPage from "@/components/result-list/page";

const CreateOrUpdateComponent: FC<any> = (params) => {
      const { component, structure,callback } = params
    return <>

        <CreateOrUpdatePipeline
            callback={callback}
            structure={structure}
            data={component}
        ></CreateOrUpdatePipeline>
        {/* {panel === "structure" && <CreateOrUpdatePipeline
            callback={callback}
            structure={{
                component_type: component_type,
            }}
            data={component}
        ></CreateOrUpdatePipeline>}

        {panel === "files" && <>
            <AnalysisResultPage
                title="Analysis Results"

                setComponent={() => { }}
                component={component}
                params={{ component_id: component?.component_id }}
          

            ></AnalysisResultPage>
        </>} */}
    </>
}

export default CreateOrUpdateComponent