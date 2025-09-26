import { Collapse, Form, Input, Modal, Select, Typography } from "antd"
import axios from "axios"
import { FC, useEffect, useState } from "react"
import { useOutletContext } from "react-router"


const FormModal: FC<any> = ({ visible, params, onClose, record, callback, children, entityType = "mesh" }) => {
    const [form] = Form.useForm()
    const { messageApi } = useOutletContext<any>()
    const [loading, setLoading] = useState<any>(false)
    useEffect(() => {
        // console.log("11111",params)
        if (visible && params?.entityId) {
            loadData()
        } else {
            form.resetFields()
        }
    }, [visible])
    const loadData = async () => {
        setLoading(true)
        // entityType:entityType,entityId:record.entity_id
        const resp: any = await axios.get(`/entity/get/${entityType}/${params.entityId}`)
        form.setFieldsValue(resp.data)
        setLoading(false)
    }
    const save = async () => {

        const values = await form.validateFields()
        setLoading(true)
        try {
            if (params?.entityId) {
                await axios.put(`/entity/update/${params.entityType}/${params.entityId}`, values)
            } else {
                await axios.post(`/entity/add/${params.entityType}`, values)
            }
        } catch (error) {
            setLoading(false)
            messageApi.error("error!")
        }

        // console.log(values)
        // if (params) {
        //     values.container_id = params
        // }
        // await axios.post(`/container/add-or-update-container`, values)
        setLoading(false)
        onClose()
        if (callback) {
            callback()
        }

        messageApi.success("操作成功!")
    }
    return <Modal loading={loading} title={params?.entityId ? `update entity` : "create entity"}
        onOk={save}
        width={"50%"} open={visible} onClose={onClose} onCancel={onClose}>
        {/* {params} */}
        <Form form={form}>
            {children}

            {/* <ComponentsRender type={params?.entityType} record={record}></ComponentsRender> */}
            <Collapse ghost items={[
                {
                    key: "1",
                    label: "more",
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

export default FormModal