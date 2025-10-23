import { Drawer } from "antd"
import { FC } from "react"
import ResultParse from "."

const ResultParseDrawer: FC<any> =({ params, visible, onClose, callback }) => {
    return <Drawer open={visible} onClose={onClose} title="Result View" width={"50%"} footer={null}>
        <ResultParse {...params} callback={callback}></ResultParse>
    </Drawer>
}
export default ResultParseDrawer