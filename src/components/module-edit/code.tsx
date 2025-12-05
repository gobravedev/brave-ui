import { Button, Drawer, Flex, message, Modal, Popconfirm, Tabs, Tooltip } from "antd"
import axios from "axios"
import { FC, useEffect, useRef, useState } from "react"
import { message as $message } from 'antd';
import TextArea from "antd/es/input/TextArea";
import Typography from "antd/es/typography/Typography";
import { MonacoEditor } from "../react-monaco-editor"
const Code: FC<any> = ({ component_id }) => {
    const [data, setData] = useState<any>()
    const [messageApi, contextHolder] = message.useMessage();
    const [scriptName, setScriptName] = useState("main")
    const editorRef = useRef<any>(null)

    const getModuleContent = async () => {
        try {
            const resp = await axios.get(`/get-component-module-content/${component_id}?script_name=${scriptName}`)
            console.log(resp)
            setData(resp.data)
        } catch (error: any) {
            messageApi.error(`${error.response.data.detail}`)
        }


    }
    useEffect(() => {
        if (component_id) {
            getModuleContent()
        }

    }, [component_id, scriptName])
    return <>
        {contextHolder}

        {/* <Typography>
                <pre>
                    {data?.content}s
                </pre>
            </Typography> */}
        <Tabs
            // key={scriptName}
            tabBarExtraContent={
                <Flex justify="flex-end" gap={"small"}>
                    <Popconfirm title="Whether to generate scripts?" onConfirm={async () => {
                        await axios.post(`/component/convert-ipynb/${component_id}`)
                        messageApi.success("Generate Script Successful!")
                        getModuleContent()
                    }}>
                        <Button size="small" color="cyan" variant="solid">Generate scripts</Button>
                    </Popconfirm>
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        getModuleContent()
                    }}>Refresh</Button>
                    <Tooltip title={
                        data?.path
                    }>
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            editorRef.current.setValue(data?.content)
                        }}>Save</Button>
                    </Tooltip>
                </Flex>
            }
            onChange={(key) => {
                setScriptName(key)
            }}
            items={[{ label: "main", key: "main" }, { label: "input_parse", key: "input_parse" }, { label: "output_parse", key: "output_parse" }]}></Tabs>
        <MonacoEditor value={data?.content} editorRef={editorRef} defaultLanguage="python"></MonacoEditor>
        {/* <TextArea value={data?.content} disabled rows={10}>
            </TextArea> */}

    </>
}

export default Code