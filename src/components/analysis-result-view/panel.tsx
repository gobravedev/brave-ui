import { Skeleton } from "antd"
import { FC, lazy, Suspense } from "react"

const AnalysisResultViewComp = lazy(() => import("."))
const AnalysisResultPanel: FC<any> = ({ params, visible, onClose }) => {

    const { output_dir, analysis_id } = params || {}
    if (!visible) {
        return null
    }
    return <Suspense fallback={<Skeleton active />}>
        {analysis_id && <AnalysisResultViewComp onClose={onClose} analysis_id={analysis_id}></AnalysisResultViewComp>}



    </Suspense>
}
export default AnalysisResultPanel