import { FC, useEffect } from "react"
import { Collapse, Form, Input, message, Modal, Typography } from "antd"
import { addProjectApi, updateProjectApi, findProjectByIdApi, listProjectApi, deleteProjectApi } from "@/api/project"
import { useOutletContext } from "react-router"
import TextArea from "antd/es/input/TextArea"
const   Textarea = Input.TextArea
const FormProject: FC<any> = ({ visible, onClose, params,messageApi,callback}: any) => {
    const [form] = Form.useForm()
    useEffect(() => {
        console.log(params)
        if (params?.project_id) {
            findProjectById()
        }else{
            form.resetFields()
        }
    }, [params?.project_id])

    if (!visible) return null

    const getRequestParams = (values: any) => {
        return {
            ...values,
            project_id: params?.project_id

        }
    }
    const findProjectById = async () => {
        const resp = await findProjectByIdApi(params.project_id)
        console.log(resp.data)
        form.setFieldsValue(resp.data)
    }

    const addOrUpdateProject = async () => {
        const values = await form.validateFields()
        const params = getRequestParams(values)
        // console.log(params)
        if (params.project_id) {
            const resp = await updateProjectApi(params)
            messageApi.success("更新成功")
            callback?.(params.project_id)
        } else {
            const resp = await addProjectApi(params)
            console.log(resp.data.project_id)
            messageApi.success("添加成功")
            callback?.(resp.data.project_id)
        }
        onClose()
        
    }
    return <Modal
        onOk={addOrUpdateProject}
        open={visible}
        onClose={onClose}
        onCancel={onClose}
        title={`${params?.project_id ? "编辑" : "添加"}项目`}>
        {/* {JSON.stringify(params)} */}
        <Form form={form}>
            <Form.Item label="项目名称" name="project_name" >
                <Input />
            </Form.Item>
            <Form.Item label="研究变量" name="metadata_form" >
                <TextArea rows={6} />
            </Form.Item>
            {/* <Form.Item label="样本分组名称" name="sample_group_name" >
                <Input />
            </Form.Item> */}
       
            <Collapse ghost items={[
                {
                    key: "1",
                    label: "更多",
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

export default FormProject