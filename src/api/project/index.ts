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

export interface ProjectReportItem {
	id: string;
	project_id: string;
	title: string;
	sort_order: number;
	created_at: string;
	updated_at: string;
}

export interface ProjectReportDetailItem extends ProjectReportItem {
	content: string;
}

export interface AddProjectReportRequest {
	project_id: string;
	title: string;
	content?: string;
	sort_order?: number;
}

export interface UpdateProjectReportRequest {
	id: string;
	project_id: string;
	title: string;
	content?: string;
	sort_order?: number;
}

export interface DeleteProjectReportRequest {
	id: string;
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
export const addProjectReportApi = (payload: AddProjectReportRequest) => http.post<ProjectReportDetailItem>("/project/add-project-report", payload)
export const updateProjectReportApi = (payload: UpdateProjectReportRequest) => http.post<{ message: string }>("/project/update-project-report", payload)
export const deleteProjectReportApi = (payload: DeleteProjectReportRequest) => http.post<{ message: string }>("/project/delete-project-report", payload)
export const listProjectReportApi = (project_id: string) => http.get<ProjectReportItem[]>(`/project/list-project-report?project_id=${encodeURIComponent(project_id)}`)
export const getProjectReportDetailApi = (id: string) => http.get<ProjectReportDetailItem>(`/project/project-report-detail?id=${encodeURIComponent(id)}`)

