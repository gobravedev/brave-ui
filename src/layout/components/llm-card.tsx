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
    return <Card size="small"
        title={`LLM - ${biz_type}  ${biz_id}`}
        style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: " 100%"
        }}
        styles={{
            body: {
                // height: "90%",
                flex: 1,
                overflowY: "auto"
            }
        }}
    >

        <AI biz_type={biz_type} biz_id={biz_id}></AI>
        {/* <AI biz_type={"tools"} biz_id={component?.relation_id}></AI> */}

    </Card>

}

export default LLMCard