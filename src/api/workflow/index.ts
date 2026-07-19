import { http } from "@/api/client/http";
import type { PageResponse } from "@/api/data";

export interface GetWorkflowFormParams {
	workflowId: string;
	// projectId: string;
}

export interface WorkflowFormResponse {
	type: string;
	formJson: unknown[];
	analysis_result: Record<string, unknown>;
}

export const getWorkflowFormApi = (params: GetWorkflowFormParams) => {
	const { workflowId } = params;
	return http.get<WorkflowFormResponse>(
		`/workflows/${encodeURIComponent(workflowId)}/form`
	);
};

export const getScriptFormApi = (scriptId:any) =>{
	return http.get(`/script/${scriptId}/form`)
}

export interface ScriptItem {
	id: string;
	component_id: string;
	component_name: string;
	description?: string;
	script_type?: string;
	category?: string;
	install_key?: string;
	tags?: string;
	container_template_id?: string;
	created_at?: string;
	updated_at?: string;
}

export interface ScriptPageQuery {
	id?: string;
	ids?: string[];
	script_id?: string;
	component_name?: string;
	script_type?: string;
	category?: string;
	install_key?: string;
	tags?: string;
	keywords?: string;
	container_template_id?: string;
	sort_by?: string;
	sort_order?: "ASC" | "DESC";
}

export interface ScriptPageRequest {
	page?: number;
	page_size?: number;
	query?: ScriptPageQuery;
}

export const pageScriptApi = (payload: ScriptPageRequest) => {
	return http.post<PageResponse<ScriptItem>>("/page-script", payload);
};