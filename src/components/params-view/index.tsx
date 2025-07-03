import { Modal, Typography   } from "antd"
import { FC } from "react"

const ParamsView: FC<any> = ({ visible, onClose, params }) => {
    return <Modal
        footer={null}
        title="参数"
        width="50%"
        open={visible}
        onCancel={onClose}
    >
        <Typography>
            <pre>
                {JSON.stringify(params, null, 2)}
            </pre>
        </Typography>   
    </Modal>
}

export default ParamsView