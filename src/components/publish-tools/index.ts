
import { registerLazyViews } from "@/core/component-registry";
import type { InferViewRegistryFromLoaders } from "@/core/component-registry/registry-types";

const storeViewLoaders = {
    createUpdateStore: () => import("./components/create-update-store"),
    publishStore: () => import("./components/publish-store"),
};


declare module "@/core/component-registry/registry-types" {
    interface ViewRegistry extends InferViewRegistryFromLoaders<typeof storeViewLoaders> {}
}

registerLazyViews(storeViewLoaders);

