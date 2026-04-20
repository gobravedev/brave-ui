import { useStoreRender } from "@/context/render/RenderProvider";
import { ViewRegistry } from "@/core/component-registry/registry-types";
import ViewResolver from "@/core/ui-renderer/ViewResolver";
import { renderCloseViewButton, renderViewButton } from "@/utils/render-view-btn";
import { Button, Card, Divider, Flex, Space } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react";

type AnalysisNodePanelView = "analysisNodesReport" | "analysisNodes" | "analysisEdges";

const AnalysisNodePanel: FC<any> = () => {
    const { openAnalysis, analysisId, setAnalysisId, clear, setRelation, closeAnalysis, setFormParam } = useStoreRender()

    const [view, setView] = useState<AnalysisNodePanelView>("analysisNodesReport");
    const setPanelView = (nextView: string) => setView(nextView as AnalysisNodePanelView);

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
            {renderViewButton(view, setPanelView, "analysisNodesReport", "Report")}

            {renderViewButton(view, setPanelView, "analysisNodes", "Nodes")}

            {renderViewButton(view, setPanelView, "analysisEdges", "Edges")}
        </Space>}

    >
        {/* 
        <ViewResolver
            // setTitle={setTitle}
            // analysis_id={analysisId}
            view={"analysisNodesReport"}>
        </ViewResolver> */}


        {analysisId ? (<>

            <div style={{marginBottom:"0.5rem"}}>
                <ViewResolver view="analysisNodeSnapshot" analysis_id={analysisId}></ViewResolver>
            </div>
            <ViewResolver
                setTitle={setTitle}
                analysis_id={analysisId}
                view={view}
            ></ViewResolver>
        </>

        ) : null}
    </Card>

}

export default AnalysisNodePanel;