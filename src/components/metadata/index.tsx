import { FC } from "react"

import SamplePage from '@/pages/sample'
import { Drawer } from "antd"
const Metadata:FC<any> = ({ visible, onClose, params, callback } )=>{
    if (!visible) return null;

    return <>
        <Drawer open={visible} onClose={onClose} width={"80%"}>
            <SamplePage></SamplePage>

        </Drawer>
    </>
}

export default Metadata