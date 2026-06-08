import { updateProjectReportApi } from "@/api/project";
import { useGlobalMessage } from "@/hooks/useGlobalMessage";
import { Button, Collapse, Flex, Form, Typography } from "antd";
import { FC, useEffect } from "react";
import { MonacoEditor } from "../react-monaco-editor";

const AnalysisDocEditor: FC<any> = ({ report, onSaved }) => {
  const [form] = Form.useForm()
  const message = useGlobalMessage();

  useEffect(() => {
    form.setFieldsValue({ content: report?.content || "" })
  }, [form, report?.content])

  const addOrUpdateProject = async () => {
    if (!report?.id || !report?.project_id) {
      message.error("Please select report item first")
      return
    }

    const values = await form.validateFields()
    await updateProjectReportApi({
      id: report.id,
      project_id: report.project_id,
      title: report.title,
      sort_order: report.sort_order,
      content: values.content || "",
    })
    message.success("更新成功")
    onSaved?.()

  }
  return <div>
    {/* {JSON.stringify(params)} */}
    <Flex gap={"small"} justify={"end"} style={{ margin:"0.5rem 0"}}>
      <Button onClick={addOrUpdateProject} size="small" >Save</Button>
    </Flex>
    <Form form={form}>

      <Form.Item name="content">
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
                  <pre>{JSON.stringify({
                    id: report?.id,
                    project_id: report?.project_id,
                    title: report?.title,
                    sort_order: report?.sort_order,
                    content: form.getFieldValue("content"),
                  }, null, 2)}</pre>
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