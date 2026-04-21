import { Typography } from "antd";
import { FC } from "react";

const NodeError: FC<any> = ({ node }) => {

    return <>
        {node && <>
            <Typography>
                <pre>
                    {JSON.stringify(node?.input_validation_errors)}
                </pre>
            </Typography>
            <Typography>
                <pre>
                    {JSON.stringify(node?.output_validation_errors)}
                </pre>
            </Typography>
            <Typography>
                <pre>
                    {JSON.stringify(node?.error_message)}
                </pre>
            </Typography>




        </>}
    </>
}

export default NodeError;