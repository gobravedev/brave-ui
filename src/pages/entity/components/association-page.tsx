import { Drawer } from "antd"
import { FC, useRef } from "react"
import DataPage from './data-page'
import { AssociationModal } from "."
import { useModal } from "@/hooks/useModal"
const AssociationPage: FC<any> = ({ close ,graphOpt,ref}) => {
    // const { modal, openModal, closeModal } = useModal();
    // const pageRef = useRef<any>(null)
    // const reload = ()=>{
    //     if(pageRef.current){
    //         pageRef.current.reload()
    //     }
    // }
    return <>
        <DataPage ref={ref} entityType={"association"} openModal={graphOpt.openModal} close={close}></DataPage>
        {/* <AssociationModal
            callback={reload}
            visible={modal.key == "optModal" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></AssociationModal> */}
    </>

}
export default AssociationPage