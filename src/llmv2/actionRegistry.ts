import { ActionDispatcher } from "./dispatcher";
import { useUIStore } from "@/store-zustand/ui";
import { useFormStore } from "@/store-zustand/form";
import { useRouterStore } from "@/store-zustand/router";

export function registerActions() {
  // UI Actions
  ActionDispatcher.register("ui.show_message", ({ type, text }) => {
    const ui = useUIStore.getState();
    ui.message[type](text);
  });

  ActionDispatcher.register("ui.show_notification", ({ type, message, description }) => {
    const ui = useUIStore.getState();
    ui.notification[type]({ message, description });
  });

  // Routing
  ActionDispatcher.register("router.go", ({ path }) => {
    useRouterStore.getState().go(path);
  });

  // Forms
  ActionDispatcher.register("form.set_value", ({ form, field, value }) => {
    useFormStore.getState().setValue(form, field, value);
  });

  ActionDispatcher.register("form.reset", ({ form }) => {
    useFormStore.getState().reset(form);
  });
}