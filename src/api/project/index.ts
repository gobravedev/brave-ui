import axios from "axios";

export const addProjectApi = (data: any) => axios.post("/project/add-project", data)
export const updateProjectApi = (data: any) => axios.post("/project/update-project", data)
export const findProjectByIdApi = (project_id: string) => axios.get(`/project/find-by-project-id/${project_id}`)
export const listProjectApi = () => axios.get("/project/list-project")
export const deleteProjectApi = (project_id: string) => axios.delete(`/project/delete-project/${project_id}`)

