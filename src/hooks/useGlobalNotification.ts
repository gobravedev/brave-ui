import { notification } from "antd";

let globalNotification: ReturnType<typeof notification.useNotification>[0] | null = null;
let contextHolder: React.ReactNode = null;

export const setupGlobalNotification = () => {
  const [api, holder] = notification.useNotification();
  globalNotification = api;
  contextHolder = holder;
  return holder;
};

export const useGlobalNotification = () => {
  if (!globalNotification) {
    throw new Error("Global notification not initialized. Call setupGlobalNotification() in App first.");
  }
  return globalNotification;
};
