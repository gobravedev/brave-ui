import { Skeleton } from "antd";
import { FC, lazy, Suspense } from "react";

const AnalysisResultLLM = lazy  (() => import("./analysis-result-llm"));

const AnalysisResultLLMLPanel:FC<any> = ({visible, params, onClose })=>{
    if (!visible) return null;

    return <Suspense fallback={<Skeleton active></Skeleton>}>
        <AnalysisResultLLM  {...params} onClose={onClose} />
    </Suspense>
}

export default AnalysisResultLLMLPanel;