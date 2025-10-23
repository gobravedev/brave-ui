import { Drawer } from "antd"
import { FC, lazy, Suspense } from "react"
const AnalysisTask = lazy(() => import("../analysis-task"))
const AnalysisTaskDrawer: FC<any> = ({ params, visible, onClose, callback }) => {
    return <Drawer open={visible} onClose={onClose} title="Result View" width={"50%"} footer={null}>
        <Suspense fallback={<div>Loading...</div>}>
            <AnalysisTask {...params} callback={callback}></AnalysisTask>
        </Suspense>
    </Drawer>
}
export default AnalysisTaskDrawer