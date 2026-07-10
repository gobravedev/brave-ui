import { http } from "@/api/client/http";

export interface SettingResponse {
    container_runtime: string;
}

export const getSettingApi = () => {
    return http.get<SettingResponse>("/setting/get-setting");
};