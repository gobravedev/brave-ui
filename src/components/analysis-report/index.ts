
import { registerLazyViews } from "@/core/component-registry";
import type { InferViewRegistryFromLoaders } from "@/core/component-registry/registry-types";

const viewLoaders = {
    analysisDocView: () => import("./analysis-doc-view"),
    analysisDocEditor: () => import("./analysis-doc-editor"),
    projectReportItemForm: () => import("./project-report-item-form"),
};
// ;
declare module "@/core/component-registry/registry-types" {
    interface ViewRegistry extends InferViewRegistryFromLoaders<typeof viewLoaders> {}
}

registerLazyViews(viewLoaders);

