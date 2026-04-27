
import { registerLazyViews } from "@/core/component-registry";
import type { InferViewRegistryFromLoaders } from "@/core/component-registry/registry-types";

const storeLoaders = {
    storeContent: () => import("./components/store-content"),
    storeSidebar: () => import("./components/store-sidebar"),
};
// ;
declare module "@/core/component-registry/registry-types" {
    interface ViewRegistry extends InferViewRegistryFromLoaders<typeof storeLoaders> {}
}

registerLazyViews(storeLoaders);

