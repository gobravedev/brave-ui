import { Modal } from "antd";

const ContextModal = ({visible, onClose}: {visible: boolean, onClose: () => void}) => {
    return <Modal open={visible} onCancel={onClose}>
        <div>
            <h1>Context</h1>
        </div>
    </Modal>
}

export default ContextModal;