import axios from "axios";
import { http } from "@/api/client/http";

export interface ActiveProject {
	id: number;
	project_id: string;
	project_name: string;
	metadata_form: Array<{
		label: string;
		name: string;
	}>;
	research: string;
	parameter: string;
	description: string;
}

export interface ProjectItem {
	id: number;
	project_id: string;
	project_name: string;
	metadata_form: Array<{
		label: string;
		name: string;
	}>;
	research: string;
	parameter: string;
	description: string;
}

export interface ActivateProjectRequest {
	project_id: string;
}

export interface ActivateProjectResponse {
	message: string;
}

export const addProjectApi = (data: any) => axios.post("/project/add-project", data)
export const updateProjectApi = (data: any) => axios.post("/project/update-project", data)
export const findProjectByIdApi = (project_id: string) => axios.get(`/project/find-by-project-id/${project_id}`)
export const listProjectApi = () => http.get<ProjectItem[]>("/project/list-project")
export const activateProjectApi = (payload: ActivateProjectRequest) => {
	return http.post<ActivateProjectResponse>("/project/activate-project", payload, {
		headers: {
			accept: "application/json",
		},
	});
}
export const deleteProjectApi = (project_id: string) => axios.delete(`/project/delete-project/${project_id}`)
export const getActiveProjectApi = () => http.get<ActiveProject>("/project/active-project")

