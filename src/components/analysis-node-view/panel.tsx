import { useStoreRender } from "@/context/render/RenderProvider";
import ViewResolver from "@/core/ui-renderer/ViewResolver";
import { renderCloseViewButton, renderViewButton } from "@/utils/render-view-btn";
import { Button, Card, Divider, Flex, Space } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react";

const AnalysisNodePanel: FC<any> = () => {
    const { openAnalysis, analysisId, setAnalysisId, clear,  setRelation, closeAnalysis, setFormParam } = useStoreRender()

    const [view, setView] = useState("analysisNodes");

    const [title, setTitle] = useState("")
    useEffect(() => {
        return () => {
            setAnalysisId(null)
        }
    }, [])
    return <Card size="small"
        variant="borderless"
        title={title}
        extra={<Space>
            {renderViewButton(view, setView, "analysisNodes", "Nodes")}
            {renderViewButton(view, setView, "analysisNodesReport", "Report")}

            {renderViewButton(view, setView, "analysisEdges", "Edges")}
        </Space>}

    >

        <ViewResolver
            setTitle={setTitle}
            analysis_id={analysisId}
            view={view}>
        </ViewResolver>
    </Card>

}

export default AnalysisNodePanel;