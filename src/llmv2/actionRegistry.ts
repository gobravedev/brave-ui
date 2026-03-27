import { ActionDispatcher } from "./dispatcher";
import { useUIStore } from "@/store-zustand/ui";
import { useFormStore } from "@/store-zustand/form";
import { useRouterStore } from "@/store-zustand/router";

// 定义各 Action payload 类型
export type ShowMessagePayload = { type: "success" | "error" | "info" | "warning"; text: string };
export type ShowNotificationPayload = { type: "success" | "error" | "info" | "warning"; message: string; description?: string };
export type RouterGoPayload = { path: string };
export type FormSetValuePayload = { form: string; field: string; value: any };
export type FormResetPayload = { form: string };

export function registerActions() {
  // UI
  ActionDispatcher.register("ui.show_message", (payload: ShowMessagePayload) => {
    debugger
    const ui = useUIStore.getState();
    ui.message[payload.type](payload.text);
  });

  ActionDispatcher.register("ui.show_notification", (payload: ShowNotificationPayload) => {
    const ui = useUIStore.getState();
    ui.notification[payload.type]({
      message: payload.message,
      description: payload.description,
    });
  });

  // Router
  ActionDispatcher.register("router.go", (payload: RouterGoPayload) => {
    useRouterStore.getState().go(payload.path);
  });

  // Form
  ActionDispatcher.register("form.set_value", (payload: FormSetValuePayload) => {
    // useFormStore.getState().setValue(payload.form, payload.field, payload.value);
  });

  ActionDispatcher.register("form.reset", (payload: FormResetPayload) => {
    // useFormStore.getState().reset(payload.form);
  });
}