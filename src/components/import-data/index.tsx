import { FC } from "react"

import SamplePage from '@/pages/sample'
import { Drawer, Tabs } from "antd"
import ImportFile from "./import-file"
const ImportData:FC<any> = ({ visible, onClose, params, callback } )=>{
    if (!visible) return null;

    return <>
        <Drawer open={visible} onClose={onClose} width={"80%"}>
        <Tabs items={[
            {
                key:"1",
                label:"输入文件",
                children:<ImportFile {...params}></ImportFile>
            },
            {
                key:"2",
                label:"metadata",
                children:<SamplePage></SamplePage>
            }
           ]}></Tabs>

        </Drawer>
    </>
}

export default ImportData