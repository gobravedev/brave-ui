import { Button, Card, Col, Collapse, Empty, Flex, Form, Input, message, Modal, notification, Pagination, Popconfirm, Row, Segmented, Select, Skeleton, Space, Spin, Table, Tabs, Tag, Tooltip, Typography } from "antd"
import Item from "antd/es/list/Item"
import { FC, forwardRef, lazy, Suspense, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useOutletContext, useParams } from "react-router"
import { ApartmentOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

import Meta from "antd/es/card/Meta"
import { colors } from '@/utils/utils'
import { pageContainerApi } from '@/api/container'
import axios from "axios"
import { useModal } from "@/hooks/useModal"
import { usePagination } from "@/hooks/usePagination"
import { NamespaceSelect } from '@/components/create-pipeline'
import TextArea from "antd/es/input/TextArea"
import { getColumns } from './columns'
import ComponentsRender from './components'
import { el } from "@faker-js/faker"
import TableTree from '@/pages/entity/components/table-tree'
import { EntityRef } from './components/interface'
// const GraphView = lazy()
const GraphView = lazy(() => import('@/pages/entity-relation/components/graph-view'));

const EntityPage = forwardRef<EntityRef, { openModal: any; entityType: any }>(({ openModal, entityType }, ref) => {
    // const [pipelineComponents, setPipelineComponents] = useState<any>([])

    const { data, pageNumber, totalPage, loading, reload, pageSize, setPageNumber, search } = usePagination({
        // pag?eApi: pageContainerApi,
        url: `/entity/page/${entityType}`,
        params: {}
    })
    useImperativeHandle(ref, () => ({
        reload: reload
    }));


    const navigate = useNavigate();
    const { messageApi } = useOutletContext<any>()

    const columns: any[] = [
        ...getColumns(entityType),
        {
            title: '操作',
            key: 'action',
            fixed: "right",
            width: 200,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        openModal("modalA", { entityType: entityType, entityId: record.entity_id })
                    }}>更新</Button>


                    {record.is_exist_graph ? <>
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            openModal("graphView", { entityType: entityType, entityId: record.entity_id, entityName: record.entity_name })
                        }}>网络</Button>
                        <Popconfirm title="确认删除节点?"
                            onConfirm={async () => {
                                // deleteContainer(record)
                                try {
                                    await axios.delete(`/entity/delete-node/${entityType}/${record.entity_id}`)
                                    messageApi.success("删除成功!")
                                    reload()
                                } catch (error: any) {
                                    console.log(error?.response?.data?.detail)
                                    messageApi.error(error?.response?.data?.detail)
                                }
                            }}>
                            <Button size="small" danger variant="solid">删除节点</Button>
                        </Popconfirm>

                    </> : <Popconfirm title="确认删除?"

                        onConfirm={async () => {
                            // deleteContainer(record)
                            try {
                                await axios.delete(`/entity/delete/${entityType}/${record.entity_id}`)
                                messageApi.success("删除成功!")
                                reload()
                            } catch (error: any) {
                                console.log(error?.response?.data?.detail)
                                messageApi.error(error?.response?.data?.detail)
                            }

                        }}>
                        <Button size="small" danger variant="solid">删除</Button>
                    </Popconfirm>
                    }






                </Space>
            ),
        },
    ]

    return <div >
        <Table
            title={() => (
                <Input.Search
                    size="small"
                    placeholder="搜索..."
                    allowClear
                    enterButton
                    onSearch={(value) => { search(value) }}

                    // value={searchText}
                    // onChange={(e: any) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
            )}
            rowKey={(it: any) => it.id}
            size="small"
            bordered
            // rowSelection={rowSelection}
            pagination={false}
            loading={loading}
            // scroll={{ x: 'max-content', y: 55 * 5 }}
            columns={columns}
            dataSource={data}
            footer={() => (<>
                {totalPage != 0 && <Flex style={{ marginTop: "1rem" }} align="center">
                    一共{totalPage}条数据 &nbsp;
                    <Pagination
                        size="small"
                        current={pageNumber}
                        pageSize={pageSize}
                        total={totalPage}
                        onChange={(p) => setPageNumber(p)}
                        showSizeChanger={false}
                    />
                </Flex>}
            </>
            )}
        />




    </div>
})




const EntityView: FC<any> = () => {
    const [entityType, setEntityType] = useState<any>("taxonomy")
    const { modal, openModal, closeModal } = useModal();
    const entityRef = useRef<EntityRef>(null)
    const [showStyle, setShowStyle] = useState<any>("table")

    const reload = () => {
        entityRef.current?.reload()
    }

    return <div style={{ maxWidth: "1500px", margin: "1rem auto" }}>
        <Flex justify="flex-end" gap="small">
            <Button size="small" color="cyan" variant="solid" onClick={() => {
                openModal("modalA", { entityType: entityType })
            }}>新增</Button>
            <Button size="small" color="cyan" variant="solid" onClick={reload}>刷新</Button>
        </Flex>
        <div style={{ marginBottom: "1rem" }}> </div>

        {/* {JSON.stringify(data)} */}

        <Tabs size="small"
            onChange={(key: any) => {
                setEntityType(key)
                // reload()
            }}
            tabBarExtraContent={<>
                <Segmented size="small" value={showStyle}
                    onChange={(val: any) => setShowStyle(val)}
                    options={[
                        {
                            label: "table",
                            value: "table"
                        }, {
                            label: "tree",
                            value: "tree"
                        }
                    ]} />

            </>}
            items={[
                {
                    key: "taxonomy",
                    label: "Microbiota"
                }, {
                    key: "study",
                    label: "Study"
                }, {
                    key: "disease",
                    label: "Psychiatric Disorder"
                },
                //  {
                //     key: "inteventions",
                //     label: "Inteventions"
                // }
            ]}></Tabs>
        {/* {showStyle} */}
        {/* <TableTree></TableTree> */}
        {showStyle == "table" && <>
            <EntityPage ref={entityRef} openModal={openModal} entityType={entityType}></EntityPage>
        </>}
        {showStyle == "tree" && <>
            <TableTree ref={entityRef} entityType={entityType}></TableTree>
        </>}
        <EntityModal
            callback={reload}
            visible={modal.key == "modalA" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></EntityModal>
        <GraphViewModal
            callback={reload}
            visible={modal.key == "graphView" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></GraphViewModal>
    </div>
}
export default EntityView

const GraphViewModal: FC<any> = ({ visible, params, onClose, callback }) => {

    return <Modal title={params?.entityName} width={"60%"} footer={null} open={visible} onClose={onClose} onCancel={onClose}>
        {/* {JSON.stringify(params)} */}
        <Suspense fallback={<Skeleton active></Skeleton>}>
            <GraphView entity_id={params?.entityId}></GraphView>

        </Suspense>
    </Modal>
}


const EntityModal: FC<any> = ({ visible, params, onClose, callback }) => {
    const [form] = Form.useForm()
    const { messageApi } = useOutletContext<any>()
    const [loading, setLoading] = useState<any>(false)
    useEffect(() => {
        if (visible && params?.entityId) {
            loadData()
        } else {
            form.resetFields()
        }
    }, [visible])
    const loadData = async () => {
        setLoading(true)
        // entityType:entityType,entityId:record.entity_id
        const resp: any = await axios.get(`/entity/get/${params.entityType}/${params.entityId}`)
        form.setFieldsValue(resp.data)
        setLoading(false)
    }
    const save = async () => {
        const values = await form.validateFields()
        if (params?.entityId) {
            await axios.put(`/entity/update/${params.entityType}/${params.entityId}`, values)
        } else {
            await axios.post(`/entity/add/${params.entityType}`, values)
        }
        // console.log(values)
        // if (params) {
        //     values.container_id = params
        // }
        // await axios.post(`/container/add-or-update-container`, values)
        onClose()
        if (callback) {
            callback()
        }
        messageApi.success("操作成功!")
    }
    return <Modal loading={loading} title={params?.entityId ? `编辑实体` : "创建实体"}
        onOk={save}
        width={"50%"} open={visible} onClose={onClose} onCancel={onClose}>
        {/* {params} */}
        <Form form={form}>
            <Form.Item name={"entity_name"} label="实体名称">
                <Input></Input>
            </Form.Item>
            <ComponentsRender type={params?.entityType}></ComponentsRender>
            <Collapse ghost items={[
                {
                    key: "1",
                    label: "更多",
                    children: <>
                        <Form.Item noStyle shouldUpdate>
                            {() => (
                                <Typography>
                                    <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
                                </Typography>
                            )}
                        </Form.Item>
                    </>
                }
            ]} />
        </Form>

    </Modal>
}