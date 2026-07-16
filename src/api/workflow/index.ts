import { http } from "@/api/client/http";

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