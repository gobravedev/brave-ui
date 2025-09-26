import { FC, useEffect, useRef, useState } from "react"
import TextArea from "antd/es/input/TextArea"
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { Button, Card, Collapse, Empty, Flex, Form, Input, Select, Table, Typography } from "antd"
import axios from "axios"
import FormJsonComp from "@/components/form-components"
import { useOutletContext } from "react-router"
import FileBrowser from "@/components/file-browser"
import { useSelector } from "react-redux"
import PasteTable from "@/components/paste-table"
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

const RenderTable: FC<any> = ({ parseData, columns, importData }) => {


    return <Table
        size="small"
        bordered
        pagination={false}
        footer={() => (
            <div style={{ textAlign: 'right' }}>
                一共{parseData.length}条记录 &nbsp;&nbsp;
                <Button size="small" color="cyan" variant="solid" onClick={importData}>确认</Button>
            </div>
        )} columns={columns} dataSource={parseData} />;
};


const ImportFile: FC<{ component_type: any, component_id: any, component_name: any, inputForm: any, inputFormMap: any, operatePipeline: any, name: any, callback: any }> = ({
    component_type, component_id, component_name, inputForm, operatePipeline, name, callback }) => {
    // const { component_type,component_id,operatePipeline } = pipeline
    const [form] = Form.useForm();
    // const [components, setComponents] = useState<any>([])
    console.log("-->ImportFile渲染")
    // const [dataMap, setDataMap] = useState<any>({})
    // const componentId = Form.useWatch(["component_id"], form)

    // const [inputForm, setInputForm] = useState<any>()
    const { messageApi, project } = useOutletContext<any>()
    const [parseData, setParseData] = useState<any>([])
    // const [selectedFile, setSelectedFile] = useState<any>()
    const setting = useSelector((state: any) => state.global.setting)
    // const [inputFormMap, setInputFormMap] = useState<any>({})

    const [columns, setColumns] = useState<any>()
    const columnRef = useRef<any>(null)

    useEffect(() => {
        if (inputForm) {
            const columns = inputForm.map((item: any) => {

                if (Array.isArray(item.name)) {
                    return item.name[1]
                } else {
                    return item.name
                }
            })
            let columnsObj = columns.map((item: any) => ({
                title: item,
                dataIndex: item,
                key: item,
                render: (text: any) => <span>{text}</span>
            }))
            columnsObj = [{
                title: "样本名称",
                dataIndex: "sample_name",
                key: "sample_name",
                render: (text: any) => <span>{text}</span>
            }, ...columnsObj, {
                title: "操作",
                dataIndex: "action",
                key: "action",
                ellipsis: true,
                render: (text: any, record: any) => {
                    return <Flex gap={"small"}>
                        <Button size="small" danger onClick={() => { deleteItem(record.sample_name) }}>删除</Button>
                    </Flex>
                }
            }]
            console.log(columnsObj)
            columnRef.current = columnsObj
            setColumns(columnsObj)
        }
    }, [inputForm])
    const deleteItem = (sampleName: any) => {
        setParseData((prev: any) =>
            prev.filter((item: any) => item.sample_name !== sampleName)
        );
    };

    const getRequestParams = (values: any) => {
        const { content, sample_name } = values
        if (parseData) {
            return parseData.map((item: any) => {
                const { sample_name, ...rest } = item
                return {
                    ...values,
                    project: project,
                    component_id: component_id,
                    content: JSON.stringify(rest),
                    sample_name: sample_name,
                }
            })
        } else {
            return [{
                ...values,
                project: project,
                component_id: component_id,
                content: JSON.stringify(content),
                sample_name: sample_name,
            }]
        }
    }


    const importData = async () => {
        const values = await form.validateFields()
        if (values.length == 0) {
            messageApi.error("没有数据添加!")
            return
        }
        if (inputForm && inputForm.length == 0) {
            messageApi.error("该组件没有配置inputForm!")
            return
        }
        const requestParams = getRequestParams(values)
        try {
            const resp = await axios.post(`/import-data`, requestParams)
            messageApi.success("导入成功")
            callback && callback()
        } catch (error: any) {
            messageApi.error(error.response.data.detail)
            // console.log()
        }


    }

    const parseImportData = async () => {
        const values = await form.validateFields()
        if (inputForm && inputForm.length == 0) {
            messageApi.error("该组件没有配置inputForm!")
            return
        }
        // const requestParams = getRequestParams(values)
        const resp = await axios.post(`/parse-import-data`,
            { content: JSON.stringify(values.content) })
        console.log(resp)
        setParseData(resp.data)
    }

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const text = event.clipboardData?.getData('Text') || '';
            if (!text) return;

            const delimiter = text.includes('\t') ? '\t' : ',';
            const rows = text.split(/\r?\n/).filter(line => line.trim() !== '');
            const data = rows.map(row => row.split(delimiter).map(cell => cell.trim()));
            console.log(data)
            // console.log(columnRef.current)
            const converted = data.map((row: any) => {

                const obj: Record<string, string> = {};
                columnRef.current.forEach((col: any, index: any) => {
                    if (row.length <= index) {
                        obj[col.dataIndex] = "unknown"

                    } else {
                        obj[col.dataIndex] = row[index];

                    }
                });
                return obj;
            });

            setParseData(converted);
            messageApi.success('粘贴成功！');
        };

        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        }
    }, []);


    return <>
        <Card
            title={`${component_name}(${component_id})`}
            extra={<Flex gap={"small"} >
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    operatePipeline.openModal("modalC", {
                        data: { component_id }, structure: {
                            component_type: component_type,
                        }
                    })
                }}>编辑inputForm</Button>
                <Button size="small" color="cyan" variant="solid" disabled={!parseData} onClick={() => setParseData([])}>清空</Button>

                <Button size="small" color="cyan" variant="solid" disabled={!inputForm} onClick={parseImportData}>解析</Button>
            </Flex>}

        >
            {/* <pre>
                {JSON.stringify(parseData, null, 2)}
            </pre> */}

            <Form form={form}>
                {/* 同一个样本测序不同部位 */}
                <Form.Item name={"sample_source"} label="样本来源">
                    <Input>
                    </Input>
                </Form.Item>

                {inputForm ?
                    <>

                        <FormJsonComp formJson={inputForm} dataMap={{}} ></FormJsonComp>
                    </>
                    :
                    <>
                        <Empty

                            description="该组件没有配置inputForm!"
                        >

                            <Button color="cyan" variant="solid" onClick={() => {
                                operatePipeline.openModal("modalC", {
                                    data: { component_id }, structure: {
                                        component_type: component_type,
                                    }
                                })
                            }}>配置inputForm</Button>
                        </Empty>
                    </>
                }
                <RenderTable parseData={parseData} columns={columns} importData={importData}></RenderTable>
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


        </Card>
    </>
}

export default ImportFile