import { Button, Drawer, Flex, message, Modal, Popconfirm, Tabs } from "antd"
import axios from "axios"
import { FC, useEffect, useRef, useState } from "react"
import { message as $message } from 'antd';
import TextArea from "antd/es/input/TextArea";
import Typography from "antd/es/typography/Typography";
import { MonacoEditor } from "../react-monaco-editor"
const ModuleEdit: FC<any> = ({ visible, onClose, params, callback }) => {
    if (!visible) return null;
    const [data, setData] = useState<any>()
    const [messageApi, contextHolder] = message.useMessage();
    const [scriptName, setScriptName] = useState("main")
    const editorRef = useRef<any>(null)

    const getModuleContent = async (params: any) => {
        try {
            const resp = await axios.get(`/get-component-module-content/${params.component_id}?script_name=${scriptName}`)
            console.log(resp)
            setData(resp.data)
        } catch (error: any) {
            messageApi.error(`${error.response.data.detail}`)
        }


    }
    useEffect(() => {
        getModuleContent(params)
    }, [JSON.stringify(params), scriptName])
    return <>
        {contextHolder}
        <Drawer
            extra={

                <Flex justify="flex-end" gap={"small"}>
                    <Popconfirm title="Whether to generate scripts?" onConfirm={async () => {
                        await axios.post(`/component/convert-ipynb/${params.component_id}`)
                        messageApi.success("Generate Script Successful!")
                        getModuleContent(params)
                    }}>
                        <Button size="small" color="cyan" variant="solid">Generate scripts</Button>
                    </Popconfirm>
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        getModuleContent(params)
                    }}>Refresh</Button>
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        editorRef.current.setValue(data?.content)
                    }}>Save</Button>
                </Flex>
            }
            title="View File"
            open={visible}
            onClose={onClose} width={"50%"}>
            {/* {JSON.stringify(params)} */}
            <ul>
                {/* <li>module:{data?.module}</li> */}
                <li>path:{data?.path}</li>
            </ul>
            <hr />
            {/* <Typography>
                <pre>
                    {data?.content}
                </pre>
            </Typography> */}
            <Tabs
                // key={scriptName}
                onChange={(key) => {
                    setScriptName(key)
                }}
                items={[{ label: "main", key: "main" }, { label: "input_parse", key: "input_parse" }, { label: "output_parse", key: "output_parse" }]}></Tabs>
            <MonacoEditor value={data?.content} editorRef={editorRef} defaultLanguage="python"></MonacoEditor>
            {/* <TextArea value={data?.content} disabled rows={10}>
            </TextArea> */}

        </Drawer>
    </>
}

export default ModuleEdit