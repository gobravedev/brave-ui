import AI from "@/components/chat/ai";
import { FC, use, useEffect, useState } from "react";
// import AnalysisResultPage from "@/components/result-list/page";
import { Card, Col, Row, Space, Tag } from "antd";
import axios from "axios";
import { MonacoEditor } from "@/components/react-monaco-editor";
import { useSideViewContext } from "@/context/side/SideViewContext";
import { useSelector } from "react-redux";

const LLMCard: FC<any> = () => {
    const { bizType:biz_type, bizId:biz_id  } = useSelector((state: any) => state.llm)

    // debugger
    return   <AI biz_type={biz_type} biz_id={biz_id}></AI>

}

export default LLMCard