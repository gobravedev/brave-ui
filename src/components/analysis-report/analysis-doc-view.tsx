import { Button, Empty } from "antd";
import Markdown from "../markdown"
// import ViewResolver from "@/core/ui-renderer/ViewResolver"

import { FC } from "react";
// import WorkflowVisComponent from "@/pages/components-relation/workflow/workflow-vis-component";
const AnalysisDocView: FC<any> = ({ description, content }) => {
  const markdownText = content ?? description;
  return (
    <div>
      {markdownText ? <Markdown data={markdownText}></Markdown> : <Empty />}
       {/* <ViewResolver view={"workflow-vis"} relation_id="3738ea3d-bfb5-4116-9ba8-4cf9a57918d3"></ViewResolver> */}
    </div>
  );
}

export default AnalysisDocView;