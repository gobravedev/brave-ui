
import { registerLazyViews } from "@/core/component-registry";
import type { RegisteredViewComponent } from "@/core/component-registry/registry-types";
import type { ComponentProps } from "react";

type AnalysisEdgesProps = ComponentProps<(typeof import("./components/analysis-edges"))["default"]>;
type AnalysisNodesReportProps = ComponentProps<(typeof import("./components/analysis-nodes-report"))["default"]>;

declare module "@/core/component-registry/registry-types" {
    interface ViewRegistry {
        analysisNodes: RegisteredViewComponent;
        analysisEdges: RegisteredViewComponent<AnalysisEdgesProps>;
        analysisNodesReport: RegisteredViewComponent<AnalysisNodesReportProps>;
        analysisNodePanel: RegisteredViewComponent;
        analysisResultDisplay: RegisteredViewComponent;
        nodeParams: RegisteredViewComponent;
    }
}

registerLazyViews({
    analysisNodes: () => import("./components/analysis-nodes"),
    analysisEdges: () => import("./components/analysis-edges"),
    analysisNodesReport: () => import("./components/analysis-nodes-report"),
    analysisNodePanel: () => import("./analysis-node-panel"),
    analysisResultDisplay: () => import("./components/result-render"),
    nodeParams: () => import("./components/node-params"),
});

