import { Button, Drawer, Spin, Typography } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react";

type Props = {
    analysis_node_id: string;
    close: () => void;
};

const NodeParams: FC<Props> = ({ analysis_node_id, close }) => {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        // /analysis/node-params/{analysis_node_id}
        setLoading(true);
        const res = await axios.get(`/analysis/node-params/${analysis_node_id}`);
        setData(res.data);
        setLoading(false);
    }
    useEffect(() => {
        // debugger
        if (analysis_node_id) {
            loadData();

        }
    }, [analysis_node_id])



    return <Spin spinning={loading}>
        {/* <Button onClick={()=>close()}>close</Button> */}
        <Typography>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </Typography>
    </Spin>
}

export default NodeParams