// src/core/ui-system/invoke.ts

import { useUIStore } from "./ui.store";
import type { ViewRegistry } from "../component-registry/registry-types";

export type ExtractProps<T> =
  T extends React.ComponentType<infer P>
    ? Omit<P, "close" | "onOk" | "onCancel">
    : never;
type Params<T> = keyof T extends never ? void : T;

type InvokeAPI = {
  [K in keyof ViewRegistry]: {
    open: (
      params: Params<ExtractProps<ViewRegistry[K]>>
    ) => string;

    drawer: (
      params: Params<ExtractProps<ViewRegistry[K]>>
    ) => string;

    openAsync: (
      params: Params<ExtractProps<ViewRegistry[K]>>
    ) => Promise<any>;
  };
};

export const invoke = new Proxy({} as InvokeAPI, {
  get(_, key: string) {
    const store = useUIStore.getState();

    return {
      open(params: any) {
        return store.open({
          view: key,
          type: "modal",
          params,
        });
      },

      drawer(params: any) {
        return store.open({
          view: key,
          type: "drawer",
          params,
        });
      },

      openAsync(params: any) {
        return store.openAsync({
          view: key,
          type: "modal",
          params,
        });
      },
    };
  },
});