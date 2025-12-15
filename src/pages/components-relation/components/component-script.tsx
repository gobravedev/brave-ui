import AI from "@/components/chat/ai";
import { FC, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import AnalysisResultPage from "./analysis-result-page";
import { Card, Col, Row } from "antd";
import Code from "@/components/module-edit/code";
import { MonacoEditor } from "@/components/react-monaco-editor";
import axios from "axios";
import { useGlobalMessage } from "@/hooks/useGlobalMessage";

const ComponentScript = forwardRef<any, any>(

    ({ component_id, component }, ref) => {
        const [data, setData] = useState<any>()
        const [scriptName, setScriptName] = useState("main")
        const editorRef = useRef<any>(null)
        const [content, setContent] = useState<string>("")
        const message = useGlobalMessage()

        const getModuleContent = async () => {
            try {
                const resp = await axios.get(`/get-component-module-content/${component_id}?script_name=${scriptName}`)
                // console.log(resp)
                setContent(resp.data.content)
            } catch (error: any) {
                console.error(`${error.response.data.detail}`)
            }
        }

        const save = async () => {
            const resp = await axios.post(`/component/save-script/${component_id}`, {
                content: content
            })
            // console.log(resp)
            message.success(`Script saved`)

        }

        const generateScript = async () => {
            await axios.post(`/component/convert-ipynb/${component_id}`)
            message.success("Generate Script Successful!")
            getModuleContent()
        }
        useImperativeHandle(ref, () => ({
            save,
            loadData: getModuleContent,
            generateScript
        }))

        useEffect(() => {
            if (component_id) {
                getModuleContent()
            }

        }, [component_id, scriptName])
        return <>
            <MonacoEditor height={"85vh"} value={content} onChange={setContent} defaultLanguage="python" ></MonacoEditor>

        </>

    }

)
export default ComponentScript