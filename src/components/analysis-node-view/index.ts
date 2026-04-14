
import { registerLazyViews } from "@/core/component-registry";
import type { InferViewRegistryFromLoaders } from "@/core/component-registry/registry-types";

const analysisNodeViewLoaders = {
    analysisNodes: () => import("./components/analysis-nodes"),
    analysisEdges: () => import("./components/analysis-edges"),
    analysisNodesReport: () => import("./components/analysis-nodes-report"),
    analysisNodePanel: () => import("./analysis-node-panel"),
    analysisResultDisplay: () => import("./components/result-render"),
    nodeParams: () => import("./components/node-params"),
};
// ;
declare module "@/core/component-registry/registry-types" {
    interface ViewRegistry extends InferViewRegistryFromLoaders<typeof analysisNodeViewLoaders> {}
}

registerLazyViews(analysisNodeViewLoaders);

