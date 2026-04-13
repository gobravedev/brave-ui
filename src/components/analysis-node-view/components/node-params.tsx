import { Button, Drawer } from "antd";
import { FC } from "react";

type Props = {
  id: number;
  close: () => void;
};

const NodeParams:FC<Props> = ({ id, close }) => {



    return <>
    <Button onClick={()=>close()}>close</Button>
        NodeParamsDrawer
    </>
}

export default NodeParams