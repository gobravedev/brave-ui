import { FC, useEffect } from "react"
import { Form, Input, Modal } from "antd"
import { updateAnalysisResultApi } from "@/api/analysis-result"
import axios from "axios"

const AnalysisResultEdit: FC<any> = ({ visible, onClose, params, callback }) => {
    if (!visible) return null
    const [form] = Form.useForm()

    const loadData = async () => {
        const res = await axios(`/analysis-result/find-by-id/${params?.analysis_result_id}`)
        form.setFieldsValue(res.data)
    }
    useEffect(() => {
        if(params?.analysis_result_id){
            loadData()
        }
    }, [params?.analysis_result_id])

    const updateAnalysisResult = async () => {
        const values = await form.validateFields()
        const req = {
            ...values,
            id: params.id
        }
        console.log(req)
        const res = await updateAnalysisResultApi(params?.analysis_result_id, req)
        console.log(res)
        callback && callback()
        onClose()
    }

    return <Modal title="Edit Analsyis Result"
        open={visible} onClose={onClose}
        onCancel={onClose}
        onOk={updateAnalysisResult}
    >
        <Form form={form}>
            <Form.Item label="File Name" name="file_name">
                <Input />
            </Form.Item>
            {/* <Form.Item label="Sample Source" name="sample_source">
                <Input />
            </Form.Item> */}
        </Form>
    </Modal>
}

export default AnalysisResultEdit