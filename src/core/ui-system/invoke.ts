// src/core/ui-system/invoke.ts

import { useUIStore } from "./ui.store";
import type { ViewMap } from "./view.types";
import type { DrawerProps, ModalProps } from "antd";

type UIType = "modal" | "drawer";

type ManagedModalProps = Omit<
  ModalProps,
  "open" | "onCancel" | "afterOpenChange" | "destroyOnClose"
>;

type ManagedDrawerProps = Omit<
  DrawerProps,
  "open" | "onClose" | "afterOpenChange" | "destroyOnClose"
>;

type InvokeReturn<K extends keyof ViewMap> = {
  open: (params: ViewMap[K], modalProps?: Partial<ManagedModalProps>) => string;

  drawer: (params: ViewMap[K], drawerProps?: Partial<ManagedDrawerProps>) => string;

  openAsync: (
    params: ViewMap[K],
    modalProps?: Partial<ManagedModalProps>
  ) => Promise<any>;
};

export function invoke<K extends keyof ViewMap>(
  view: K
): InvokeReturn<K> {
  const store = useUIStore.getState();

  return {
    open(params, modalProps) {
      return store.open({
        view,
        type: "modal",
        params,
        modalProps,
      });
    },

    drawer(params, drawerProps) {
      return store.open({
        view,
        type: "drawer",
        params,
        drawerProps,
      });
    },

    openAsync(params, modalProps) {
      return store.openAsync({
        view,
        type: "modal",
        params,
        modalProps,
      });
    },
  };
}