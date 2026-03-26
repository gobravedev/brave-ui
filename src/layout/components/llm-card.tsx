import AI from "@/components/chat/ai";
import { FC, use, useEffect, useState } from "react";
// import AnalysisResultPage from "@/components/result-list/page";
import { Card, Col, Row, Space, Tag } from "antd";
import axios from "axios";
import { MonacoEditor } from "@/components/react-monaco-editor";

const LLMCard: FC<any> = (params) => {
    const { biz_type, biz_id } = params;
    // debugger
    return <Card size="small"
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