import { http } from "@/api/client/http";

export interface ReadWorkbookParams {
	file_path: string;
	format?: string;
}

export interface ReadWorkbookByFileIDParams {
	file_id: string;
	format?: string;
}

export interface ReadWorkbookResponse {
	file_path: string;
	format: string;
	workbook_data: Record<string, unknown>;
}

export interface WriteWorkbookRequest {
	file_path: string;
	format?: string;
	workbook_data: Record<string, unknown>;
}

export interface WriteWorkbookByFileIDRequest {
	file_id: string;
	format?: string;
	workbook_data: Record<string, unknown>;
}

export interface WriteWorkbookResponse {
	file_path: string;
	format: string;
}

export const readSheetWorkbookApi = (params: ReadWorkbookParams) => {
	return http.get<ReadWorkbookResponse>("/sheet/workbook", { params });
};

export const readSheetWorkbookByFileIDApi = (params: ReadWorkbookByFileIDParams) => {
	return http.get<ReadWorkbookResponse>("/sheet/workbook/by-file-id", { params });
};

export const writeSheetWorkbookApi = (payload: WriteWorkbookRequest) => {
	return http.post<WriteWorkbookResponse>("/sheet/workbook/save", payload);
};

export const writeSheetWorkbookByFileIDApi = (payload: WriteWorkbookByFileIDRequest) => {
	return http.post<WriteWorkbookResponse>("/sheet/workbook/save/by-file-id", payload);
};
