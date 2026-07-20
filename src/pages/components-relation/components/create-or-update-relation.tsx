import { CreateORUpdateRelationComp } from "@/components/create-pipeline"
import { FC } from "react"

const CreateOrUpdateRelation: FC<any> = (params) => {
    const { component, structure, callback } = params

    return <CreateORUpdateRelationComp
        data={component}
        pipelineStructure={{
            relation_type: "tools",
        }}
        callback={callback}
    ></CreateORUpdateRelationComp>
}

export default CreateOrUpdateRelation