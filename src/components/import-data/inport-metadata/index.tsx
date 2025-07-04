import { FC, useEffect, useState } from "react"
import TextArea from "antd/es/input/TextArea"
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { listPipelineComponents as listPipelineComponentsApi } from '@/api/pipeline'
import { Button, Card, Flex, Form, Select } from "antd"
import axios from "axios"

const markdown = `
|project|library_name|sample_name|sequencing_target|sequencing_technique|sample_composition|fastq1                                                 |fastq2                                                     |
|-------|------------|-----------|-----------------|--------------------|------------------|-------------------------------------------------------|-----------------------------------------------------------|
|test   |R250506-21  |OL-RNA-1   |RNA              |NGS                 |single_genome     |/V350344603_L03_117_1.fq.gz                            |/V350344603_L03_117_2.fq.gz                                |
|test      placeholder="input search text"
            allowClear
            onSearch={(value: any) => {
                const sampleData = data.filter((it: any) => it.sample_name.includes(value))
                setSampleData(sampleData)
            }}  |R250506-22  |OCF-RNA-1  |RNA              |NGS                 |single_genome     |/V350344603_L03_118_1.fq.gz                            |/V350344603_L03_118_2.fq.gz                                |
|test   |R250506-23  |OSP-RNA-1  |RNA              |NGS                 |single_genome     |/V350344603_L03_119_1.fq.gz                            |/V350344603_L03_119_2.fq.gz                                |

---
project,library_name,sample_name,sequencing_target,sequencing_technique,sample_composition,fastq1,fastq2

test,R250506-21,OL-RNA-1,RNA,NGS,single_genome,/V350344603_L03_117_1.fq.gz,/V350344603_L03_117_2.fq.gz

`
const ImportMetadata: FC<any> = ({ visible, onClose, params, callback }) => {
    const [form] = Form.useForm();
    const [components, setComponents] = useState<any>([])

    // const [operatureUrl, setOperatureUrl] = useState<any>()
    const listPipelineComponents = async () => {
        const resp = await listPipelineComponentsApi({
            component_type: "file"
        })
        const data = resp.data.map((item: any) => {
            const content = JSON.parse(item.content)
            return {
                label: `${content.label}(${content.name})`,
                value: item.component_id
            }

        })
        setComponents(data)
        console.log(resp)
    }
    useEffect(() => {
        listPipelineComponents()
    }, [])
    return <>
        <Card
            title={`操作样本(${params.operatureUrl})`}
            extra={<Flex>
                <Button onClick={async () => {
                    const values = await form.validateFields()
                    // console.log(values)
                    const resp: any = await axios.post(`/fast-api/${params.operatureUrl}`, values)
                    console.log(resp)
                }}>确认</Button>
                <Button onClick={onClose}>关闭</Button>
            </Flex>}

        >
            <Form form={form}>
                <Form.Item name={"component_id"} label="组件">
                    <Select options={components}></Select>
                </Form.Item>
                <Form.Item name={"content"} >
                    <TextArea rows={10}></TextArea>
                </Form.Item>
            </Form>
            <ReactMarkdown children={markdown} remarkPlugins={[remarkGfm, remarkMath]}></ReactMarkdown>

        </Card>
    </>
}

export default ImportMetadata