import { deleteComponentApi, deletePipelineRelationApi } from "@/api/pipeline"
import { Button, Collapse, Flex, Modal, Popconfirm, Table } from "antd"
import axios from "axios"
import { useEffect, useState } from "react"
import { useOutletContext } from "react-router"
import { CreateOrUpdatePipelineComponent } from "../create-pipeline"
import { useModal } from "@/hooks/useModal"

const DependComponent = ({ visible, onClose, params, callback }: any) => {
    if (!visible) {
        return null
    }
    const { modal, openModal, closeModal } = useModal()
    const { component_id, component_type, namespace, namespace_name, name, ...rest } = params
    const [dependComponent, setDependComponent] = useState<any[]>([])
    const { messageApi } = useOutletContext<any>()
    const getDependComponent = async () => {
        const resp = await axios.get(`/get-depend-component/${component_id}`)
        setDependComponent(resp.data)
    }
    const deletePipelineRelation = async (realtionId: any) => {
        try {
            const resp = await deletePipelineRelationApi(realtionId)
            messageApi.success("删除成功!")
            getDependComponent()
        } catch (error: any) {
            console.log(error)
            messageApi.error(`${error.response.data.detail}`)
        }
    }
    const deleteComponent = async (componentId: any) => {
        try {
            const resp = await deleteComponentApi(componentId)
            messageApi.success("删除成功!")
            onClose()
            if (callback) {
                callback()
            }
        } catch (error: any) {
            console.log(error)
            messageApi.error(`${error.response.data.detail}`)
        }
    }
    useEffect(() => {
        getDependComponent()
    }, [component_id])
    return <div>
        <Modal
            width={"70%"}
            title={`Component(${component_type},${name})`}
            open={visible} onCancel={onClose}
            footer={(_, { OkBtn, CancelBtn }) => (
                <>
                    <Popconfirm title="Are you sure to delete this component?" onConfirm={() => {
                        deleteComponent(component_id)
                    }}>
                        <Button size="small" color="danger" variant="solid">Delete Component</Button>
                    </Popconfirm>
                    <Button size="small" color="cyan" variant="solid" onClick={getDependComponent}>Refresh</Button>
                    <Button size="small" color="cyan" variant="solid" onClick={onClose}>Close</Button>

                    {/* <OkBtn /> */}
                </>
            )}
        >
            <div>
                {/* <pre>{JSON.stringify(dependComponent, null, 2)}</pre> */}

                <Table 
                size="small"
                bordered
                pagination={false}
                columns={[{
                    title: "Component Name",
                    dataIndex: "component_name",
                    key: "component_name"
                }, {
                    title: "Component Type",
                    dataIndex: "component_type",
                    key: "component_type"
                }, {
                    title: "Relation Type",
                    dataIndex: "relation_type",
                    key: "relation_type"
                }, {
                    title: "Component ID",
                    dataIndex: "component_id",
                    key: "component_id"
                }, {
                    title: "Relation ID",
                    dataIndex: "relation_id",
                    key: "relation_id"
                }, {
                    title: "Action",
                    key: "action",
                    render: (_, record) => (
                        <Flex gap={"small"}>
                            <Popconfirm
                                title="Are you sure to delete this relation?"
                                onConfirm={() => {
                                    deletePipelineRelation(record.relation_id)
                                }}
                            >
                                <Button size="small" color="danger" variant="solid">Delete Relation</Button>
                            </Popconfirm>
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                openModal("modalA", {
                                    data: record, structure: {
                                        component_type: record.component_type,
                                    }
                                })
                            }}>Update</Button>
                            {/* <Button size="small" color="cyan" variant="solid">修改组件</Button> */}
                        </Flex>
                    )
                }
                ]} dataSource={dependComponent} />
            </div>

            <Collapse ghost items={[
                {
                    key: "1",
                    label: "More",
                    children: <pre>{JSON.stringify(params, null, 2)}</pre>
                }
            ]} />
        </Modal>
        <CreateOrUpdatePipelineComponent
            callback={getDependComponent}
            visible={modal.key == "modalA" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdatePipelineComponent>
    </div>

}

export default DependComponent