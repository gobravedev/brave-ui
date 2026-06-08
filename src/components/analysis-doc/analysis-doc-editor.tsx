import { addProjectApi, findProjectByIdApi, updateProjectApi } from "@/api/project";
import { useGlobalMessage } from "@/hooks/useGlobalMessage";
import { setUserItem } from "@/store/userSlice";
import { Button, Collapse, Flex, Form, Input, Typography } from "antd";
import axios from "axios";
import { FC, useEffect } from "react";
import { useDispatch } from "react-redux";
import { MonacoEditor } from "../react-monaco-editor";
import TextArea from "antd/es/input/TextArea";

const AnalysisDocEditor: FC<any> = ({ project_id }) => {
  const [form] = Form.useForm()
  const message = useGlobalMessage();
  const dispatch = useDispatch()

  useEffect(() => {
    if (project_id) {
      findProjectById()
    }
  }, [project_id])


  const getRequestParams = (values: any) => {
    return {
      ...values,
      project_id: project_id

    }
  }
  const findProjectById = async () => {
    const resp = await findProjectByIdApi(project_id)
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
      // callback?.(params.project_id)
    } else {
      const resp = await addProjectApi(params)
      console.log(resp.data.project_id)
      message.success("添加成功")
      // callback?.(resp.data.project_id)
    }
    const resp = await axios.get(`/project/find-by-project-id/${params.project_id}`)
    // setProjectObj(resp.data)
    dispatch(setUserItem({ projectObj: resp.data }))
    // onClose()
    // if (callback) {
    //     callback()
    // }

  }
  return <div>
    {/* {JSON.stringify(params)} */}
    <Flex gap={"small"} justify={"end"} style={{ margin:"0.5rem 0"}}>
      <Button onClick={addOrUpdateProject} size="small" >Save</Button>
    </Flex>
    <Form form={form}>

      <Form.Item name="description">
        {/* <TextArea rows={6} /> */}
        <MonacoEditor></MonacoEditor>
      </Form.Item>
      {/* <Form.Item name="research">
        <TextArea rows={6} />
      </Form.Item> */}


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

  </div>
}

export default AnalysisDocEditor;