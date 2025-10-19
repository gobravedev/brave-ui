import axios from "axios";

export const updateAnalysisResultApi = (analysis_result_id:any,data: any) => axios.post(`/analysis-result/update-analsyis-result/${analysis_result_id}`, data)


export const bindSampleToAnalysisResultApi = (data:any) => axios.post("/sample/bind-sample-to-analysis-result", data)