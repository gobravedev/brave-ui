import axios from "axios"

export const pageContainerApi  = async (params:any)=>{
    const resp: any = await axios.post(`/container/page`,params)
    return resp
}