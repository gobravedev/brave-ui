import {  CreateOrUpdatePipelineV2 } from "@/components/create-pipeline"
import Code from "@/components/module-edit/code"
import { Card, Empty, Segmented } from "antd"
import { FC, useEffect, useState } from "react"
import AnalysisResultPage from "@/components/result-list/page";

const CreateOrUpdateComponent: FC<any> = (params) => {
      const { script_id, structure,callback,onOk } = params
    return <>

        <CreateOrUpdatePipelineV2
        
            callback={()=>{
                callback && callback()
                onOk && onOk()
            }}
            structure={structure}
            script_id={script_id}
        ></CreateOrUpdatePipelineV2>
      
    </>
}

export default CreateOrUpdateComponent