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
            messageApi.error(`删除失败!${error.response.data.detail}`)
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
            messageApi.error(`删除失败!${error.response.data.detail}`)
        }
    }
    useEffect(() => {
        getDependComponent()
    }, [component_id])
    return <div>
        <Modal
            width={"70%"}
            title={`组件(${component_type},${name})`}
            open={visible} onCancel={onClose}
            footer={(_, { OkBtn, CancelBtn }) => (
                <>
                    <Popconfirm title="确定要删除组件吗？" onConfirm={() => {
                        deleteComponent(component_id)
                    }}>
                        <Button size="small" color="danger" variant="solid">删除组件</Button>
                    </Popconfirm>
                    <Button size="small" color="cyan" variant="solid" onClick={getDependComponent}>刷新</Button>
                    <Button size="small" color="cyan" variant="solid" onClick={onClose}>关闭</Button>

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
                    title: "组件名称",
                    dataIndex: "name",
                    key: "name"
                }, {
                    title: "组件类型",
                    dataIndex: "component_type",
                    key: "component_type"
                }, {
                    title: "关系类型",
                    dataIndex: "relation_type",
                    key: "relation_type"
                }, {
                    title: "组件ID",
                    dataIndex: "component_id",
                    key: "component_id"
                }, {
                    title: "关系ID",
                    dataIndex: "relation_id",
                    key: "relation_id"
                }, {
                    title: "操作",
                    key: "action",
                    render: (_, record) => (
                        <Flex gap={"small"}>
                            <Popconfirm
                                title="确定要移除关系吗？"
                                onConfirm={() => {
                                    deletePipelineRelation(record.relation_id)
                                }}
                            >
                                <Button size="small" color="danger" variant="solid">移除关系</Button>
                            </Popconfirm>
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                openModal("modalA", {
                                    data: record, structure: {
                                        component_type: record.component_type,
                                    }
                                })
                            }}>更新组件</Button>
                            {/* <Button size="small" color="cyan" variant="solid">修改组件</Button> */}
                        </Flex>
                    )
                }
                ]} dataSource={dependComponent} />
            </div>

            <Collapse ghost items={[
                {
                    key: "1",
                    label: "更多",
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