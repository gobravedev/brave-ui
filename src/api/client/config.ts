export const API_CONFIG = {
	baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
	timeout: 15_000,
	useMock: import.meta.env.VITE_USE_MOCK === "true",
	// import.meta.env.DEV || 
};

