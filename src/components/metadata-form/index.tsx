import { FC, useEffect } from "react"
import { Collapse, Form, Input, message, Modal, Typography } from "antd"
import { addSampleMetadataApi, findSampleMetadataByIdApi, updateSampleMetadataApi } from "@/api/sample-metadata"
import { useOutletContext } from "react-router"
const Textarea = Input.TextArea
const MetadataForm: FC<any> = ({ visible, onClose, params }: any) => {
    if (!visible) return null
    const [form] = Form.useForm()
    const { callback } = params
    const { messageApi } = useOutletContext<any>()
    const { project, projectObj } = useOutletContext<any>()

    const getRequestParams = (values: any) => {
        const metadata = values.metadata
        delete values.metadata
        return {
            ...values,
            sample_id: params.sample_id,
            project: project,
            analysis_result_id: params.analysis_result_id,
            metadata: JSON.stringify(metadata)
        }
    }
    const findSampleMetadataById = async () => {
        const resp = await findSampleMetadataByIdApi(params.sample_id)
        form.setFieldsValue(resp.data)
    }
    useEffect(() => {
        if (params.sample_id) {
            findSampleMetadataById()
        }
    }, [params?.sample_id])
    const addOrUpdateSampleMetadata = async () => {
        const values = await form.validateFields()
        const params = getRequestParams(values)
        // console.log(params)
        if (params.sample_id) {
            const resp = await updateSampleMetadataApi(params)
            messageApi.success("update successfully")
        } else {
            const resp = await addSampleMetadataApi(params)
            messageApi.success("add successfully")
        }
        callback?.()
        onClose()
    }
    return <Modal
        onOk={addOrUpdateSampleMetadata}
        open={visible}
        onClose={onClose}
        onCancel={onClose}
        title={`${params.sample_id ? "Edit" : "Add "} Metadata`}>
        {/* {JSON.stringify(params)} */}
        {/* {JSON.stringify(projectObj)} */}
        <Form form={form}>
            <Form.Item label="Sample Name" name="sample_name" >
                <Input />
            </Form.Item>
            {/* <Form.Item label="样本分组" name="sample_group" >
                <Input />
            </Form.Item> */}
            {projectObj?.metadata_form && Array.isArray(projectObj?.metadata_form) && (
                projectObj?.metadata_form?.map((item: any) => {
                    return <Form.Item key={item.name} label={item.label} name={["metadata", item.name]} >
                        <Input />
                    </Form.Item>
                })
            )}
            {/* <Form.Item label="样本分组名称" name="sample_group_name" >
                <Input />
            </Form.Item> */}
            {/* <Form.Item label="其它样本信息" name="metadata" >
                <Textarea rows={4} />
            </Form.Item> */}
            <Collapse ghost items={[
                {
                    key: "1",
                    label: "More",
                    children: <>
                        <Form.Item noStyle shouldUpdate>
                            {() => (
                                <Typography>
                                    <pre>{JSON.stringify(getRequestParams(form.getFieldsValue()), null, 2)}</pre>
                                </Typography>
                            )}
                        </Form.Item>
                    </>
                }
            ]} />
        </Form>

    </Modal>
}

export default MetadataForm