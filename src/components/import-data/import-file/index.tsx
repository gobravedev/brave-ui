import { FC, useEffect, useRef, useState } from "react"
import TextArea from "antd/es/input/TextArea"
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { Button, Card, Collapse, Empty, Flex, Form, Input, Select, Switch, Table, Typography } from "antd"
import axios from "axios"
import FormJsonComp from "@/components/form-components"
import { useOutletContext } from "react-router"
import FileBrowser from "@/components/file-browser"
import { useSelector } from "react-redux"
import PasteTable from "@/components/paste-table"
import { fa } from "@faker-js/faker"
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
                A total of {parseData.length} records &nbsp;&nbsp;
                <Button size="small" color="cyan" variant="solid" onClick={importData}>Ok</Button>
            </div>
        )} columns={columns} dataSource={parseData} />;
};


const ImportFile: FC<{ component_type: any, component_id: any, component_name: any, inputForm: any, inputFormMap: any, operatePipeline: any, name: any, callback: any, file_type?: any }> = ({
    component_type, component_id, component_name, inputForm, operatePipeline, name, file_type, callback }) => {
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
    const [isParseMode, setIsParseMode] = useState<boolean>(false)
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
                title: "Sample Name",
                dataIndex: "sample_name",
                key: "sample_name",
                render: (text: any) => <span>{text}</span>
            }, ...columnsObj, {
                title: "Action",
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
        const { content, sample_name, file_name } = values
        if (isParseMode) {
            return parseData.map((item: any) => {
                const { sample_name, ...rest } = item
                return {
                    ...values,
                    project: project,
                    component_id: component_id,
                    file_type: file_type,
                    content: JSON.stringify(rest),
                    sample_name: sample_name,
                }
            })
        } else {
            return [{
                ...values,
                project: project,
                component_id: component_id,
                file_name: file_name,
                file_type: file_type,
                content: (file_type && file_type == "collected") ? content : JSON.stringify(content),
                sample_name: sample_name,
            }]
        }
    }


    const importData = async () => {
        const values = await form.validateFields()
        if (values.length == 0) {
            messageApi.error("No data added!")
            return
        }
        if (inputForm && inputForm.length == 0) {
            messageApi.error("This component does not have inputForm configured!")
            return
        }
        const requestParams = getRequestParams(values)
        try {
            const resp = await axios.post(`/import-data`, requestParams)
            messageApi.success("Imported successfully!")
            callback && callback()
        } catch (error: any) {
            messageApi.error(error.response.data.detail)
            // console.log()
        }


    }

    const parseImportData = async () => {
        const values = await form.validateFields()
        if (inputForm && inputForm.length == 0) {
            messageApi.error("This component does not have inputForm configured!")
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
            messageApi.success('Paste successful!');
        };

        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        }
    }, []);


    return <>
        <Card
            variant="borderless"
            size="small"
            style={{
                boxShadow: 'none',
            }}
            title={`${component_name}(${component_id})`}
            extra={<Flex gap={"small"} >
                <Switch value={isParseMode} onChange={(val) => setIsParseMode(val)}></Switch>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    operatePipeline.openModal("modalC", {
                        data: { component_id }, structure: {
                            component_type: component_type,
                        }
                    })
                }}>Edit InputForm</Button>
                <Button size="small" color="cyan" variant="solid" disabled={!parseData} onClick={() => setParseData([])}>Clear</Button>

                <Button size="small" color="cyan" variant="solid" disabled={!inputForm} onClick={parseImportData}>Parse</Button>
            </Flex>}

        >
            {/* <pre>
                {JSON.stringify(parseData, null, 2)}
            </pre> */}

            <Form form={form}>
                {/* 同一个样本测序不同部位 */}
                {/* <Form.Item name={"sample_source"} label="Sample Source" rules={[{ required: true, message: 'This field cannot be empty!' }]}>
                    <Input placeholder="gut,brain...">
                    </Input>
                </Form.Item> */}
                
                {!isParseMode &&
                    <>
                        {(file_type && file_type == "collected") ?
                            <Form.Item name={"file_name"} label="File Name" rules={[{ required: true, message: 'This field cannot be empty!' }]}>
                                <Input >
                                </Input>
                            </Form.Item>
                            :

                            <Form.Item name={"sample_name"} label="Sample Name" rules={[{ required: true, message: 'This field cannot be empty!' }]}>
                                <Input >
                                </Input>
                            </Form.Item>
                        }

                    </>
                }


                {inputForm ?
                    <>

                        <FormJsonComp formJson={inputForm} dataMap={{}} ></FormJsonComp>
                    </>
                    :
                    <>
                        <Empty

                            description="This component does not have inputForm configured!"
                        >

                            <Button color="cyan" variant="solid" onClick={() => {
                                operatePipeline.openModal("modalC", {
                                    data: { component_id }, structure: {
                                        component_type: component_type,
                                    }
                                })
                            }}>Config InputForm</Button>
                        </Empty>
                    </>
                }
                {isParseMode && <RenderTable parseData={parseData} columns={columns} importData={importData} ></RenderTable>}

                {!isParseMode && <Button size="small" color="cyan" variant="solid" onClick={importData}>Ok</Button>}
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


        </Card>
    </>
}

export default ImportFile