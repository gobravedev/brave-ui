
import { registerLazyViews } from "@/core/component-registry";
import type { InferViewRegistryFromLoaders } from "@/core/component-registry/registry-types";

const viewLoaders = {
    graphicWalkerView: () => import("./graphic-walker-view"),
    graphicWalkerContent: () => import("./graphic-walker-content"),
    graphicWalkerBtn: () => import("./graphic-walker-btn"),
};
// ;
declare module "@/core/component-registry/registry-types" {
    interface ViewRegistry extends InferViewRegistryFromLoaders<typeof viewLoaders> {}
}

registerLazyViews(viewLoaders);

