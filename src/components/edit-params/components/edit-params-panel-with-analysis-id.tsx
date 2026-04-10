import { FC } from "react"
import EditParamsPanel from "./edit-params"
import { useStoreRender } from "@/context/render/RenderProvider"

const EditParamsPanelWithAnalysisId: FC<any> = () => {
    const { formParam } = useStoreRender()
    
    return <>
    {/* {JSON.stringify(formParam)} */}
    <EditParamsPanel {...formParam}/>
    </>
}
export default EditParamsPanelWithAnalysisId
