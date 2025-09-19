import { Button, Card, Col, Collapse, Drawer, Empty, Flex, Form, Input, message, Modal, notification, Pagination, Popconfirm, Row, Segmented, Select, Skeleton, Space, Spin, Table, Tabs, Tag, Tooltip, Typography } from "antd"
import Item from "antd/es/list/Item"
import { FC, forwardRef, lazy, Suspense, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useOutletContext, useParams } from "react-router"
import { ApartmentOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

import Meta from "antd/es/card/Meta"
import { colors } from '@/utils/utils'
import { pageContainerApi } from '@/api/container'
import axios from "axios"
import { useModal, useModals } from "@/hooks/useModal"
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

// const [pipelineComponents, setPipelineComponents] = useState<any>([])
const EntityPage = forwardRef<EntityRef, { openModal: any; entityType: any,rowSelection?:any ,params?:any}>(({rowSelection, openModal, entityType,params }, ref) => {

    const { data, pageNumber, totalPage, loading, reload, pageSize, setPageNumber, search } = usePagination({
        // pag?eApi: pageContainerApi,
        url: `/entity/page/${entityType}`,
        params: {
            ...params
        }
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
                    {openModal && <>
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



                    </>}





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
            rowSelection={rowSelection}
            rowKey={(it: any) => it.entity_id}
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




const EntityViewPanel: FC<any> = () => {
    const { modals, openModals, closeModals } = useModals(["entityPage", "entityModal", "graphView", "entityDrawer"]);
    const entityRef = useRef<EntityRef>(null)
    const reload = () => {
        entityRef.current?.reload()
    }
    return <>
        <EntityView ref={entityRef} openModals={openModals}></EntityView>
        <EntityModal
            openModals={openModals}
            callback={reload}
            visible={modals.entityModal.visible}
            params={modals.entityModal.params}
            onClose={() => closeModals("entityModal")}
        ></EntityModal>
        <GraphViewModal
            callback={reload}
            visible={modals.graphView.visible}
            params={modals.graphView.params}
            onClose={() => closeModals("graphView")}
        ></GraphViewModal>

      
    </>
}

export default EntityViewPanel

export const EntityView: FC<any> = forwardRef<any, any>(({ openModals,rowSelection,hiddenAssociation=false }, ref) => {
    const items:any[] = [
        {
            key: "mesh-F03",
            label: "Mental Disorders"
        },  {
            key: "mmesh-B",
            label: "Organisms"
        },{
           key: "taxonomy",
           label: "Microbiota"
       }, {
           key: "study",
           label: "Study"
       }, {
           key: "chemicals_and_drugs",
           label: "chemicals_and_drugs"
       }, {
           key: "diet_and_food",
           label: "diet_and_food"
       },
       //  {
       //     key: "inteventions",
       //     label: "Inteventions"
       // }
   ]
   if(!hiddenAssociation){
       items.unshift({
           key: "association",
           label: "association"
       })
   }

    const [entityType, setEntityType] = useState<any>(items[0].key)
    const [params, setParams] = useState<any>()

    // const { modal, openModal, closeModal } = useModal();

    const entityRef = useRef<EntityRef>(null)
    const [showStyle, setShowStyle] = useState<any>("table")

    const reload = () => {
        entityRef.current?.reload()
    }
    useImperativeHandle(ref, () => ({
        reload
    }))

    // const association = {
    //     key: "association",
    //     label: "association"
    // }
   

    return <div style={{ maxWidth: "1500px", margin: "1rem auto" }}>
        <Flex justify="flex-end" gap="small">
            {openModals && <>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    openModals("entityModal", { entityType: entityType })
                }}>新增</Button>
            </>}

            <Button size="small" color="cyan" variant="solid" onClick={reload}>刷新</Button>
        </Flex>
        <div style={{ marginBottom: "1rem" }}> </div>

        {/* {JSON.stringify(data)} */}

        <Tabs size="small"
            onChange={(key: any) => {
                if(key.startsWith("mesh")){
                    // debugger
                    setEntityType("mesh")
                    const category = key.split("-")[1]
                    // setCategory(category)
                    setParams({
                        category:category
                    })
                }else if(key.startsWith("mmesh")){
                    setEntityType("mesh")
                    const category = key.split("-")[1]
                    // setCategory(category)
                    setParams({
                        major_category:category
                    })
                }else{
                    setEntityType(key)
                }
               
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
            items={items}></Tabs>
        {/* {showStyle} */}
        {/* <TableTree></TableTree> */}
        {/* {entityType} */}
        {showStyle == "table" && <>
            <EntityPage rowSelection={rowSelection} ref={entityRef} openModal={openModals} params={params} entityType={entityType}></EntityPage>
        </>}
        {showStyle == "tree" && <>
            <TableTree ref={entityRef} entityType={entityType} params={params}></TableTree>
        </>}

    </div>
})





const GraphViewModal: FC<any> = ({ visible, params, onClose, callback }) => {

    return <Modal title={params?.entityName} width={"60%"} footer={null} open={visible} onClose={onClose} onCancel={onClose}>
        {/* {JSON.stringify(params)} */}
        <Suspense fallback={<Skeleton active></Skeleton>}>
            <GraphView entity_id={params?.entityId}></GraphView>

        </Suspense>
    </Modal>
}


const EntityModal: FC<any> = ({ visible, params, onClose, openModals,record, callback }) => {
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

            <ComponentsRender type={params?.entityType} openModals={openModals} record={record}></ComponentsRender>
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