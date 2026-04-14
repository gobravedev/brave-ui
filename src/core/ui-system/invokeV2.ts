// src/core/ui-system/invoke.ts

import { useUIStore } from "./ui.store";
import type { ViewProps, ViewRegistry } from "../component-registry/registry-types";
import type { DrawerProps, ModalProps } from "antd";

type ExtractProps<K extends keyof ViewRegistry> = Omit<
  ViewProps<K>,
  "close" | "onOk" | "onCancel"
>;
type Params<T> = keyof T extends never ? void : T;

type ManagedModalProps = Omit<
  ModalProps,
  "open" | "onCancel" | "afterOpenChange" | "destroyOnClose"
>;

type ManagedDrawerProps = Omit<
  DrawerProps,
  "open" | "onClose" | "afterOpenChange" | "destroyOnClose"
>;

type InvokeAPI = {
  [K in keyof ViewRegistry]: {
    open: (
      params: Params<ExtractProps<K>>,
      modalProps?: Partial<ManagedModalProps>
    ) => string;

    drawer: (
      params: Params<ExtractProps<K>>,
      drawerProps?: Partial<ManagedDrawerProps>
    ) => string;

    openAsync: (
      params: Params<ExtractProps<K>>,
      modalProps?: Partial<ManagedModalProps>
    ) => Promise<any>;
  };
};

export const invoke = new Proxy({} as InvokeAPI, {
  get(_, key: string) {
    const store = useUIStore.getState();

    return {
      open(params: any, modalProps?: Partial<ManagedModalProps>) {
        return store.open({
          view: key,
          type: "modal",
          params,
          modalProps,
        });
      },

      drawer(params: any, drawerProps?: Partial<ManagedDrawerProps>) {
        return store.open({
          view: key,
          type: "drawer",
          params,
          drawerProps,
        });
      },

      openAsync(params: any, modalProps?: Partial<ManagedModalProps>) {
        return store.openAsync({
          view: key,
          type: "modal",
          params,
          modalProps,
        });
      },
    };
  },
});