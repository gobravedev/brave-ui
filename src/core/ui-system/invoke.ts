// src/core/ui-system/invoke.ts

import { useUIStore } from "./ui.store";
import type { ViewMap } from "./view.types";

type UIType = "modal" | "drawer";

type InvokeReturn<K extends keyof ViewMap> = {
  open: (params: ViewMap[K]) => string;

  drawer: (params: ViewMap[K]) => string;

  openAsync: (
    params: ViewMap[K]
  ) => Promise<any>;
};

export function invoke<K extends keyof ViewMap>(
  view: K
): InvokeReturn<K> {
  const store = useUIStore.getState();

  return {
    open(params) {
      return store.open({
        view,
        type: "modal",
        params,
      });
    },

    drawer(params) {
      return store.open({
        view,
        type: "drawer",
        params,
      });
    },

    openAsync(params) {
      return store.openAsync({
        view,
        type: "modal",
        params,
      });
    },
  };
}