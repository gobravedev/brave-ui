import { Button, Card, Col, Collapse, Empty, Flex, Form, Input, message, Modal, notification, Pagination, Popconfirm, Row, Select, Space, Spin, Table, Tag, Tooltip, Typography } from "antd"
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
    const { eventSourceRef, status, reconnect } = useSSEContext();

    useEffect(() => {
        if (eventSourceRef) {
            const handler = (event: MessageEvent) => {
                // console.log('event', event)
                const data = JSON.parse(event.data)
                // console.log('analysisId', analysisIdRef.current)
                // if (analysisIdRef.current.includes(data.analysis_id)) {



                // }
                if (data.run_type == "retry") {
                    if (data.event == "container_pulled" || data.event == "analysis_complete" || data.event == "analysis_failed" || data.event == "analysis_started") {
                        reload()
                    }
                }

            };

            eventSourceRef.current?.addEventListener('message', handler);

            return () => {
                console.log("removeEventListener")
                eventSourceRef.current?.removeEventListener('message', handler);
            };
        }




    }, [eventSourceRef.current]);

    const { data, pageNumber, totalPage, loading, reload, pageSize, setPageNumber } = usePagination({
        pageApi: pageContainerApi,
        params: params || {}
    })


    const navigate = useNavigate();
    const { messageApi } = useOutletContext<any>()
    const { modal, openModal, closeModal } = useModal();
    const columns: any[] = [
        {
            title: "Namespace",
            dataIndex: "namespace_name",
            key: "namespace_name",
            render: (text: any, record: any) => (<>
                {text ? text : record.namespace}
            </>)
        }, {
            title: "Container Id",
            dataIndex: "container_id",
            key: "container_id"
        }, {
            title: "Name",
            dataIndex: "name",
            key: "name"
        }, {
            title: "Image",
            dataIndex: "image",
            key: "image"
        }, {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (text: any, record: any) => (<Tag color="green">
                {text}
            </Tag>)
        }, {
            title: "Image Status",
            dataIndex: "image_status",
            key: "image_status",
            render: (text: any, record: any) => (
                <Tooltip title={record.image_id}>
                    <Tag color="green">
                        {text}
                    </Tag>
                </Tooltip>
            )
        }, {
            title: 'Action',
            key: 'action',
            fixed: "right",
            width: 300,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <ContainerOpt record={record} reload={reload}></ContainerOpt>

                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        openModal("modalA", record.container_id)
                    }}>Update</Button>
                    <Popconfirm title="Delete?" onConfirm={async () => {
                        // deleteContainer(record)
                        await axios.delete(`/container/delete-container-by-id/${record.container_id}`)
                        reload()
                    }}>
                        <Button size="small" danger variant="solid">Delete</Button>
                    </Popconfirm>




                </Space>
            ),
        },
    ]

    return <div style={{ maxWidth: "1500px", margin: "1rem auto" }}>
        <Flex justify="flex-end" gap="small">
            <Button size="small" color="cyan" variant="solid" onClick={() => {
                openModal("installContainerModal")
            }}>Install</Button>

            <Button size="small" color="cyan" variant="solid" onClick={() => {
                openModal("modalA")
            }}>Create</Button>
            <Button size="small" color="cyan" variant="solid" onClick={reload}>Refresh</Button>
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
        <InstallContainerModal
            callback={reload}
            visible={modal.key == "installContainerModal" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></InstallContainerModal>
        <ContainerModal
            callback={reload}
            visible={modal.key == "modalA" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></ContainerModal>
    </div>
}

export default ContainerPage

export const ContainerOpt: FC<any> = ({ record, reload, traefikUI = false }) => {
    const getPort = (port: any, key: any) => {
        const portMap = Object.fromEntries(
            port.split(",").map((item: any) => {
                const [hostPort, containerPort] = item.split(":");
                return [parseInt(containerPort), parseInt(hostPort)];
            })
        );
        return portMap[key]
    }


    return <>
        {record.status == "running" ? <>

            {traefikUI ? <>
                <Tooltip title={<>
                    {`http://10.110.1.11:${getPort(record.port, 8080)}`}
                </>}>
                    <a onClick={() => {
                        window.open(`http://10.110.1.11:${getPort(record.port, 8080)}`, "_blank")
                    }}>Traefik UI</a>
                </Tooltip>
            </> :
                <>
                    <Tooltip title={<>
                        {`http://10.110.1.11:8089/container/${record.container_id}/`}
                    </>}>
                        <a onClick={() => {
                            window.open(`http://10.110.1.11:8089/container/${record.container_id}/`, "_blank")
                        }}>Open URL</a>
                    </Tooltip>
                </>
            }

            <Popconfirm title="Stop?" onConfirm={async () => {
                await axios.post(`/container/stop-container/${record.container_id}`)
            }}>
                <Button size="small" color="cyan" variant="solid"  >Stop</Button>
            </Popconfirm>
        </> : <>

            {record.image_status == "exist" ? <>
                <Popconfirm title="Launch?" onConfirm={async () => {
                    await axios.post(`/container/run-container/${record.container_id}`)
                }}>
                    <Button size="small" color="cyan" variant="solid"  >Launch</Button>
                </Popconfirm>

            </> : <>
                <Popconfirm title="Pull?" onConfirm={async () => {
                    await axios.post(`/container/pull-image/${record.container_id}`)
                    reload()
                }}>
                    <Button size="small" color="cyan" variant="solid"  >
                        {record.image_status=="pulling"?"pulling":"Pull"}
                        </Button>
                </Popconfirm>

            </>}
        </>}
    </>
}

import { containerData } from './container'
import { useSSEContext } from "@/context/sse/useSSEContext"
const InstallContainerModal: FC<any> = ({ visible, params, onClose, callback }) => {
    const [namespace, setNamespace] = useState<any>()
    const [messageApi, contextHolder] = message.useMessage();

    return <Modal title="Install Container" footer={null} width={"50%"} open={visible} onClose={onClose} onCancel={onClose}>
        {contextHolder}
        <NamespaceSelect value={namespace} onChange={setNamespace}></NamespaceSelect>
        <Table style={{ marginTop: "1rem" }} size="small"
            bordered
            dataSource={containerData} columns={[
                {
                    title: "name",
                    dataIndex: "name",
                    key: "name"
                }, {
                    title: "Image",
                    dataIndex: "image",
                    key: "image"
                }, {
                    title: 'Action',
                    key: 'action',
                    fixed: "right",
                    width: 300,
                    render: (_: any, record: any) => (
                        <>
                            <Popconfirm title="Install?" onConfirm={async () => {

                                const newParams = JSON.parse(JSON.stringify(record));
                                if (newParams.namespace != "default" && !namespace) {
                                    messageApi.error("Please select namespace!")
                                }
                                newParams.envionment = JSON.stringify(record.envionment)
                                newParams.labels = JSON.stringify(record.labels)
                                if (newParams.namespace != "default") {
                                    newParams.namespace = namespace
                                }

                                await axios.post(`/container/add-or-update-container`, newParams)
                                onClose()
                                callback()

                            }}>
                                <Button size="small" color="cyan" variant="solid">Install</Button>
                            </Popconfirm>

                        </>
                    )
                }
            ]}></Table>
    </Modal>
}

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
            <Form.Item name={"container_key"} label="container_key" >
                <Input disabled ></Input>
            </Form.Item>
            <Form.Item name={"description"} label="描述">
                <TextArea ></TextArea>
            </Form.Item>

            <Form.Item name={"envionment"} label="环境变量">
                <TextArea ></TextArea>
            </Form.Item>
            <Form.Item name={"command"} label="命令">
                <TextArea ></TextArea>
            </Form.Item>
            <Form.Item name={"labels"} label="标签">
                <TextArea ></TextArea>
            </Form.Item>
            <Form.Item name={"port"} label="端口">
                <Input ></Input>
            </Form.Item>
            <Form.Item name={"change_uid"} label="修改用户">
                <Select options={[
                    {
                        label: "是",
                        value: true
                    }, {
                        label: "否",
                        value: false
                    }
                ]} ></Select>
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