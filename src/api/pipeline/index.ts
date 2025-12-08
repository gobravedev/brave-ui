import axios from "axios"
// import { setMenuItems } from '@/store/menuSlice'

export const listPipeline  = async ()=>{
    const resp: any = await axios.get(`/list-pipeline-v2`)
    return resp.data
}

export const pagePipelineComponents  = async (params:any)=>{
    const resp: any = await axios.post(`/page-pipeline-components`,params)
    return resp
}

export const pageComponentsRelation  = async (params:any)=>{
    const resp: any = await axios.post(`/component/page-component-relation`,params)
    return resp
}


export const listPipelineComponents  = async (params:any)=>{
    const resp: any = await axios.post(`/list-pipeline-components`,params)
    return resp
}


export const deletePipelineRelationApi = async (realtionId:any)=>{
    const resp: any = await axios.delete(`/delete-pipeline-relation/${realtionId}`)
    return resp
}
export const deleteComponentApi = async (componentId:any)=>{
    const resp: any = await axios.delete(`/delete-component/${componentId}`)
    return resp
}
export const deleteRelationApi = async (componentId:any)=>{
    const resp: any = await axios.delete(`/delete-relation/${componentId}`)
    return resp
}
export const saveComponentRelationOrderApi = async (params:any)=>{
    const resp: any = await axios.post(`/save-component-relation-order`,params)
    return resp
}

export const savePipelineComponentsEdgesApi = async (params:any)=>{
    const resp: any = await axios.post(`/save-pipeline-components-edges`,params)
    return resp
}