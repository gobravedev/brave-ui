import ViewResolver from "@/core/ui-renderer/ViewResolver";
import { Button, Card, Space } from "antd";
import axios from "axios";
import { FC, useState } from "react";

const AnalysisNodePanel: FC<any> = ({ analysis_id }) => {

    const [view, setView] = useState("analysisNodesReport");

    const [title, setTitle] = useState("")

    const renderViewButton = (viewName: string, label: string) => {
        const isActive = view === viewName;
        return (
            <Button
                size="small"
                color="cyan"
                variant={isActive ? "solid" : "outlined"}
                onClick={() => setView(viewName)}
            >
                {label}
            </Button>
        );
    }
    return <Card size="small"
        variant="borderless"
        title={title}
        extra={<Space>
            {renderViewButton("analysisNodesReport", "Report")}
            {renderViewButton("analysisNodes", "Nodes")}
            {renderViewButton("analysisEdges", "Edges")}
        </Space>}

    >
        <ViewResolver
            setTitle={setTitle}
            analysis_id={analysis_id}
            view={view}>
        </ViewResolver>
    </Card>

}

export default AnalysisNodePanel;