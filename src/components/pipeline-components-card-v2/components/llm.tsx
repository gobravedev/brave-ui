import AI from "@/components/chat/ai";
import { FC, use, useEffect, useState } from "react";
// import AnalysisResultPage from "@/components/result-list/page";
import { Card, Col, Row, Space, Tag } from "antd";
import axios from "axios";
import { MonacoEditor } from "@/components/react-monaco-editor";

const LLM: FC<any> = ({ }) => {

    return <>
        <AI biz_type={"file"} biz_id={"analysis_tools"}></AI>
    </>

}

export default LLM