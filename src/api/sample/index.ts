import axios from "axios";

export const deleteSampleBySampleIdApi = (sample_id: string) => axios.delete(`/sample/delete-sample-by-sample-id/${sample_id}`)