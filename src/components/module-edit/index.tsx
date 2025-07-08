import { Button, Drawer, Flex, message, Modal } from "antd"
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
    const editorRef = useRef<any>(null)

    const getModuleContent = async (params: any) => {
        try {
            const resp = await axios.post("/get-module-content", params)
            console.log(resp)
            setData(resp.data)
        } catch (error: any) {
            messageApi.error(`${error.response.data.detail}`)
        }


    }
    useEffect(() => {
        getModuleContent(params)
    }, [JSON.stringify(params)])
    return <>
        {contextHolder}
        <Drawer 
        extra={
            <Flex justify="flex-end" gap={"small"}>
                <Button color="cyan" variant="solid" onClick={() => {
                    editorRef.current.setValue(data?.content)
                }}>保存</Button>
            </Flex>
        }
        title="查看文件" 
        open={visible} 
        onClose={onClose} width={"50%"}>
            {/* {JSON.stringify(data)} */}
            <ul>
                <li>module:{data?.module}</li>
                <li>path:{data?.path}</li>
            </ul>
            <hr />
            {/* <Typography>
                <pre>
                    {data?.content}
                </pre>
            </Typography> */}
            <MonacoEditor value={data?.content} editorRef={editorRef} defaultLanguage="python"></MonacoEditor>
            {/* <TextArea value={data?.content} disabled rows={10}>
            </TextArea> */} 
           
            </Drawer>
    </>
}

export default ModuleEdit