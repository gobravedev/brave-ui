import { Button, Input, Flex, Modal, Popconfirm, Form } from "antd";
import axios from "axios";
import { FC, useEffect } from "react";
import { useState } from "react";
import { useOutletContext } from "react-router";

export const CreateOrUpdateNamespace: FC<any> = ({ visible, onClose, params }) => {
    if (!visible) return null;
    const [namespaceList, setNamespaceList] = useState<any>([])
    const loadNamespace = async () => {
        const resp = await axios.get(`/list-context-by-type/namespace`)
        const data = resp.data
        setNamespaceList(data)
    }
    const { messageApi } = useOutletContext<any>()
    const [record, setRecord] = useState<any>()
    const [form] = Form.useForm()
    const saveNamespace = async () => {
        const values = await form.validateFields()
        if (record) {
            await axios.post("/save-or-update-context", {
                ...values,
                type: "namespace",
                context_id: record.context_id
            })
        } else {
            await axios.post("/save-or-update-context", {
                ...values,
                type: "namespace"
            })
        }
        loadNamespace()
        // onClose()
    }
    const deleteNamespace = async (context_id: any) => {
        try {
            await axios.delete(`/delete-namespace-by-context-id/${context_id}`)
            loadNamespace()
            messageApi.success("删除成功")
        } catch (error: any) {
            messageApi.error(error.response.data.message)
        }
    }
 
    useEffect(() => {
        loadNamespace()
    }, [])

    return <Modal title="安装namespace" open={visible} onCancel={onClose} >
        <Flex>
            <Form form={form} onFinish={saveNamespace}>
                <Form.Item name="name" label="名称" rules={[{ required: true, message: "名称不能为空" }]}>
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" >
                        Submit
                    </Button>
                </Form.Item>
            </Form>


        </Flex>
        {namespaceList && namespaceList.map((item: any) => {
            return <div style={{ display: "flex", marginBottom: "0.5rem", justifyContent: "space-between" }} key={item.context_id}>
                <div>{item.name}({item.context_id})</div>
                <Button type="primary" size="small" onClick={() => {
                    setRecord(item)
                    form.setFieldsValue({
                        name: item.name
                    })
                }}>更新</Button>
                
                <Popconfirm title="确定删除吗？" onConfirm={() => {
                    deleteNamespace(item.context_id)
                }}>
                    <Button danger size="small">删除</Button>
                </Popconfirm>
            </div>
        })}
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

    const installNamespace = async (namespace   : any) => {
        try {
            await axios.post(`/import-namespace-component?namespace=${namespace}`)
            loadNamespace()
            messageApi.success("安装成功")
        } catch (error: any) {
            messageApi.error(error.response.data.message)
        }
    }
    return <Modal title="安装namespace" open={visible} onCancel={onClose} >
        {namespaceList && namespaceList.map((item: any) => {
            return <Flex style={{ display: "flex", marginBottom: "0.5rem", justifyContent: "space-between" }} key={item.namespace}>
                <div >{item.name}({item.namespace})</div>
                <Popconfirm title="确定安装吗？" onConfirm={() => {
                    installNamespace(item.namespace)
                }}>
                    <Button  size="small">安装</Button>
                </Popconfirm>
            </Flex>
        })}
    </Modal>
}

