import { CreateORUpdateRelationComp } from "@/components/create-pipeline"
import { FC } from "react"

const CreateOrUpdateRelation:FC<any> = (params)=>{
    const { component, structure,callback } = params

    return <CreateORUpdateRelationComp 
        data={component}
        pipelineStructure={structure}
        callback={callback}
    ></CreateORUpdateRelationComp>
}

export default CreateOrUpdateRelation