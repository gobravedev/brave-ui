import { invoke } from "@/core/ui-system/invokeV2"
import { Button, Card, Flex, Form, Input, Space, Switch, Tag } from "antd"
import axios from "axios"
import { FC, useEffect, useState } from "react"
import { RedoOutlined } from '@ant-design/icons'
import TextArea from "antd/es/input/TextArea"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
import { ur } from "@faker-js/faker"
const PublishToolsV2: FC<any> = ({ relation_id, callback }) => {
    // const [force, setForce] = useState(true)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()
    const message = useGlobalMessage()

    const loadData = async () => {
        setLoading(true)
        const resp = await axios.post(`/find-tools-publish/${relation_id}`)
        setData(resp.data)
        form.setFieldsValue({
            version: resp.data.version,
            update_info: resp.data.update_info,
            url: resp.data.url,
        })
        setLoading(false)

    }


    useEffect(() => {
        loadData()
    }, [relation_id])

    return <Card size="small"
        extra={<Space>
            {data?.store_status && <Tag>
                {data?.store_status}
            </Tag>}

            <Button size="small" color="cyan" variant="solid" onClick={async () => {
                // /generate-tools-json
                const resp = await axios.post(`/generate-tools-json/${relation_id}`)
                message.success("Generated successfully")
            }}> Generate </Button>



            <Button size="small" color="cyan" variant="solid" onClick={async () => {
                // publishToStore(relation_id, record.store_id)
                // callback && callback()
                const values = await form.validateFields()
                const resp = await axios.post(`/publish-relation`, {
                    ...values,
                    relation_id: relation_id,
                    // force: force
                })
                message.success("Published successfully")
                callback && callback()
                loadData()

            }}>Publish Store</Button>

            {data?.store_status && <Button size="small" color="cyan" variant="solid" onClick={() => {
                invoke.publishStore.open(data, {
                    footer: null,
                    width: 640,
                    title: "Publish Store"
                })
            }}>Publish Remote</Button>
            }

            <Button size="small" color="cyan" variant="solid" icon={<RedoOutlined />} onClick={loadData}></Button>

        </Space>}
    >
        <Flex justify="center">
            <Form form={form} layout="vertical" style={{ width: "50%" }} disabled={loading}>
                <Form.Item
                    label="URL"
                    name="url"
                    rules={[{ required: true, message: "Please input URL" }]}
                >
                    <Input placeholder="http://github.com/owner/repo" />
                </Form.Item>
                <Form.Item name={"version"} label="Version" rules={[{ required: true, message: 'Please input version!' }]}>
                    <Input ></Input>
                </Form.Item>
                <Form.Item label="Update Info" name="update_info">
                    <TextArea placeholder="Update Info" />
                </Form.Item>
                <Form.Item label="Force" name="force" initialValue={true} >
                    <Switch size="small" checkedChildren="Force" unCheckedChildren="Force" />
                </Form.Item>
            </Form>
        </Flex>


    </Card>
}

export default PublishToolsV2