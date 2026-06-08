import { Empty } from "antd";
import Markdown from "../markdown"

import { FC } from "react";
const AnalysisDocView: FC<any> = ({ description }) => {
  return (
    <div>
      {description ? <Markdown data={description}></Markdown> : <Empty />}

    </div>
  );
}

export default AnalysisDocView;