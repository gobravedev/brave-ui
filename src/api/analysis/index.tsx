import axios from "axios"

export const findAnalysisById = async (id: string) => {
    const res = await axios.get(`/find-analysis-by-id/${id}`)
    return res
}

export const runAnalysisApi = async (analysis_id   : string,run_type:string) => {
    const res = await axios.post(`/run-analysis-v2/${analysis_id}?run_type=${run_type}`)
    return res
}
export const stopAnalysisApi = async (analysis_id   : string,run_type:string) => {
    const res = await axios.post(`/analysis/stop-analysis/${analysis_id}?run_type=${run_type}`)
    return res
}

export const monitorAnalysisApi = async (analysisId: string, type: string) => {
    const resp = await axios.get(`/monitor-analysis/${analysisId}?type=${type}`)
    return resp
}
