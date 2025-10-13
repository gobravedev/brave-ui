// hooks/useGlobalMessage.ts
import { message } from "antd";

let globalMessage: ReturnType<typeof message.useMessage>[0] | null = null;
let contextHolder: React.ReactNode = null;

export const setupGlobalMessage = () => {
  const [messageApi, holder] = message.useMessage();
  globalMessage = messageApi;
  contextHolder = holder;
  return holder;
};

export const useGlobalMessage = () => {
  return globalMessage!;
};
