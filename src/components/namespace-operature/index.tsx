import { Button, Input, Flex, Modal, Popconfirm, Form } from "antd";
import axios from "axios";
import { FC, useEffect } from "react";
import { useState } from "react";
import { useOutletContext } from "react-router";
import { PlusCircleOutlined, PlusOutlined } from '@ant-design/icons'
export const CreateOrUpdateNamespace: FC<any> = ({ visible, onClose, params }) => {
    if (!visible) return null;
    const [namespaceList, setNamespaceList] = useState<any>([])
    const loadNamespace = async () => {
        const resp = await axios.get(`/list-namespace`)
        const data = resp.data
        setNamespaceList(data)
    }
    const { messageApi } = useOutletContext<any>()
    const [record, setRecord] = useState<any>()
    const [form] = Form.useForm()
    const [optPanel, setOptPanel] = useState<any>(false)
    const saveNamespace = async () => {
        const values = await form.validateFields()
        if (record) {
            await axios.post("/save-or-update-namespace", {
                ...values,
                namespace_id: record.namespace_id
            })
        } else {
            await axios.post("/save-or-update-namespace", {
                ...values,
            })
        }
        setOptPanel(false)
        loadNamespace()
        // onClose()
    }
    const deleteNamespace = async (namespaceId: any) => {
        try {
            await axios.delete(`/delete-namespace-by-id/${namespaceId}`)
            loadNamespace()
            messageApi.success("删除成功")
        } catch (error: any) {
            messageApi.error(error.response.data.message)
        }
    }

    useEffect(() => {
        loadNamespace()
    }, [])

    return <Modal title={<Flex gap={"small"}>
        Install namespace
        <PlusCircleOutlined style={{ cursor: "pointer", color: "cyan" }} onClick={() => {
            setOptPanel(true)
        }} />
    </Flex>} open={visible}

        onCancel={onClose} footer={null}>
        {optPanel ? <>

            <Flex>
                <Form form={form} onFinish={saveNamespace}>
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: "名称不能为空" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button size="small" color="cyan" variant="solid" htmlType="submit">
                            Submit
                        </Button>
                        <Button style={{marginLeft:"1rem"}} size="small" color="cyan" variant="solid" onClick={()=>{setOptPanel(false)}} >
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>


            </Flex>
        </> : <>
            {namespaceList && namespaceList.map((item: any) => {
                return <div style={{ display: "flex", marginBottom: "0.5rem", justifyContent: "space-between" }} key={item.namespace_id}>
                    <div>{item.name}({item.namespace_id})</div>
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        setOptPanel(true)
                        setRecord(item)
                        form.setFieldsValue({
                            name: item.name
                        })
                    }}>更新</Button>

                    <Popconfirm title="确定删除吗？" onConfirm={() => {
                        deleteNamespace(item.namespace_id)
                    }}>
                        <Button danger size="small" variant="solid">删除</Button>
                    </Popconfirm>
                </div>
            })}

        </>}


    </Modal>
}

export const InstallNamespace: FC<any> = ({ visible, onClose, params }) => {
    if (!visible) return null;
    const { messageApi } = useOutletContext<any>()

    const [namespaceList, setNamespaceList] = useState<any>([])
    const loadNamespace = async () => {
        const resp = await axios.get(`/list-namespace-file`)
        const data = resp.data
        setNamespaceList(data)
    }
    useEffect(() => {
        loadNamespace()
    }, [])

    const installNamespace = async (namespace: any) => {
        try {
            await axios.post(`/import-namespace-component?namespace=${namespace}`)
            loadNamespace()
            messageApi.success("安装成功")
        } catch (error: any) {
            messageApi.error(error.response.data.message)
        }
    }
    return <Modal footer={null} title="Install namespace" open={visible} onCancel={onClose} >
        {namespaceList && namespaceList.map((item: any) => {
            return <Flex style={{ display: "flex", marginBottom: "0.5rem", justifyContent: "space-between" }} key={item.namespace_id}>
                <div >{item.name}({item.namespace_id})</div>
                <Popconfirm title="Are you sure to install it?" onConfirm={() => {
                    installNamespace(item.namespace_id)
                }}>
                    <Button size="small" color="cyan" variant="solid">Install</Button>
                </Popconfirm>
            </Flex>
        })}
    </Modal>
}

