import {  CreateOrUpdatePipelineV2 } from "@/components/create-pipeline"
import Code from "@/components/module-edit/code"
import { Card, Empty, Segmented } from "antd"
import { FC, useEffect, useState } from "react"
import AnalysisResultPage from "@/components/result-list/page";

const CreateOrUpdateComponent: FC<any> = (params) => {
      const { component_id, structure,callback } = params
    return <>

        <CreateOrUpdatePipelineV2
            callback={callback}
            structure={structure}
            component_id={component_id}
        ></CreateOrUpdatePipelineV2>
      
    </>
}

export default CreateOrUpdateComponent