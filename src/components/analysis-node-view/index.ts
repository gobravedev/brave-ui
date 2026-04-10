
import { lazy } from "react";
import { registerView } from "@/core/component-registry";
const AnalysisEdges = lazy(() => import("./components/analysis-edges"));
const AnalysisNodes = lazy(() => import("./components/analysis-nodes"));
const AnalysisNodePanel = lazy(() => import("./analysis-node-panel"));
const AnalysisNodesReport = lazy(() => import("./components/analysis-nodes-report"));
const AnalysisResultDisplay = lazy(() => import("./components/result-render"));
// 注册
registerView("analysisNodes", AnalysisNodes);
registerView("analysisEdges", AnalysisEdges);
registerView("analysisNodesReport", AnalysisNodesReport);

registerView("analysisNodePanel", AnalysisNodePanel);
registerView("analysisResultDisplay", AnalysisResultDisplay);

