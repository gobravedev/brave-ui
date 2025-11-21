import { FC, useEffect } from "react"
import { Collapse, Form, Input, message, Modal, Typography } from "antd"
import { addProjectApi, updateProjectApi, findProjectByIdApi, listProjectApi, deleteProjectApi } from "@/api/project"
import { useOutletContext } from "react-router"
import TextArea from "antd/es/input/TextArea"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
import axios from "axios"
import { setUserItem } from "@/store/userSlice"
import { useDispatch } from "react-redux"
import { MonacoEditor } from "../react-monaco-editor"
const Textarea = Input.TextArea
const FormProject: FC<any> = ({ visible, onClose, params, callback, research = false }: any) => {
    const [form] = Form.useForm()
    const message = useGlobalMessage();
    const dispatch = useDispatch()

    useEffect(() => {
        console.log(params)
        if (params?.project_id) {
            findProjectById()
        } else {
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
        const data = resp.data
        data.metadata_form = JSON.stringify(data.metadata_form)
        form.setFieldsValue(data)
    }
    // const loadProject = async () => {
    //     if (!project_id) return;

    // }

    const addOrUpdateProject = async () => {
        const values = await form.validateFields()
        const params = getRequestParams(values)
        // console.log(params)
        if (params.project_id) {
            const resp = await updateProjectApi(params)
            message.success("更新成功")
            callback?.(params.project_id)
        } else {
            const resp = await addProjectApi(params)
            console.log(resp.data.project_id)
            message.success("添加成功")
            callback?.(resp.data.project_id)
        }
        const resp = await axios.get(`/project/find-by-project-id/${params.project_id}`)
        // setProjectObj(resp.data)
        dispatch(setUserItem({ projectObj: resp.data }))
        onClose()
        if (callback) {
            callback()
        }

    }
    return <Modal
        onOk={addOrUpdateProject}
        open={visible}
        onClose={onClose}
        onCancel={onClose}
        width={`${research ? "60%" : "40%"}`}
        title={`${params?.project_id ? "Edit" : "New"} Project`}>
        {/* {JSON.stringify(params)} */}
        <Form form={form}>
            {!research ? <>

                <Form.Item label="Project Name" name="project_name" rules={[{ required: true, message: 'This field cannot be empty!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item initialValue={"[{\"name\":\"group\",\"label\":\"group\"}]"} label="Metadata" name="metadata_form" rules={[{ required: true, message: 'This field cannot be empty!' }]}>
                    <TextArea rows={6} />
                </Form.Item>
                <Form.Item label="Parameter" name="parameter">
                    <TextArea rows={6} />
                </Form.Item>
                <Form.Item label="Research" name="research">
                    <TextArea rows={6} />
                </Form.Item>
                <Form.Item label="Description" name="description">
                    <TextArea rows={6} />
                </Form.Item>
            </> : <>

                <Form.Item name="description">
                    {/* <TextArea rows={6} /> */}
                    <MonacoEditor></MonacoEditor>
                </Form.Item>
                <Form.Item name="research">
                    <TextArea rows={6} />
                </Form.Item>
            </>}

            {/* <Form.Item label="样本分组名称" name="sample_group_name" >
                <Input />
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

export default FormProject

