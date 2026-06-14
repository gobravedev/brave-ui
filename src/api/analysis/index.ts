import { http } from "@/api/client/http";

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
	formJson: unknown[];
};

export const editParamsV2Api = (analysisId: string) => {
	return http.post<EditParamsV2Response>(`/analysis/edit-params-v2/${encodeURIComponent(analysisId)}`);
};

export const editNodeParamsApi = (analysisNodeId: string) => {
	return http.post<EditNodeParamsResponse>(`/analysis/edit-node-params/${encodeURIComponent(analysisNodeId)}`);
};

