import { CreateOrUpdatePipelineComponent } from "@/components/create-pipeline";
import { FC } from "react";

const CreateOrUpdateComponentDrawer:FC<any> = (rest) => {

    return <CreateOrUpdatePipelineComponent {...rest}></CreateOrUpdatePipelineComponent>
}
export default CreateOrUpdateComponentDrawer