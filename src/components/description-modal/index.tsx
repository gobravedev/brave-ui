import { Modal } from "antd";
import { FC } from "react";
import Markdown from "../markdown";

const DescriptionModal:FC<any> = ({visible, onClose, params, callback })=>{
    if(!visible)return null

    return <Modal title="Illustrate" width={"50%"} onCancel={onClose} onClose={onClose} open={visible} footer={false} >
        {/* {JSON.stringify(params)} */}
        <Markdown data={params}></Markdown>
    </Modal>
}

export default DescriptionModal