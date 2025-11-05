import { Button, Input, Flex, Modal, Popconfirm, Form, message, InputNumber } from "antd";
import axios from "axios";
import { FC, useEffect } from "react";
import { useState } from "react";
import { useOutletContext } from "react-router";
import { PlusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import TextArea from "antd/es/input/TextArea";
import { useGlobalMessage } from "@/hooks/useGlobalMessage";




export const CreateOrUpdateNamespace: FC<any> = ({ visible, onClose, params, callback }) => {
    const message = useGlobalMessage()
    // const [record, setRecord] = useState<any>()
    const [form] = Form.useForm()
    useEffect(() => {
        if (params?.namespace_id) {
            loadData()
        } else {
            form.resetFields()
        }
    }, [params?.namespace_id])

    if (!visible) return

    const saveNamespace = async () => {
        const values = await form.validateFields()
        if (params?.namespace_id) {
            await axios.post("/save-or-update-namespace", {
                ...values,
                namespace_id: params?.namespace_id
            })
            message.success("successfully update!")
        } else {
            await axios.post("/save-or-update-namespace", {
                ...values,
            })
            message.success("successfully added!")
        }
        if (callback) {
            callback()
        }
        onClose()
    }

    const loadData = async () => {
        const resp = await axios.get(`/find-namespace-by-id/${params?.namespace_id}`)
        form.setFieldsValue(resp.data)
    }

    return <Modal title={<Flex gap={"small"}>
        {params?.namespace_id ? "Update" : "Create"} Namespace
        {/* <PlusCircleOutlined style={{ cursor: "pointer", color: "cyan" }} onClick={() => {
            setOptPanel(true)
            form.resetFields()
        }} /> */}
    </Flex>} open={visible}
        onCancel={onClose} footer={null}>
        <Form form={form} onFinish={saveNamespace}>
            <Form.Item name="name" label="Name" rules={[{ required: true, message: "This field cannot be empty!" }]}>
                <Input />
            </Form.Item>
            <Form.Item name="volumes" label="Volumes" rules={[{ required: true, message: "This field cannot be empty!" }]}>
                <TextArea />
            </Form.Item>
            <Form.Item name="resources" label="Resource" rules={[{ required: true, message: "This field cannot be empty!" }]}>
                <TextArea placeholder={JSON.stringify({
                    "cpus": "10",
                    "memory": "10.GB",
                    "cache": "lenient"
                })} />
            </Form.Item>
            <Form.Item name="queue_size" label="Queue Size" rules={[{ required: true, message: "This field cannot be empty!" }]}>
                <InputNumber min={1} />
            </Form.Item>
            <Form.Item>
                <Button size="small" color="cyan" variant="solid" htmlType="submit">
                    Submit
                </Button>
                {/* <Button style={{ marginLeft: "1rem" }} size="small" color="cyan" variant="solid" onClick={() => { setOptPanel(false) }} >
                    Cancel
                </Button> */}
            </Form.Item>
        </Form>

        {/* {optPanel ? <>


           


        </> : <>
            {namespaceList && namespaceList.map((item: any) => {
                return <div style={{ display: "flex", marginBottom: "0.5rem", justifyContent: "space-between" }} key={item.namespace_id}>
                    <div>{item.name}({item.namespace_id})</div>
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        setOptPanel(true)
                        setRecord(item)
                        form.setFieldsValue(item)
                    }}>更新</Button>

                    <Popconfirm title="确定删除吗？" onConfirm={() => {
                        deleteNamespace(item.namespace_id)
                    }}>
                        <Button danger size="small" variant="solid">删除</Button>
                    </Popconfirm>
                </div>
            })}

        </>} */}


    </Modal>
}



export const InstallNamespace: FC<any> = ({ visible, onClose, params, callback }) => {
    if (!visible) return null;
    // const [messageApi, contextHolder] = message.useMessage();
    const mesage = useGlobalMessage()
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
            mesage.success("install successfully!")
            onClose()
            if (callback) {
                callback()
            }
        } catch (error: any) {
            // messageApi.error(error.response.data.message)
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

