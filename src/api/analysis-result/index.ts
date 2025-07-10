import axios from "axios";

export const updateAnalysisResultApi = (data: any) => axios.post("/analysis-result/update-analsyis-result", data)


export const bindSampleToAnalysisResultApi = (data:any) => axios.post("/sample/bind-sample-to-analysis-result", data)