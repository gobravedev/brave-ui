import { Button, Card, Col, Collapse, Empty, Flex, Form, Input, message, Modal, notification, Pagination, Popconfirm, Row, Space, Spin, Table, Tag, Tooltip, Typography } from "antd"
import Item from "antd/es/list/Item"
import { FC, useEffect, useState } from "react"
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
const ContainerPage: FC<any> = ({ params, rowSelection }) => {
    // const [pipelineComponents, setPipelineComponents] = useState<any>([])


    const { data, pageNumber, totalPage, loading, reload, pageSize, setPageNumber } = usePagination({
        pageApi: pageContainerApi,
        params: params || {}
    })


    const navigate = useNavigate();
    const { messageApi } = useOutletContext<any>()
    const { modal, openModal, closeModal } = useModal();
    const columns: any[] = [
        {
            title: "namespace",
            dataIndex: "namespace_name",
            key: "namespace_name"
        },{
            title: "container_id",
            dataIndex: "container_id",
            key: "container_id"
        }, {
            title: "名称",
            dataIndex: "name",
            key: "name"
        }, {
            title: "镜像",
            dataIndex: "image",
            key: "image"
        }, {
            title: '操作',
            key: 'action',
            fixed: "right",
            width: 200,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        openModal("modalA", record.container_id)
                    }}>更新</Button>
                    <Popconfirm title="确认删除?" onConfirm={() => {
                        // deleteContainer(record)
                    }}>
                        <Button size="small" danger variant="solid">删除</Button>
                    </Popconfirm>




                </Space>
            ),
        },
    ]

    return <div style={{ maxWidth: "1500px", margin: "1rem auto" }}>
        <Flex justify="flex-end" gap="small">
            <Button size="small" color="cyan" variant="solid" onClick={() => {
                openModal("modalA")
            }}>新增</Button>
            <Button size="small" color="cyan" variant="solid" onClick={reload}>刷新</Button>
        </Flex>
        <div style={{ marginBottom: "1rem" }}> </div>

        {/* {JSON.stringify(data)} */}
        <Table
            rowKey={(it: any) => it.id}
            size="small"
            rowSelection={rowSelection}
            pagination={false}
            loading={loading}
            // scroll={{ x: 'max-content', y: 55 * 5 }}
            columns={columns}
            dataSource={data} />
        {totalPage != 0 && <Flex style={{ marginTop: "1rem" }} align="center">
            一共{totalPage}条数据 &nbsp;
            <Pagination
                current={pageNumber}
                pageSize={pageSize}
                total={totalPage}
                onChange={(p) => setPageNumber(p)}
                showSizeChanger={false}
            />
        </Flex>}
        <ContainerModal
            callback={reload}
            visible={modal.key == "modalA" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></ContainerModal>
    </div>
}

export default ContainerPage


const ContainerModal: FC<any> = ({ visible, params, onClose, callback }) => {
    const [form] = Form.useForm()
    const { messageApi } = useOutletContext<any>()
    useEffect(() => {
        if (visible && params) {
            loadData()
        }
    }, [visible])
    const loadData = async () => {
        const resp: any = await axios.get(`/container/find-by-id/${params}`)
        form.setFieldsValue(resp.data)
    }
    const save = async () => {
        const values = await form.validateFields()
        console.log(values)
        if (params) {
            values.container_id = params
        }
        await axios.post(`/container/add-or-update-container`, values)
        onClose()
        if (callback) {
            callback()
        }
        messageApi.success("操作成功!")
    }
    return <Modal title={params ? `编辑容器` : "创建容器"}
        onOk={save}
        width={"50%"} open={visible} onClose={onClose} onCancel={onClose}>
        {/* {params} */}
        <Form form={form}>
            <Form.Item name={"namespace"} label="namespace" rules={[{ required: true, message: '该字段不能为空!' }]}>
                <NamespaceSelect ></NamespaceSelect>
            </Form.Item>

            <Form.Item name={"name"} label="名称" rules={[{ required: true, message: '该字段不能为空!' }]}>
                <Input ></Input>
            </Form.Item>

            <Form.Item name={"image"} label="镜像" rules={[{ required: true, message: '该字段不能为空!' }]}>
                <Input ></Input>
            </Form.Item>

            <Form.Item name={"description"} label="描述">
                <TextArea ></TextArea>
            </Form.Item>


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