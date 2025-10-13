import { FC, memo, useState } from "react"

import SamplePage from '@/pages/sample'
import { Drawer, Modal, Tabs } from "antd"
import ImportFile from "./import-file"
const ImportData: FC<any> = ({ visible, onClose, params, callback }) => {
    if (!visible) return null;
    return <>
        <Modal open={visible} onClose={onClose} width={"80%"} onCancel={onClose} title="Import Data" footer={null}>
            {/* {JSON.stringify(params)} */}
            <MemoizedImportFileComponnetRender params={params} type="inputFile" callback={() => {
                onClose()
                if (callback) {
                    callback()
                }

            }} />

            {/* {JSON.stringify(params)} */}
            {/* <Tabs items={[
                {
                    key: "1",
                    label: "Input File",
                    children: <>
                        {params && <>
                            <MemoizedImportFileComponnetRender params={params} type="inputFile" callback={onClose} />

                        </>}
                    </>
                }, {
                    key: "2",
                    label: "输出文件",
                    children: <>
                        {params && <>
                            <MemoizedImportFileComponnetRender params={params} type="outputFile" callback={onClose} />

                        </>}
                    </>
                },
               
            ]}></Tabs> */}

        </Modal>
    </>
}

const ImportFileComponnetRender: FC<any> = ({ params, type, callback }) => {
    if (!params) return <>无数据</>;
    // const [files, setFiles] = useState<any>()
    // const [currentFile, setCurrentFile] = useState<any>()
    // return <>{JSON.stringify(params)}</>
    if (params.component_type == "software") {
        // return <>{JSON.stringify(params.inputFile )}</>
        if (params[type] && Array.isArray(params[type]) && params[type].length > 0) {
            return params[type].map((item: any, index: number) => {
                return <ImportFile
                    {...item}
                    operatePipeline={params.operatePipeline}
                    key={index}
                    callback={callback}
                ></ImportFile>
            })
        }
    } else if (params.component_type == "pipeline") {
        return <ImportFile {...params} ></ImportFile>
    } else if (params.component_type == "file") {
        return <ImportFile {...params} callback={callback}></ImportFile>
    }
}
const MemoizedImportFileComponnetRender = memo(ImportFileComponnetRender)
export default ImportData