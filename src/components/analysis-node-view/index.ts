
import { lazy } from "react";
import { registerView } from "@/core/component-registry";
import type { RegisteredViewComponent } from "@/core/component-registry/registry-types";

declare module "@/core/component-registry/registry-types" {
	interface ViewRegistry {
		analysisNodes: RegisteredViewComponent;
		analysisEdges: RegisteredViewComponent;
		analysisNodesReport: RegisteredViewComponent;
		analysisNodePanel: RegisteredViewComponent;
		analysisResultDisplay: RegisteredViewComponent;
		nodeParams: RegisteredViewComponent;
	}
}

const AnalysisEdges = lazy(() => import("./components/analysis-edges"));
const AnalysisNodes = lazy(() => import("./components/analysis-nodes"));
const AnalysisNodePanel = lazy(() => import("./analysis-node-panel"));
const AnalysisNodesReport = lazy(() => import("./components/analysis-nodes-report"));
const AnalysisResultDisplay = lazy(() => import("./components/result-render"));
const NodeParams = lazy(() => import("./components/node-params"));
// 注册
registerView("analysisNodes", AnalysisNodes);
registerView("analysisEdges", AnalysisEdges);
registerView("analysisNodesReport", AnalysisNodesReport);

registerView("analysisNodePanel", AnalysisNodePanel);
registerView("analysisResultDisplay", AnalysisResultDisplay);

registerView("nodeParams", NodeParams);

