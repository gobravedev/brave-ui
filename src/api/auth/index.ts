import { http } from "@/api/client/http";

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginUser {
	id: string;
	username: string;
	email: string;
	avatar: string;
	is_active: boolean;
	can_access_all_tenants: boolean;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
}

export interface LoginResponse {
	success: boolean;
	message: string;
	user: LoginUser;
	token: string;
	refresh_token: string;
}

export const loginApi = (payload: LoginRequest) => {
	return http.post<LoginResponse>("/auth/login", payload, {
		headers: {
			accept: "application/json",
		},
	});
};
