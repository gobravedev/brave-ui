import { Drawer, Skeleton } from "antd"
import { FC, lazy, Suspense } from "react"
const ResultParse = lazy(() => import("."))
const ResultParsePanel: FC<any> = ({ params, visible, onClose, callback }) => {
    if (!visible) {
        return null
    }
    return <Suspense fallback={<Skeleton active></Skeleton>}><ResultParse onClose={onClose} {...params} callback={callback}></ResultParse></Suspense>
    
}
export default ResultParsePanel