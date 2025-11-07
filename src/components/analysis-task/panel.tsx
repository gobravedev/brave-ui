import { Drawer, Skeleton } from "antd"
import { FC, lazy, Suspense } from "react"
import ResultParse from "."
const AnalysisTask = lazy(() => import("."))

const AnalysisTaskPanel: FC<any> = ({ params, visible, onClose, callback }) => {
    if (!visible) {
        return null
    }
    console.log("AnalysisTaskPanel Render")
    return <Suspense fallback={<Skeleton active></Skeleton>}><AnalysisTask onClose={onClose} {...params} callback={callback}></AnalysisTask></Suspense>
    
}
export default AnalysisTaskPanel