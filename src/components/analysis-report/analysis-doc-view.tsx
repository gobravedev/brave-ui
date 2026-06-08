import { Empty } from "antd";
import Markdown from "../markdown"

import { FC } from "react";
const AnalysisDocView: FC<any> = ({ description, content }) => {
  const markdownText = content ?? description;
  return (
    <div>
      {markdownText ? <Markdown data={markdownText}></Markdown> : <Empty />}

    </div>
  );
}

export default AnalysisDocView;