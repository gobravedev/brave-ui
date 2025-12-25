import AI from "@/components/chat/ai";
import { FC, forwardRef, use, useEffect, useImperativeHandle, useState } from "react";
// import AnalysisResultPage from "@/components/result-list/page";
import { Card, Col, Row, Space, Tag } from "antd";
import axios from "axios";
import { MonacoEditor } from "@/components/react-monaco-editor";
import { useGlobalMessage } from "@/hooks/useGlobalMessage";

const ComponentStructure = forwardRef<any, any>(

    ({ component_id, callback }, ref) => {
        // const [analysisResultId, setAnalysisResultId] = useState<any>(null);
        // const leftSize = analysisResultId ? 12 : 24;
        // useEffect(()=>{
        //     setAnalysisResultId(undefined)
        // },[component?.component_id ])

        // const [data, setData] = useState<any>()
        const message = useGlobalMessage()
        const [content, setContent] = useState<string>("")
        const loadData = async () => {
            const resp = await axios.post("/find-pipeline", { component_id: component_id })
            // setData(resp.data)
            const data = resp.data
            setContent(data?.content || "")
        }
        const save = async () => {
            console.log("save called structure")
            const resp = await axios.post("/save-pipeline", {
                component_id: component_id,
                component_type: "script",
                content: content
            })
            message.success("Structure saved")
            // loadData()
            callback && callback()

        }

        useImperativeHandle(ref, () => ({
            save,
            loadData
        }))
        useEffect(() => {
            if (component_id) {
                loadData()
            }
        }, [component_id])

        return <div >
            <MonacoEditor height={"85vh"}  value={content} onChange={setContent} defaultLanguage="json"></MonacoEditor>
        </div>

    }
)

export default ComponentStructure