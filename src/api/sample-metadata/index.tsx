import axios from "axios"

export const addSampleMetadataApi = (data: any) => axios.post("/sample/add-sample-metadata", data)
export const updateSampleMetadataApi = (data: any) => axios.post("/sample/update-sample-metadata", data)
export const findSampleMetadataByIdApi = (sample_id: string) => axios.get(`/sample/find-sample-metadata-by-id/${sample_id}`)
export const updateSampleMetadataListApi = (data: any) => axios.post(`/sample/update-sample-metadata-list`, data)

