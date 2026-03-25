import AI from "@/components/chat/ai";
import { FC, use, useEffect, useState } from "react";
// import AnalysisResultPage from "@/components/result-list/page";
import { Card, Col, Row, Space, Tag } from "antd";
import axios from "axios";
import { MonacoEditor } from "@/components/react-monaco-editor";
import ComponentStructure from "./component-structure";

const LLMFile: FC<any> = ({ component, callback, openModal, panel, component_type }) => {
    // const [analysisResultId, setAnalysisResultId] = useState<any>(null);
    // const leftSize = analysisResultId ? 12 : 24;
    // useEffect(()=>{
    //     setAnalysisResultId(undefined)
    // },[component?.component_id ])

    // // const [data, setData] = useState<any>()
    // const [content, setContent] = useState<string>("")
    // const loadData = async () => {
    //     const resp = await axios.post("/find-pipeline", { component_id: component?.component_id })
    //     // setData(resp.data)
    //     const data = resp.data
    //     setContent(data?.content || "")
    // }
    // useEffect(() => {
    //     if (component?.component_id) {
    //         loadData()
    //     }
    // }, [component?.component_id])

    return <ComponentStructure component_id={component?.component_id}></ComponentStructure>


}

export default LLMFile