import { create } from "zustand";
import { message, notification } from "antd";

export const useUIStore = create(() => ({
  message,
  notification,
}));