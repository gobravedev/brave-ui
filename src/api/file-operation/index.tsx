import axios from "axios";

export const readFileApi = async (file: string) => {
    const res = await axios.get(`/file-operation/read-file`, {
        params: {
            file_path: file
        }
    })
    return res
}
export const readLogFileApi = async (file: string,offset=0) => {
    const res = await axios.get(`/file-operation/read-log-file`, {
        params: {
            file_path: file,
            offset: offset
        }
    })
    return res
}

export const writeFileApi = async (file: string, content: string) => {
    const res = await axios.post(`/file-operation/write-file`, {
        file_path: file,
        content: content
    })
    return res
}