import { http } from "@/api/client/http";
import type { PageRequest, PageResponse } from "@/api/data";

export type EditParamsV2Response = {
	analysis_name: string;
	is_report: boolean;
	is_cache: boolean;
	analysis_id: string;
	status: string;
	server_status: string;
	request_param: Record<string, unknown>;
	analysis_result: Record<string, unknown>;
	formJson: unknown[];
};

export type EditNodeParamsResponse = {
	analysis_name: string;
	is_report: boolean;
	is_cache: boolean;
	analysis_id: string;
	status: string;
	server_status: string;
	request_param: Record<string, unknown>;
	analysis_result: Record<string, unknown>;
	formJson: unknown[];
};

export const editParamsV2Api = (analysisId: string) => {
	return http.post<EditParamsV2Response>(`/analysis/edit-params-v2/${encodeURIComponent(analysisId)}`);
};

export const editNodeParamsApi = (analysisNodeId: string) => {
	return http.post<EditNodeParamsResponse>(`/analysis/edit-node-params/${encodeURIComponent(analysisNodeId)}`);
};

export interface AnalysisNodeItem {
	id: string;
	analysis_node_id: string;
	project_id: string;
	analysis_id: string;
	node_id: string;
	node_name: string;
	script_id: string;
	status: string;
	server_status: string;
	executor: string;
	cache_hit: boolean;
	retry: number;
	max_retry: number;
	created_at: string;
	updated_at: string;
	started_at?: string;
	finished_at?: string;
	output_dir?: string;
	workspace_dir?: string;
}

export interface AnalysisNodePageQuery {
	script_id?: string;
}

export const pageAnalysisNodeByProjectApi = (payload: PageRequest<AnalysisNodePageQuery>) => {
	return http.post<PageResponse<AnalysisNodeItem>>("/analysis/node/list-by-project-page", payload);
};

