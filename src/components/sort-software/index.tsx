import { Modal } from "antd"
import SortTable from "../sort-table"

const SortSoftwareModal = ({ visible,onClose,params,callback }: { visible:boolean,onClose:()=>void,params:any,callback:()=>void }) => {
    if (!visible) return null
    return <Modal footer={null} open={visible} onCancel={onClose} title="更新排序">
        <SortTable data={params.software.map((item: any) => ({
            ...item,
            key: item.component_id
        }))} callback={callback}></SortTable>
    </Modal>
}

export default SortSoftwareModal