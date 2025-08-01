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
const ImportFile: FC<{ component_type: any, component_id: any,component_name:any,inputForm:any,inputFormMap:any, operatePipeline: any, name: any, callback: any }> = ({
    component_type, component_id,component_name, inputForm,operatePipeline, name, callback }) => {
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

    const [selectedField, setSelectedField] = useState<any>()
    const [columns, setColumns] = useState<any>()
    const columnRef = useRef<any>(null)

    useEffect(()=>{
        if(inputForm){
            const columns =inputForm.map((item:any)=>{
                
                if(Array.isArray(item.name)){
                    return item.name[1]
                }else{
                    return item.name
                }
            })
            let columnsObj = columns.map((item:any)=>({
                title: item,
                dataIndex: item,
                key: item,
                render: (text: any) => <span>{text}</span>
            }))
            columnsObj =[{
                title: "样本名称",
                dataIndex: "sample_name",
                key: "sample_name",
                render: (text: any) => <span>{text}</span>
            },...columnsObj]
            console.log(columnsObj)
            columnRef.current = columnsObj
            setColumns(columnsObj)
        }
    },[inputForm])
    // useEffect(() => {
    //     // setInputForm([])
    //     // setParseData(undefined)
    //     if (component_id) {
    //         findByComponentId(component_id)
    //     }
    // }, [component_id])
    // const [operatureUrl, setOperatureUrl] = useState<any>()
    // const listPipelineComponents = async () => {
    //     const resp = await listPipelineComponentsApi({
    //         component_type: "file"
    //     })
    //     const dataMap = (resp.data || []).reduce((acc: any, item: any) => {
    //         acc[item.component_id] = JSON.parse(item.content)
    //         return acc
    //     }, {})
    //     setDataMap(dataMap)
    //     const data = resp.data.map((item: any) => {
    //         const content = JSON.parse(item.content)
    //         return {
    //             label: `${content.label}(${content.name})(${item.component_id})`,
    //             value: item.component_id
    //         }

    //     })
    //     setComponents(data)
    //     console.log(resp)
    // }

    // const findByComponentId = async (componentId: any) => {
    //     const resp = await axios.get(`/find-by-component-id/${componentId}`)
    //     console.log(resp)
    //     const data = JSON.parse(resp.data.content)
    //     if (data.inputForm) {
    //         setInputForm(data.inputForm)
    //         setInputFormMap(data.inputForm.reduce((acc: any, item: any) => {
    //             acc[item.label] = item.name
    //             return acc
    //         }, {}))
    //     }

    // }
  
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
        if (values.length ==0){
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

    const renderTable = () => {
        // if (!Array.isArray(parseData)) return null;

        // if (parseData.length === 0) {
        //     return <Empty description="没有解析数据" />;
        // }

        // const columns = Object.entries(parseData[0]).map(([key, value]) => ({
        //     title: key,
        //     dataIndex: key,
        //     key: key,
        //     render: (text: any) => <span>{text}</span>
        // }))

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

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const text = event.clipboardData?.getData('Text') || '';
            if (!text) return;

            const delimiter = text.includes('\t') ? '\t' : ',';
            const rows = text.split(/\r?\n/).filter(line => line.trim() !== '');
            const data = rows.map(row => row.split(delimiter).map(cell => cell.trim()));
            console.log(data)
            // console.log(columnRef.current)
            const converted = data.map((row:any) => {
               
                const obj: Record<string, string> = {};
                columnRef.current.forEach((col:any, index:any) => {
                    if (row.length<= index){
                        obj[col.dataIndex] = "unknown"

                    }else{
                        obj[col.dataIndex] = row[index];

                    }
                });
                return obj;
              });
              
            setParseData(converted);
            messageApi.success('粘贴成功！');
        };

        document.addEventListener('paste', handlePaste);
        return () =>{
            document.removeEventListener('paste', handlePaste);
}
    }, []);
    
    useEffect(() => {
        // listPipelineComponents()
    }, [])
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
            <pre>
                {/* {JSON.stringify(pipeline.items,null,2)} */}
            </pre>
            {/* {JSON.stringify(setting)} */}
            {/* {JSON.stringify(selectedField)}
                {JSON.stringify(inputFormMap)} */}
 {/* {JSON.stringify(columns)} */}
       

            {/* <Form.Item label="字段选择">
                <Select style={{ width: "5rem" }} value={selectedField} onChange={(value) => setSelectedField(value)} options={Object.entries(inputFormMap).map(([key, value]) => ({
                    label: key,
                    value: key
                }))}></Select>
            </Form.Item> */}

            <Form form={form}>
                {/* <Form.Item name={"component_id"} label="组件" rules={[{ required: true, message: "请选择组件" }]} >
                    <Select options={components} allowClear showSearch></Select>
                </Form.Item> */}

                {inputForm ?
                    <>
                        {/* {!parseData && <Form.Item name={"sample_name"} label="样本名称" rules={[{ required: false, message: "请输入分析key" }]} >
                            <Input placeholder="样本名称, 与sample_key关联" allowClear></Input>
                        </Form.Item>} */}
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
                {renderTable()}
             
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
                {/* <Form.Item name={"pattern"} label="匹配模式" rules={[{required:true,message:"请输入匹配模式"}]}    >
                    <Input></Input>
                </Form.Item> */}
                {/* <Form.Item name={"suffix"} label="后缀" rules={[{required:true,message:"请输入后缀"}]} >
                    <Input></Input>
                </Form.Item> */}
                {/* <Form.Item name={"content"} >
                    <TextArea rows={10}></TextArea>
                </Form.Item> */}
            </Form>


            {/* <PasteTable></PasteTable> */}
            {/* <div style={{marginTop:"1rem"}}></div> */}
            {/* <FileBrowser path={setting.DATA_DIR} onSelectFile={(file: any) => {
                if (selectedField) {
                    // console.log(file)
                    // console.log(inputFormMap[selectedField])
                    // form.setFieldValue(inputFormMap[selectedField], file.path)
                } else {
                    messageApi.error("请先选择字段")
                }
            }}></FileBrowser> */}


            {/* {JSON.stringify(Object.entries(parseData[0]).map(([key, value]) => ({
                title: key,
                dataIndex: key,
                key: key,
                render: (text: any) => <span>{text}</span>
            })))} */}
            {/* <ReactMarkdown children={markdown} remarkPlugins={[remarkGfm, remarkMath]}></ReactMarkdown> */}

        </Card>
    </>
}

export default ImportFile