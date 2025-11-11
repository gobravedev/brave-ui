import { Button, Flex, Form, Input, Modal, Popconfirm, Table, Tabs } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react"


const BioDatabases: FC<any> = ({ visible, onClose, params, callback }) => {
    if (!visible) return null;
    const [data, setData] = useState<any>([])
    const [loading, setLoading] = useState<any>(false)
    const [form] = Form.useForm()
    const [activeTabKey, setActiveTabKey] = useState<any>(params[0]?.dataKey)
    const [record, setRecord] = useState<any>(null)
    const loadData = async (params: any) => {
        setLoading(true)
        const resp = await axios.post("/list-bio-database", params)
        setData(resp.data)
        setLoading(false)
    }
    const getFormData = async () => {
        const values = await form.validateFields()
        return {
            ...values,
            "type": activeTabKey
        }
    }

    const onSave = async () => {
        const reqParams = await getFormData()
        if (record) {
            await axios.post("/update-bio-database", { ...reqParams, database_id: record.database_id })
        } else {
            await axios.post("/add-bio-database", reqParams)
        }
        reload()
        setRecord(undefined)
        form.resetFields()
    }
    const reload = () => {
        loadData({
            "type": activeTabKey
        })
    }
    useEffect(() => {
        loadData({
            "type": activeTabKey
        })
    }, [params])
    const onChange = (key: any) => {
        setActiveTabKey(key)
        loadData({
            "type": key
        })
    }
    const onDelete = async (record: any) => {
        await axios.delete(`/delete-bio-database/${record.id}`)
        reload()
    }
    const onEdit = (record: any) => {
        form.setFieldsValue(record)
        setRecord(record)
    }
    return <Modal
        title={`数据库操作`}
        open={visible}
        onCancel={onClose}
        width={"50%"}
        footer={null}
    >
        <Tabs
            tabBarExtraContent={<>
                <Button size="small" color="cyan" variant="solid" style={{ marginRight: "0.5rem" }} type="primary" onClick={reload}> 刷新</Button>
                <Button size="small" color="cyan" variant="solid" type="primary" onClick={() => {
                    setRecord(undefined)
                    onSave()
                }}> {record ? "更新" : "添加"}</Button>
            </>}
            activeKey={activeTabKey}
            onChange={onChange}
            items={params.map((item: any) => {
                return {
                    key: item.name,
                    label: item.label,
                    children: <div></div>
                }
            })}>
        </Tabs>
        <Form form={form} style={{ maxWidth: 600 }} labelCol={{ span: 3 }} >
            <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}>
                <Input />
            </Form.Item>
            <Form.Item name="path" label="路径" rules={[{ required: true, message: "请输入路径" }]}>
                <Input />
            </Form.Item>
            <Form.Item name="db_index" label="索引" >
                <Input />
            </Form.Item>
        </Form>
        <Table
            dataSource={data}
            columns={[{
                title: "名称",
                dataIndex: "name",
                key: "name"
            }, {
                title: "数据库ID",
                dataIndex: "database_id",
                key: "database_id"
            }, {
                title: "类型",
                dataIndex: "type",
                key: "type"
            }, {
                title: "路径",
                dataIndex: "path",
                key: "path"
            }, {
                title: "索引",
                dataIndex: "db_index",
                key: "db_index"
            }, {
                title: "操作",
                dataIndex: "action",
                key: "action",
                ellipsis: true,
                render: (text: any, record: any) => {
                    return <Flex gap={"small"}>
                        <Popconfirm title="确定删除吗？" onConfirm={() => {
                            onDelete(record)
                        }}>
                            <Button size="small" type="primary" danger>删除</Button>
                        </Popconfirm>
                        <Button size="small" type="primary" onClick={() => {
                            onEdit(record)
                        }}>编辑</Button>
                    </Flex>
                }
            }]}
            loading={loading}
            pagination={false}
        />

    </Modal>

}

export default BioDatabases