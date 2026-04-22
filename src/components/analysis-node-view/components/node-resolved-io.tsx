import { Tabs, Typography } from "antd";
import { FC } from "react";

const NodeResolvedIO: FC<any> = ({ node }) => {

    return <>
        {node && <>
            <Tabs defaultActiveKey="inputs" items={[

                {
                    key: "inputs",
                    label: "Resolved Inputs",
                    children: <Typography>
                        <pre>
                            {JSON.stringify(node?.resolved_inputs, null, 2)}
                        </pre>
                    </Typography>
                }, {
                    key: "outputs",
                    label: "Resolved Outputs",
                    children: <Typography>
                        <pre>
                            {JSON.stringify(node?.resolved_outputs, null, 2)}
                        </pre>
                    </Typography>
                },
            ]} />





        </>}
    </>
}

export default NodeResolvedIO;