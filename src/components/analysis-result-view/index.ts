import { lazy } from "react";
import { registerView } from "@/core/component-registry";

const AnalysisNodes = lazy(() => import("./components/analysis-nodes"));
const AnalysisEdges = lazy(() => import("./components/analysis-edges"));

// 注册
registerView("analysisNodes", AnalysisNodes);
registerView("analysisEdges", AnalysisEdges);

