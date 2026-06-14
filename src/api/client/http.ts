import axios from "axios";
import type { AxiosError } from "axios";
import { API_CONFIG } from "./config";
import { getGlobalMessage } from "@/hooks/useGlobalMessage";

const LOGIN_HASH_PATH = "#/login";

const redirectToLogin = () => {
	if (window.location.hash === LOGIN_HASH_PATH || window.location.hash.endsWith("/login")) {
		return;
	}
	window.location.hash = "/login";
};

type ApiErrorPayload = {
	message?: string;
	detail?: string;
	error?: {
		message?: string;
		details?: unknown;
	};
	success?: boolean;
};

const getErrorMessage = (error: AxiosError<ApiErrorPayload>) => {
	const data = error.response?.data;
	return data?.error?.message || data?.message || data?.detail || error.message || "Request failed";
};

export const http = axios.create({
	baseURL: API_CONFIG.baseURL,
	timeout: API_CONFIG.timeout,
	headers: {
		"Content-Type": "application/json",
	},
});

http.interceptors.request.use((config) => {
	const token = localStorage.getItem("Authorization") || localStorage.getItem("authorization");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

http.interceptors.response.use(
	(response) => response,
	(error: AxiosError<ApiErrorPayload>) => {
		if (error.response?.status === 401) {
			redirectToLogin();
			return Promise.reject(error);
		}

		const globalMessage = getGlobalMessage();
		if (globalMessage) {
			globalMessage.error(getErrorMessage(error));
		}
		return Promise.reject(error);
	}
);

export const setupLegacyAxios401Interceptor = () => {
	axios.interceptors.response.use(
		(response) => response,
		(error: AxiosError) => {
			if (error.response?.status === 401) {
				redirectToLogin();
			}
			return Promise.reject(error);
		}
	);
};

