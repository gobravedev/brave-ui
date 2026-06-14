import { http } from "@/api/client/http";

export type ListFileByProjectGroupResponse = Record<string, any[]>;

export type PageRequest<TQuery extends object = Record<string, unknown>> = TQuery & {
	page?: number;
	page_size?: number;
};

export interface PageResponse<TItem> {
	data: TItem[];
	page: number;
	page_size: number;
	total: number;
}

export interface DatasetItem {
	id: string;
	dataset_id: string;
	dataset_name: string;
	description: string;
	metadata: string;
	created_at: string;
	updated_at: string;
}

export interface DatasetFileItem {
	id: string;
	file_id: string;
	file_name: string;
	path: string;
	format: string;
	size: number;
	md5: string;
	storage: string;
	description: string;
	created_at: string;
	updated_at: string;
	dataset_id: string;
	dataset_name: string;
	role: string;
}

export interface SampleItem {
	id: string;
	sample_id: string;
	sample_name: string;
	subject_id: string;
	group_name: string;
	phenotype: string;
	metadata: string;
	description: string;
	created_at: string;
	updated_at: string;
	dataset_id: string;
	dataset_name: string;
}

export interface DatasetPageQuery {
	project_id: string;
	id?: string;
	dataset_id?: string;
	dataset_name?: string;
	description?: string;
	metadata?: string;
}

export interface DatasetFilePageQuery {
	project_id: string;
	id?: string;
	file_id?: string;
	file_name?: string;
	path?: string;
	format?: string;
	size?: number;
	md5?: string;
	storage?: string;
	description?: string;
	dataset_id?: string;
	dataset_name?: string;
	role?: string[];
}

export interface SamplePageQuery {
	project_id: string;
	id?: string;
	sample_id?: string;
	sample_name?: string;
	subject_id?: string;
	group_name?: string;
	phenotype?: string;
	metadata?: string;
	description?: string;
	dataset_id?: string;
	dataset_name?: string;
}

export interface AddFileToDatasetRequest {
	dataset_id: string;
	path: string;
	role?: string;
}

export interface AddFileToDatasetResponse {
	file: Record<string, unknown>;
	dataset_file: Record<string, unknown>;
}

export const listFileByProjectGroupApi = (projectId: string) => {
	return http.get<ListFileByProjectGroupResponse>(
		`/data/file/list-by-project-group?project_id=${encodeURIComponent(projectId)}`
	);
};

export const pageDatasetByProjectApi = (payload: PageRequest<DatasetPageQuery>) => {
	return http.post<PageResponse<DatasetItem>>("/data/dataset/list-by-project-page", payload);
};

export const pageFileByProjectApi = (payload: PageRequest<DatasetFilePageQuery>) => {
	return http.post<PageResponse<DatasetFileItem>>("/data/file/list-by-project-page", payload);
};

export const pageSampleByProjectApi = (payload: PageRequest<SamplePageQuery>) => {
	return http.post<PageResponse<SampleItem>>("/data/sample/list-by-project-page", payload);
};

export const addFileToDatasetApi = (payload: AddFileToDatasetRequest) => {
	return http.post<AddFileToDatasetResponse>("/data/dataset-file/add-file", payload);
};
