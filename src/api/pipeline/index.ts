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

export const listPipelineComponents  = async (params:any)=>{
    const resp: any = await axios.post(`/list-pipeline-components`,params)
    return resp
}