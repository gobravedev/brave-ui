import { Drawer } from "antd"
import { FC, useRef } from "react"
import DataPage from '../../entity/components/data-page'
import { AssociationModal } from "../../entity/components"
import { useModal } from "@/hooks/useModal"
import { getColumns, getAction } from '../../entity/components/columns'

const AssociationPage: FC<any> = ({ close, graphOpt, ref }) => {
    // const { modal, openModal, closeModal } = useModal();
    // const pageRef = useRef<any>(null)
    // const reload = ()=>{
    //     if(pageRef.current){
    //         pageRef.current.reload()
    //     }
    // }
    return <>
        <DataPage
            columns={({ openModal, reload, messageApi }: any) => {
                const columns = getColumns("association")
                const action = getAction("association", openModal, reload, messageApi)
                return [...columns, ...action]
            }}
            hiddenSwitch={true} ref={ref} api={`/entity-relation/page`} openModal={graphOpt.openModal} close={close}></DataPage>
        {/* <AssociationModal
            callback={reload}
            visible={modal.key == "optModal" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></AssociationModal> */}
    </>

}
export default AssociationPage