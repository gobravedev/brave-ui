import { readFileApi } from "@/api/file-operation";
import { Button, Flex, Modal, Spin, Tabs } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react"
import { MonacoEditor } from "../react-monaco-editor";
import Markdown from "../markdown";
import { ComponentsRender } from '../analysis-result-view'
import { useSelector } from "react-redux";
const OpenFile: FC<any> = ({ visible, onClose, params }) => {
    const [fileContent, setFileContent] = useState<any>()
    const [fileList, setFileList] = useState<any[]>([])
    const [tabKey, setTabKey] = useState<any>()
    const [loading, setLoading] = useState<any>()
    const { baseURL } = useSelector((state: any) => state.user)

    useEffect(() => {
        if (visible) {
            if (params?.fileType && params.fileType === "collected") {
                readFile(params.content as string)
            } else {
                const paramsList = Object.entries(params.content).map(([key, value]) => ({
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

        }
    }, [visible])
    const readFile = async (file_path: string) => {
        setLoading(true)
        const resp = await readFileApi(file_path)
        setFileContent(resp.data)
        setLoading(false)
    }
    const handleDownload = (file_path: string) => {
        const url = `${baseURL}/brave-api/file-operation/download?path=${file_path}`;
        window.open(url, "_blank");
    };
    if (!visible) return null;
    return <Modal
        width="80vw"
        open={visible}
        onCancel={onClose}
        title="Open Task File"
        footer={<>
        {tabKey}
        </>}
        
    >

        <Tabs tabBarExtraContent={
            <Flex gap={"small"} align={"center"}>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    handleDownload(tabKey)
                }}>Download</Button>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    readFile(tabKey)
                }}>Refresh</Button>
            </Flex>
        } items={fileList} onChange={(key) => {
            readFile(key)
            setTabKey(key)
        }} />
        {/* {JSON.stringify(fileList)} */}
        <Spin spinning={loading}>
            {/* <MonacoEditor value={fileContent} /> */}
            <ComponentsRender {...fileContent}></ComponentsRender>
        </Spin>
        {params?.description && <Markdown data={params.description}></Markdown>}

        {/* <div>{JSON.stringify(params)}</div> */}
    </Modal>
}

export default OpenFile