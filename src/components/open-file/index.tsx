import { readFileApi } from "@/api/file-operation";
import { Button, Flex, Modal, Tabs } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react"
import { MonacoEditor } from "../react-monaco-editor";

const OpenFile: FC<any> = ({ visible, onClose, params }) => {
    const [fileContent, setFileContent] = useState<any>()
    const [fileList, setFileList] = useState<any[]>([])
    const [tabKey, setTabKey] = useState<any>()
    useEffect(() => {
        if (visible) {
            const paramsList = Object.entries(params).map(([key, value]) => ({
                key: value,
                label: key
            }))
            setFileList(paramsList)
            if (paramsList.length > 0) {
                const file_path = paramsList[0].key
                setTabKey(file_path)
                readFile(file_path as string)
            }
        }
    }, [visible])
    const readFile = async (file_path: string) => {
        const resp = await readFileApi(file_path)
        setFileContent(resp.data)
    }
    const handleDownload = (file_path: string) => {
        const url = `/brave-api/file-operation/download?path=${file_path}`;
        window.open(url, "_blank");
    };
    if (!visible) return null;
    return <Modal
        width="80vw"
        open={visible}
        onCancel={onClose}
        title="打开文件"

    >
        <Tabs tabBarExtraContent={
            <Flex gap={"small"} align={"center"}>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    handleDownload(tabKey)
                }}>下载</Button>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    readFile(tabKey)
                }}>刷新</Button>
            </Flex>

        } items={fileList} onChange={(key) => {
            readFile(key)
            setTabKey(key)
        }} />
        {/* {JSON.stringify(fileList)} */}
        <MonacoEditor value={fileContent} />
        {/* <div>{JSON.stringify(params)}</div> */}
    </Modal>
}

export default OpenFile