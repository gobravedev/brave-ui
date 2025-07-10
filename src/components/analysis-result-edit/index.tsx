import { FC, useEffect } from "react"
import { Form, Input, Modal } from "antd"
import { updateAnalysisResultApi } from "@/api/analysis-result"

const AnalysisResultEdit: FC<any> = ({ visible, onClose, params }) => {
    if (!visible) return null
    const [form] = Form.useForm()
    const {callback} = params
    const updateAnalysisResult = async () => {
        const values = await form.validateFields()
        const req ={
            ...values,
            id:params.id
        }
        console.log(req)
       const res = await updateAnalysisResultApi(req)
       console.log(res)
       callback && callback()
       onClose()
    }
    useEffect(() => {
        form.setFieldsValue(params)
    }, [JSON.stringify(params)])
    return <Modal title="分析结果编辑"
        open={visible} onClose={onClose}
        onCancel={onClose}
        onOk={updateAnalysisResult}
        >
      <Form form={form}>
        <Form.Item label="分析Key" name="analysis_key" initialValue={params.analysis_key}>
            <Input />
        </Form.Item>
      </Form>
    </Modal>
}

export default AnalysisResultEdit