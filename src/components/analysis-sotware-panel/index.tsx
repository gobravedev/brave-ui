import { FC, memo, useEffect, useMemo, useRef, useState } from "react"
import axios from "axios"
import { Button, Col, Drawer, Input, Row, Space, Table, TableProps, Image, Form, Select, Spin, Modal, Tabs, Typography, message, Empty, Collapse, Card, Popover, Flex, Popconfirm, Tooltip } from "antd"
import { useOutletContext, useParams } from "react-router"
import ResultList from '@/components/result-list'
// import AnalysisForm from "../analysis-form"
import SampleAnalysisResult from '../sample-analysis-result'
import React from "react"

import FormJsonComp from "../form-components"
import AnalysisList from '../analysis-list'
import AnalysisResultView from '../analysis-result-view'
import { GroupSelectSampleButton, BaseSelect } from '@/components/form-components'
import AnalysisForm from '../analysis-form'
import PipelineMonitor from '@/components/pipeline-monitor'
import { listAnalysisFiles } from '@/api/analysis-software'
import { useSelector } from "react-redux"
import BioDatabaseForm from "@/components/bio-database-form"
import { CloseCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import SortTable from "@/components/sort-table"
import Markdown from "../markdown"
import Item from "antd/es/list/Item"
type AnalysisFile = {
    name: string,
    label: string
}
type AnalysisSoftware = {
    inputFile?: AnalysisFile[],
    outputFile?: any[],
    relation_id?: any,
    pipeline?: any,
    pipeline_id?: any,
    component_id?: any,
    parseAnalysisModule?: any,
    parseAnalysisResultModule?: any,
    databases?: any,
    software?: any,

    wrapAnalysisPipeline?: any,
    analysisPipline?: any,
    inputAnalysisMethod?: any,
    analysisMethod?: any,
    appendSampleColumns?: any,
    analysisType?: any,
    children?: any,
    cardExtra?: any,
    upstreamFormJson?: any,
    downstreamAnalysis?: any,
    operatePipeline?: any,
    label?: any,
    hiddenUpstreamAnalysis?: boolean
    component_type?: string
    description?: string
}

const AnalysisSoftwarePanel: FC<AnalysisSoftware> = ({
    inputFile,
    outputFile,
    pipeline,
    wrapAnalysisPipeline,
    analysisPipline,
    inputAnalysisMethod,
    analysisMethod,
    appendSampleColumns,
    analysisType = "nonSample",
    children,
    cardExtra,
    upstreamFormJson,
    downstreamAnalysis,
    operatePipeline,
    ...rest }) => {
    const { project } = useOutletContext<any>()

    // const getAnalsyisFiles = async () => {
    //     const analysisFileType: any = []
    //     analysisFileType.push({
    //         type: "input",
    //         names: inputFile.map(item => item.name)
    //     })
    //     analysisFileType.push({
    //         type: "output",
    //         names: outputFile.map(item => item.name)
    //     })
    //     console.log(analysisFileType)

    //     const typeMap: any = {};
    //     analysisFileType.forEach(({ names, ...rest }: any) => {
    //         names.forEach((value: any) => {
    //             typeMap[value] = rest;
    //         });
    //     });

    //     const analysisFileNames = analysisFileType.flatMap((it: any) => it.names)
    //     const data = await listAnalysisFiles({ project: project, analysisFileNames: analysisFileNames })
    //     const groupedData = data.reduce((acc: any, item: any) => {
    //         const analysisFileName = item.analysis_method;
    //         const key = typeMap[analysisFileName].type
    //         // if (!acc[key]) {
    //         //     acc[key] = [];
    //         // }
    //         if (!acc[key][analysisFileName]) {
    //             acc[key][analysisFileName] = [];
    //         }
    //         const { sample_key, id, sample_group, ...rest } = item
    //         // debugger

    //         acc[key][analysisFileName].push({
    //             label: sample_key,
    //             value: id,
    //             sample_group: sample_group ? sample_group : "no_group",
    //             sample_key: sample_key,
    //             id: id,
    //             ...rest
    //         });
    //         return acc;
    //     }, { input: {}, output: {} });
    //     console.log(groupedData)
    //     console.log(typeMap)

    // }

    useEffect(() => {
        // getAnalsyisFiles()
    }, [])

    const tableRef = useRef<any>(null)
    const [record, setRecord] = useState<any>()
    // inputAnalysisMethod = [
    //     {
    //         key: "ran_seq_reads",
    //         name: "RNA测序",
    //         value: ["V1_single_genome_NGS_RNA"],
    //         mode:"multiple"
    //     }, {
    //         key: "assembly",
    //         name: "组装基因组",
    //         value: ["ngs-individual-assembly", "tgs_individual_assembly"],
    //         mode:"single"

    //     }
    // ]
    // analysisMethod = [
    //     {
    //         key: "abc",
    //         name: "V1_single_genome_NGS_RNA_name",
    //         value: ["V1_single_genome_NGS_RNA"],
    //         mode:"multiple"
    //     }
    // ]
    const checkAvailable = (analysisMethod: any) => {
        return analysisMethod && Array.isArray(analysisMethod) && analysisMethod.length > 0
    }
    return <>

        <Row>
            <Col lg={24} sm={24} xs={24}>
                {/* <AnalysisForm form={form}></AnalysisForm>                 */}
                {/* <Button onClick={getCompareAbundance}>提交</Button> */}
                {/* <Abundance /> */}
                {/* {analysisName && <SampleAnalysisResult analysisName={analysisName} shouldTrigger={true} setSampleResult={(data: any) => {
                    setSampleResult(data)
                }}></SampleAnalysisResult>} */}
                {/* {JSON.stringify(pipeline)}

                <hr />
                {JSON.stringify(rest)} */}



                {/* {JSON.stringify(inputFile)}
                <hr />
                {JSON.stringify(outputFile)} */}
                {/* {import.meta.env.MODE == "development" && <>
                    <ul>
                        <li>pipeline:{pipeline?.component_id}</li>
                        <li>software:{rest.component_id}</li>
                    </ul>
                </>} */}


                <Card size="small" style={{ marginBottom: "1rem" }}>
                    <Flex gap="small" style={{ marginBottom: "1rem", flexWrap: "wrap" }}>

                        {pipeline &&
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                operatePipeline.openModal("modalC", {
                                    data: undefined, structure: {
                                        component_type: "software",
                                        relation_type: "pipeline_software",
                                        parent_component_id: pipeline.component_id,
                                        // pipeline_id: pipeline.component_id
                                    }
                                })
                            }}>新增软件</Button>
                        }
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            operatePipeline.openModal("modalC", {
                                data: rest, structure: {
                                    component_type: "software",
                                }
                            })
                        }}>更新软件</Button>

                        {pipeline &&

                            <>
                                <Button size="small" color="cyan" variant="solid" onClick={() => {
                                    operatePipeline.openModal("modalA", {
                                        data: undefined, pipelineStructure: {
                                            relation_type: "pipeline_software",
                                            parent_component_id: pipeline.component_id,
                                            // pipeline_id: pipeline.component_id

                                        }
                                    })
                                }}>添加软件</Button>
                                <Button size="small" color="cyan" variant="solid" onClick={() => {
                                    operatePipeline.openModal("modalA", {
                                        data: rest,
                                        pipelineStructure: {
                                            relation_type: "pipeline_software",
                                            // pipeline_id: pipeline.component_id,

                                        }
                                    })
                                }}>替换软件</Button>
                                <Popconfirm title="是否移除文件?" onConfirm={() => {
                                    operatePipeline.deletePipelineRelation(rest.relation_id)
                                }}>
                                    <Button size="small" color="cyan" variant="solid" >移除软件</Button>
                                </Popconfirm>
                            </>

                        }
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            operatePipeline.openModal("modalB", {
                                module_type: "nextflow",
                                file_type: "nf",
                                module_name: analysisPipline,
                                component_id: rest.component_id,
                            })
                        }}>组件代码</Button>
                        {rest.databases &&
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                operatePipeline.openModal("modalE", rest.databases)
                            }}>配置数据库</Button>
                        }

                        <QuestionCircleOutlined onClick={() => {
                            operatePipeline.openModal("descriptionModal", rest.description)
                        }} style={{ cursor: "pointer" }} />
                    </Flex>

                    {/* {rest.description && <>
                        <Markdown data={rest.description}></Markdown>
                    </>} */}
                    {/* {rest.description} */}
                </Card>

                {checkAvailable(inputFile) ? <>
                    <UpstreamAnalysisInput
                        {...rest}
                        pipeline={pipeline}
                        record={record}
                        // software={{
                        //     component_id: rest.component_id
                        // }}
                        onClickItem={setRecord}
                        project={project}
                        operatePipeline={operatePipeline}
                        cardExtra={cardExtra}
                        // wrapAnalysisPipeline={wrapAnalysisPipeline}
                        upstreamFormJson={upstreamFormJson}
                        analysisPipline={analysisPipline}
                        analysisMethod={analysisMethod}
                        inputAnalysisMethod={inputFile}></UpstreamAnalysisInput>
                </> : <>
                    {/* <Flex justify="center" style={{ margin: "2rem" }}>
                        <Button color="cyan" variant="solid" onClick={() => {
                            setPipelineRecord(undefined);
                            setPipelineStructure({
                                pipeline_type: "input_analysis_method",
                                parent_pipeline_id: rest.pipeline_id
                            })
                            setOperateOpen(true)
                        }}>添加管道输入</Button>
                    </Flex> */}

                    <Flex justify="center" style={{ margin: "2rem" }} gap={"small"}>
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            operatePipeline.openModal("modalC", {
                                data: undefined,
                                structure: {
                                    relation_type: "software_input_file", //"software_input_file",
                                    parent_component_id: rest.component_id,
                                    // pipeline_id: pipeline.component_id,
                                    component_type: "file"
                                }
                            })
                        }}>新增文件</Button>
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            operatePipeline.openModal("modalA", {
                                data: undefined,
                                pipelineStructure: {
                                    relation_type: "software_input_file", //"software_input_file",
                                    parent_component_id: rest.component_id,
                                    // pipeline_id: pipeline.component_id
                                }
                            })
                        }}>添加文件</Button>
                    </Flex>
                </>}
                {/* {JSON.stringify(rest)} */}

                {/* <PipelineMonitor pipelineId={rest.pipeline_id} ></PipelineMonitor> */}
                <div style={{ marginBottom: "1rem" }}></div>

                {checkAvailable(outputFile) ? <UpstreamAnalysisOutput
                    {...rest}
                    pipeline={pipeline}

                    software={{
                        pipeline_id: rest.pipeline_id,
                        component_id: rest.component_id
                    }}

                    children={children}
                    onClickItem={setRecord}
                    downstreamAnalysis={downstreamAnalysis}
                    operatePipeline={operatePipeline}
                    project={project}
                    analysisType={analysisType}
                    analysisMethod={outputFile}
                    appendSampleColumns={appendSampleColumns}></UpstreamAnalysisOutput>
                    : <>
                        {/* {wrapAnalysisPipeline != analysisPipline &&
                            */}
                        <Flex justify="center" style={{ margin: "2rem" }} gap={"small"}>
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                operatePipeline.openModal("modalC", {
                                    data: undefined,
                                    structure: {
                                        relation_type: "software_output_file", //"software_input_file",
                                        parent_component_id: rest.component_id,
                                        // pipeline_id: pipeline.component_id,
                                        component_type: "file"
                                    }
                                })
                            }}>新增文件</Button>
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                operatePipeline.openModal("modalA", {
                                    data: undefined,
                                    pipelineStructure: {
                                        relation_type: "software_output_file", //"software_input_file",
                                        parent_component_id: rest.component_id,
                                        // pipeline_id: pipeline.component_id
                                    }
                                })
                            }}>添加文件</Button>
                        </Flex>
                    </>}



            </Col>
            {/* <Col lg={5} sm={24} xs={24} style={{ paddingLeft: "1rem" }}>



                <div style={{ marginBottom: "1rem" }}></div>
                <Card title={`介绍 - ${rest.component_type}`} size="small">
            
                </Card>
            </Col > */}


        </Row >
    </>
}

export default AnalysisSoftwarePanel


export const UpstreamAnalysisInput: FC<any> = ({ record, pipeline, operatePipeline, project, markdown, analysisPipline, upstreamFormJson, inputAnalysisMethod, onClickItem, cardExtra, ...rest }) => {
    const [upstreamForm] = Form.useForm();
    const [resultTableList, setResultTableList] = useState<any>()
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState<boolean>(false)
    const formId = Form.useWatch((values) => values?.analysis_id, upstreamForm);
    // const [currentAnalysisMethod, setCurrentAnalysisMethod] = useState<any>(analysisMethod[0].value[0])
    // const [currentAnalysisMethod, setCurrentAnalysisMethod] = useState<any>(analysisPipline ? analysisPipline : "")
    const [activeTabKey, setActiveTabKey] = useState<any>()
    const [currentAnalysisMethod, setCurrentAnalysisMethod] = useState<any>()
    // const [analysisParams, setAnalysisParams] = useState<any>()
    const [modal, modalContextHolder] = Modal.useModal();
    const { projectObj } = useOutletContext<any>()

    // const {    setPipelineStructure,setOperateOpen,setPipelineRecord,datelePipeline} = operatePipeline
    const tableRef = useRef<any>(null)

    const getrRequestParams = (values: any) => {
        const dataComponentIds = inputAnalysisMethod.map((item: any) => item.component_id)
        const requestParams = {
            ...values,
            project: project,
            // analysis_pipline: analysisPipline,
            // parse_analysis_module: rest.parse_analysis_module,
            component_id: rest.component_id,
            data_component_ids: JSON.stringify(dataComponentIds)
            // pipeline_id: pipeline.component_id
            // parse_analysis_result_module: rest.parseAnalysisResultModule
        }
        return requestParams
    }
    const saveUpstreamAnalysis = async (save: any) => {
        const values = await upstreamForm.validateFields()
        const requestParams = getrRequestParams(values)
        setLoading(true)
        try {
            const resp: any = await axios.post(`/fast-api/analysis-controller?save=${save}`, requestParams)
            // setFilePlot(resp.data)
            // setAnalysisParams(resp.data)
            console.log(resp)

            if (save) {
                messageApi.success("执行成功!")
                if (tableRef.current) {
                    tableRef.current.reload()
                }
            } else {
                operatePipeline.openModal("modalF", resp.data)
            }
        } catch (error: any) {
            console.log(error)
            if (error.response?.data) {
                messageApi.error(error.response.data.detail)
            }
        }
        setLoading(false)
        // /fast-api/save-analysis
    }
    const host_genome_index = [
        {
            label: "人类",
            value: "/data/metagenome_data/bowtie2_index/human/human38"
        }, {
            label: "小鼠",
            value: "/data/databases/mouse/bowtie2/Mus_musculus.GRCm39.dna_sm.toplevel.fa"
        }
    ]
    const getGroupField = () => {
        if (!projectObj?.metadata_form) return []
        return projectObj?.metadata_form.map((item: any) => ({
            label: item.label,
            value: item.name
        }))
    }
    const dataMap: any = {
        "host_genome_index": host_genome_index
    }

    return <>
        {/* {JSON.stringify(software)} */}
        {contextHolder}
        {modalContextHolder}
        {/* {JSON.stringify(inputAnalysisMethod)} */}


        {!rest?.hiddenUpstreamAnalysis && <>
            <Form form={upstreamForm}>

                <Collapse
                    // activeKey={collapseActiveKey}
                    style={{ marginTop: "1rem" }}
                    // defaultActiveKey={['1']}
                    size="small"
                    items={[
                        {
                            key: '1',
                            label: `执行分析 (${rest.component_name})`,
                            children: <>
                                {/* <Flex gap={"small"} style={{ marginBottom: "1rem" }}>
                                <Button color="cyan" variant="solid" onClick={() => {
                                    operatePipeline.openModal("modalB", {
                                        module_type: "nextflow",
                                        module_name: analysisPipline,
                                        component_id: rest.component_id,
                                    })
                                }}>运行脚本</Button>
                                <Button color="cyan" variant="solid" onClick={() => {
                                    operatePipeline.openModal("modalB", {
                                        module_type: "py_parse_analysis",
                                        module_name: rest.parseAnalysisModule,
                                        component_id: rest.component_id,
                                    })
                                }}>输入解析模块</Button>
                            </Flex> */}



                                {inputAnalysisMethod && <ResultList
                                    {...rest}
                                    pipeline={pipeline}
                                    software={rest}
                                    currentAnalysisMethod={currentAnalysisMethod}
                                    setCurrentAnalysisMethod={setCurrentAnalysisMethod}
                                    operatePipeline={operatePipeline}
                                    relationType="software_input_file"
                                    cardExtra={cardExtra}
                                    title={`输入文件 ${inputAnalysisMethod.length > 0 ? "" : inputAnalysisMethod.map((it: any) => it.label)}`}
                                    activeTabKey={activeTabKey}
                                    setActiveTabKey={setActiveTabKey}
                                    shouldTrigger={true}
                                    analysisType={"sample"}
                                    analysisMethod={inputAnalysisMethod}
                                    // setRecord={(record: any) => onClickItem(record)}
                                    setResultTableList={setResultTableList}></ResultList>
                                }


                                <div style={{ marginBottom: "1rem" }}></div>


                                <Spin spinning={loading}>

                                    {/* {JSON.stringify(rest.parseAnalysisResultModule)} */}
                                    <Form.Item name={"analysis_id"} label="分析ID" >
                                        <Input disabled></Input>
                                    </Form.Item>
                                    <Form.Item initialValue={`${rest.component_name}`} name={"analysis_name"} label={"分析名称"} rules={[{ required: true, message: '该字段不能为空!' }]}>
                                        <Input></Input>
                                    </Form.Item>
                                    <FormJsonComp formJson={[{
                                        "name": "group_field",
                                        "label": "分组列",
                                        "rules": [
                                            {
                                                "required": true,
                                                "message": "该字段不能为空!"
                                            }
                                        ],
                                        "type": "GroupFieldSelect"
                                    }]} dataMap={[]}></FormJsonComp>

                                    {/* 查看datamap */}
                                    {/* <pre>
                                {JSON.stringify(resultTableList,null,2)}
                                </pre> */}
                                    {/* {JSON.stringify(inputAnalysisMethod)} */}
                                    <FormJsonComp formJson={inputAnalysisMethod} dataMap={resultTableList}></FormJsonComp>
                                    {/* {JSON.stringify(rest)} */}
                                    <BioDatabaseForm  operatePipeline={operatePipeline} formJson={rest.databases}></BioDatabaseForm>
                                    {/* <FormJsonComp formJson={rest.databases} dataMap={resultTableList}></FormJsonComp> */}

                                    {/* {resultTableList && inputAnalysisMethod.map((it: any) => (<> */}
                                    {/* <Form.Item key={it.key} label={it.name} name={it.key}>
                                        <SelectComp it={it} resultTableList={resultTableList} ></SelectComp>
                                    </Form.Item> */}
                                    {/* 
                                    {it.mode == "multiple" && <GroupSelectSampleButton
                                        key={it.key}
                                        label={it.name}
                                        name={it.key}
                                        rules={[{ required: true, message: '该字段不能为空!' }]}
                                        data={resultTableList[it.key] ? resultTableList[it.key] : []}
                                        groupField={"sample_group"} ></GroupSelectSampleButton>} */}


                                    {/* </>))} */}
                                    {upstreamFormJson &&
                                        <FormJsonComp formJson={upstreamFormJson} dataMap={dataMap}></FormJsonComp>
                                    }
                                    <Flex gap={"small"}>
                                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                                            saveUpstreamAnalysis(false)

                                        }}>查看参数</Button>

                                        <Button size="small" color="cyan" variant="solid" onClick={() => saveUpstreamAnalysis(true)}>{formId ? <>更新分析</> : <>保存分析</>}</Button>
                                        {formId && <Button size="small" color="cyan" variant="solid" onClick={() => upstreamForm.setFieldValue("analysis_id", undefined)}>取消更新</Button>}

                                    </Flex>
                                    {/* <hr />
                                
                                <hr /> */}
                                    <Collapse ghost items={[
                                        {
                                            key: "1",
                                            label: "更多",
                                            children: <>
                                                <Form.Item noStyle shouldUpdate>
                                                    {() => (
                                                        <Typography>
                                                            <pre>{JSON.stringify(getrRequestParams(upstreamForm.getFieldsValue()), null, 2)}</pre>
                                                        </Typography>
                                                    )}
                                                </Form.Item>
                                            </>
                                        }
                                    ]} />

                                    {/* {JSON.stringify(rest)} */}
                                    {/* <AnalysisList
                                    project={project}
                                    ref={tableRef}
                                    shouldTrigger={true}
                                    software={rest}
                                    setRecord={(record: any) => {
                                        const param = JSON.parse(record.request_param)
                                        console.log(param)
                                        upstreamForm.resetFields()
                                        upstreamForm.setFieldsValue(param)
                                        if (record?.id) {
                                            upstreamForm.setFieldValue("id", record?.id)
                                        }
                                        record['dataType'] = "analysis"
                                        onClickItem(record)
                                    }}></AnalysisList> */}

                                    {/* {record && record.dataType == 'analysis' && <PipelineMonitor analysisId={record.analysis_id} ></PipelineMonitor>} */}


                                    {/* {markdown} */}
                                    <AnalysisResultView
                                        plotLoading={false}
                                        markdown={markdown}></AnalysisResultView>
                                    {/* <Literature params={{
                                    obj_key: analysisPipline,
                                    obj_type: "analysis_img"
                                }}></Literature> */}
                                </Spin>

                            </>
                        },
                        // {
                        //     key: "2",
                        //     label: `分析记录 (${analysisPipline})`,
                        //     children: <>
                        //         <Spin spinning={loading}>
                        //             {currentAnalysisMethod}

                        //         </Spin>

                        //     </>
                        // }
                    ]}
                >
                </Collapse>

            </Form>
            <div style={{ marginBottom: "1rem" }}></div>


            {/* <Flex gap={"small"} style={{ marginBottom: "1rem" }}>
           
        </Flex> */}

            <AnalysisList
                project={project}
                ref={tableRef}
                shouldTrigger={true}
                software={rest}
                component_id={rest?.component_id}
                operatePipeline={operatePipeline}
                editParams={(record: any) => {
                    const param = JSON.parse(record.request_param)
                    console.log(param)
                    upstreamForm.resetFields()
                    upstreamForm.setFieldsValue(param)
                    if (record?.id) {
                        upstreamForm.setFieldValue("analysis_id", record?.analysis_id)
                    }
                    record['dataType'] = "analysis"
                    onClickItem(record)
                }}></AnalysisList>

            <div style={{ marginBottom: "1rem" }}></div>
        </>}
    </>
}

export const SelectComp: FC<any> = ({ it, resultTableList, value, onChange }) => {
    const [selectedItems, setSelectedItems] = useState<any>(value);
    const [options, setOptions] = useState<any>([]);
    const onChangeSelct = (value: any) => {
        console.log(value)
        onChange(value)
        setSelectedItems(value)
    }
    const getOptions = () => {
        return resultTableList[it.name] && resultTableList[it.name].map((it: any) => {
            return {
                label: `${it.sample_name}`,
                value: `${it.id}`
            }
        })
    }
    useEffect(() => {
        const options = getOptions()
        setOptions(options)
    }, [resultTableList])
    return <>
        <Select value={selectedItems} onChange={onChangeSelct} mode={it.mode == "multiple" ? "multiple" : undefined} allowClear options={options}></Select>
        {it.mode == "multiple" && <Button size="small" onClick={() => {
            const values = options.map((it: any) => it.value)
            // console.log(values)
            setSelectedItems(values)
            onChange(values)
        }}>选择全部{selectedItems && <>({selectedItems.length})</>}</Button>}
    </>
}




export const UpstreamAnalysisOutput: FC<any> = ({ pipeline, operatePipeline, children, project, onClickItem, analysisType, analysisMethod, appendSampleColumns, script, ...rest }) => {
    const [form] = Form.useForm();

    // const [loading, setLoading] = useState(false)
    // const [data, setData] = useState<any>()
    const [record, setRecord] = useState<any>()
    const [filePlot, setFilePlot] = useState<any>()
    const [plotLoading, setPlotLoading] = useState<boolean>(false)

    const [formDom, setFormDom] = useState<any>()
    const [formJson, setFormJson] = useState<any>()

    const [sampleSelectComp, setSampleSelectComp] = useState<any>(false)

    // const [htmlUrl, setHtmlUrl_] = useState<any>()
    const { Search } = Input;
    const [messageApi, contextHolder] = message.useMessage();
    const [moduleName, setModuleName] = useState<any>()
    const [params, setParams] = useState<any>()
    // const [tableDesc, setTableDesc] = useState<any>()
    const [downstreamData, setDownstreamData] = useState<any>()

    const [resultTableList, setResultTableList] = useState<any>([])
    const [saveAnalysisMethod, setSaveAnalysisMethod] = useState<any>()
    const [collapseActiveKey, setCollapseActiveKey] = useState<any>("1")
    const [activeTabKey, setActiveTabKey] = useState<any>()
    const [currentAnalysisMethod, setCurrentAnalysisMethod] = useState<any>()

    const [sampleGroupJSON, setSampleGroupJSON] = useState<any>()
    const [btnName, setBtnName] = useState<any>()
    const [origin, setOrigin] = useState<any>(false)

    const tableRef = useRef<any>(null)


    const [sampleGroupApI, setSampleGroupApI] = useState<any>(false)



    // const getCurrentAnalysisMenthod = () => {
    //     const analysisMethodDict: any = analysisMethod.reduce((acc: any, item: any) => {
    //         acc[item.name] = item;
    //         return acc;
    //     }, {});
    //     // const analysisMethodDict = analysisMethidtoDict(analysisMethod)
    //     const currentAnalysisMenthod = analysisMethodDict[activeTabKey]
    //     return currentAnalysisMenthod
    // }


    // const savePlot = async ({ moduleName, params }: any) => {
    //     const values = await form.validateFields()
    //     const requestParams = {
    //         ...params,
    //         ...values,
    //         project: project,
    //         software: "python",
    //         // software: analysisMethod.filter((it: any) => it.key == activeTabKey)[0].value[0],
    //         analysis_method: saveAnalysisMethod,
    //         table_type: tableType
    //     }
    //     console.log(requestParams)
    //     setPlotLoading(true)
    //     try {
    //         const resp: any = await axios.post(`/fast-api/file-save-parse-plot/${moduleName}`, requestParams)
    //         setFilePlot(resp.data)
    //         if (tableRef.current) {
    //             tableRef.current.reload()

    //         }
    //         messageApi.success("执行成功!")
    //     } catch (error: any) {
    //         console.log(error)
    //         if (error.response?.data) {
    //             messageApi.error(error.response.data.detail)
    //         }

    //     }

    //     setPlotLoading(false)
    //     // console.log(resp.data);
    // }
    // const stableSampleGroup = useMemo(() => sampleGroup, [JSON.stringify(sampleGroup)]);

    // // 保证 groupField 稳定（通常是字符串，如果来源稳定可省略）
    // const stableGroupField = useMemo(() => groupField, groupField);

    useEffect(() => {
        if (downstreamData && currentAnalysisMethod?.downstreamAnalysis) {
            const findDownstreamData = currentAnalysisMethod?.downstreamAnalysis.find((item: any) => item.component_id == downstreamData.component_id)
            // console.log("1111",findDownstreamData)
            // setDownstreamData(findDownstreamData)
            plot(findDownstreamData)
        }

    }, [JSON.stringify(currentAnalysisMethod?.downstreamAnalysis)])


    const plot = async (data: any) => {
        let { origin = false, url, moduleName, params, paramsFun, formDom, formJson, saveAnalysisMethod, sampleSelectComp = false, sampleGroupJSON = true, sampleGroupApI = false, ...rest } = data
        cleanDom()
        setCollapseActiveKey("1")
        setDownstreamData(data)
        setFormDom(formDom)
        setModuleName(moduleName)
        setParams(params)
        setSampleGroupApI(sampleGroupApI)
        setFilePlot(undefined)
        setOrigin(origin)
        form.resetFields()
        form.setFieldValue("analysis_name", rest.component_name)
        // setBtnName(name)
        setFormJson(formJson)
        setSampleSelectComp(sampleSelectComp)
        setSampleGroupJSON(sampleGroupJSON)
        // debugger
        // console.log(paramsFun)
        if (paramsFun) {
            paramsFun = eval(paramsFun)
            params = paramsFun(record)
            console.log(params)
            setParams(params)
        }
        // if (sampleGroupJSON) {
        //     if (sampleGroupApI) {
        //         getSampleGroup()

        //     } else {
        //         const resultTable = resultTableList[activeTabKey]
        //         if (resultTable) {
        //             setSampleGroup(resultTable)
        //         }
        //     }
        // }
        if (saveAnalysisMethod) {

            setSaveAnalysisMethod(saveAnalysisMethod)
        }
        // else {
        //     setSaveAnalysisMethod("unknown")
        // }

        // console.log(sampleSelectComp)
        if (origin) {
            const resp: any = await axios.post(`/fast-api/file-parse-plot/${moduleName}`, {
                ...params,
                is_save_analysis_result: false,
                origin: true
            })
            console.log(resp)
            setFilePlot(resp.data)
            // await runPlot({ moduleName: moduleName, params: params })
        }
        // if (url) {
        //     setHtmlUrl_(url)
        // } else {
        //     if (!formDom && !sampleSelectComp && !sampleGroupJSON && !formJson) {
        //         // await runPlot({ moduleName: moduleName, params: params })
        //     }
        // }




    }
    // console.log(downstreamAnalysis)
    // const setHtmlUrl = (url: any, tableDesc: any = undefined) => {
    //     setHtmlUrl_(url)
    //     setFormDom(undefined)
    //     setTableDesc(tableDesc)
    //     setFilePlot(undefined)
    //     setOrigin(false)
    // }
    const cleanDom = () => {
        setFormDom(undefined)
        setFilePlot(undefined)
        // setHtmlUrl(undefined)
        setDownstreamData(undefined)
        setSaveAnalysisMethod(undefined)
    }

    const getScript = (item: any) => {
        const { name, analysisType, ...rest } = item

        if (record && analysisType == 'one') {
            return <Button size="small" color="purple" variant={downstreamData?.component_id == rest.component_id ? "solid" : "filled"} onClick={() => plot({ ...rest })}>{rest.component_name}({record.sample_name})</Button>
        } else {
            return <Button size="small" color="primary" variant={downstreamData?.component_id == rest.component_id ? "solid" : "filled"} onClick={() => plot({ ...rest })}>{rest.component_name}</Button>

        }

    }
    const [componentIds, setComponentIds] = useState<any>()
    useEffect(() => {
        const downstreamAnalysisList = analysisMethod.filter((item: any) => item.downstreamAnalysis).map((item: any) => item.downstreamAnalysis).flat()

        console.log(downstreamAnalysisList)
        // if (currentAnalysisMethod?.downstreamAnalysis) {
        const componentIds = downstreamAnalysisList.map((item: any) => item.component_id)
        if (componentIds.length > 0) {
            setComponentIds(componentIds)

        }
        // }
    }, [])
    useEffect(() => {
        if (script) {
            plot({ ...script, name: script.name })
            setComponentIds([script.component_id])
            // console.log(analysisMethod)
        }
    }, [script])

    // const []
    const [scriptMap, setScriptMap] = useState<any>()
    useEffect(() => {
        if (script) {
            setScriptMap({[script["component_id"]]:script})
        } else {
            const script = analysisMethod.filter((item: any) => "downstreamAnalysis" in item)
                .map((item: any) => item.downstreamAnalysis).flat(Infinity)
            const scriptMap: any = script.reduce((acc: any, item: any) => {
                acc[item.component_id] = item;
                return acc;
            }, {});
            // console.log(script)
            setScriptMap(scriptMap)
        }

    }, [analysisMethod])

    return <>
        {contextHolder}
        {/* {JSON.stringify(analysisMethod.downstreamAnalysis)} */}

        {analysisMethod && Array.isArray(analysisMethod) && analysisMethod.length > 0 && <>
            <ResultList
                {...rest}
                pipeline={pipeline}
                software={rest}
                currentAnalysisMethod={currentAnalysisMethod}
                setCurrentAnalysisMethod={setCurrentAnalysisMethod}
                operatePipeline={operatePipeline}
                relationType="software_output_file"
                title={`输出文件 ${analysisMethod.length > 0 ? "" : analysisMethod.map((it: any) => it.name)}`}
                appendSampleColumns={appendSampleColumns}
                activeTabKey={activeTabKey}
                setActiveTabKey={setActiveTabKey}
                cleanDom={cleanDom}
                analysisType={"sample"}
                analysisMethod={analysisMethod}
                shouldTrigger={true}
                form={form}
                // setTableLoading={setLoading}
                setResultTableList={setResultTableList}
                setRecord={(data: any) => { setRecord(data) }}
            // setTabletData={(data: any) => { setData(data) }}

            ></ResultList>
        </>}

        <div style={{ marginBottom: "1rem" }}></div>


        {/* {JSON.stringify(currentAnalysisMethod?.downstreamAnalysis)} */}

        {/* {JSON.stringify(downstreamData)} */}
        <Flex style={{ marginBottom: "1rem" }} gap={"small"}>
            {currentAnalysisMethod?.downstreamAnalysis && currentAnalysisMethod?.downstreamAnalysis.map((item: any, index: any) => {
                return <span key={index}>
                    {/* {JSON.stringify(item)} */}
                    {getScript(item)}

                </span>
            })}
            {script ? <>
                {/* {getScript(script)} */}

            </> : <>

                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    operatePipeline.openModal("modalC", {
                        data: undefined,
                        structure: {
                            relation_type: "file_script",
                            // pipeline_id: pipeline.component_id,
                            parent_component_id: currentAnalysisMethod.component_id,
                            component_type: "script"
                        }
                    })
                }}>新增分析</Button>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    operatePipeline.openModal("modalA", {
                        data: undefined,
                        pipelineStructure: {
                            relation_type: "file_script",
                            // pipeline_id: pipeline.component_id,
                            parent_component_id: currentAnalysisMethod.component_id,
                        }
                    })

                }}>添加分析</Button>

                {downstreamData?.component_id && <CloseCircleOutlined onClick={() => {
                    setDownstreamData(undefined)
                    // setBtnName(undefined)
                }} />}
            </>}


        </Flex>


        {children && React.cloneElement(children, {
            record: record,
            // setHtmlUrl: setHtmlUrl,
            plot: plot,
            cleanDom: cleanDom,
            form: form,
            activeTabKey: activeTabKey,
            resultTableList: resultTableList,
            // sampleGroup: sampleGroup,
            // dataMap: dataMap

        })}
        <div>


            {/* <Form form={form}   >
                <Form.Item name={"id"} style={{ display: "none" }}>
                    <Input></Input>
                </Form.Item> */}
            {/* {JSON.stringify(rest)} */}
            {downstreamData && <>
                {/* {JSON.stringify(downstreamData)} */}
                <Collapse
                    // activeKey={collapseActiveKey}
                    style={{ marginTop: "1rem" }}
                    defaultActiveKey={['1']}
                    size="small"
                    items={[
                        {
                            key: '1',
                            label: <Tooltip title={<>
                                <ul>
                                    <li>software:{rest?.component_id}</li>
                                    <li>file:{currentAnalysisMethod?.component_id}</li>
                                    <li>script:{downstreamData?.component_id}</li>
                                </ul>
                            </>}>执行分析{downstreamData ? `(${downstreamData.component_name})` : ""}</Tooltip>,
                            children: <>
                                {/* {import.meta.env.MODE == "development" && <>
                                    <ul>
                                        <li>software:{software.component_id}</li>
                                        <li>file:{currentAnalysisMethod?.component_id}</li>
                                        <li>script:{downstreamData?.component_id}</li>
                                    </ul>
                                </>} */}


                                {/* {JSON.stringify(downstreamData)} */}


                                <Flex gap={"small"}>
                                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                                        operatePipeline.openModal("modalB", {
                                            // module_type: "py_plot",
                                            // file_type: "py",
                                            // module_name: downstreamData.moduleName,
                                            component_id: downstreamData.component_id,
                                            // module_dir: downstreamData.moduleDir
                                        })
                                    }}>组件代码</Button>
                                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                                        operatePipeline.openModal("modalC", {
                                            data: downstreamData, structure: {
                                                component_type: "script",
                                            }
                                        })
                                    }}>更新分析</Button>

                                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                                        operatePipeline.openModal("modalA", {
                                            data: downstreamData,
                                            pipelineStructure: {
                                                relation_type: "file_script",
                                                pipeline_id: pipeline.component_id
                                            }
                                        })

                                    }}>替换分析</Button>
                                    <Popconfirm title="确认删除!" onConfirm={() => {
                                        operatePipeline.deletePipelineRelation(downstreamData.relation_id)
                                        setBtnName(undefined)
                                    }}>
                                        <Button size="small" color="danger" variant="solid" >删除分析</Button>
                                    </Popconfirm>
                                    <QuestionCircleOutlined onClick={() => {
                                        operatePipeline.openModal("descriptionModal", downstreamData.description)
                                    }} style={{ cursor: "pointer" }} />
                                </Flex>
                                <div style={{ marginBottom: "1rem" }}></div>
                                {/* {JSON.stringify(downstreamData.databases)} */}
                                
                                <AnalysisForm
                                    {...downstreamData}
                                    pipeline={pipeline}
                                    form={form}
                                    resultTableList={resultTableList}
                                    formJson={formJson}
                                    formDom={formDom}
                                    // activeTabKey={activeTabKey}
                                    sampleGroupApI={sampleGroupApI}
                                    // moduleName={moduleName}
                                    operatePipeline={operatePipeline}
                                    params={params}
                                    name={btnName}
                                    setPlotLoading={setPlotLoading}
                                    dataComponentIds={[currentAnalysisMethod?.component_id]}
                                    inputAnalysisMethod={currentAnalysisMethod}
                                    saveAnalysisMethod={saveAnalysisMethod}
                                    project={project}
                                    setFilePlot={setFilePlot}
                                    callback={() => {
                                        if (tableRef.current) {
                                            tableRef.current.reload()
                                        }
                                    }}
                                    plotReloadTable={() => {
                                        if (tableRef.current) {
                                            tableRef.current.reload()
                                        }
                                    }}
                                // runPlot={runPlot}
                                // sampleGroup={sampleGroup}
                                // analysisMethod={analysisMethod} 
                                ></AnalysisForm>



                                {/* <AnalysisResultView
                                    plotLoading={plotLoading}
                                    filePlot={filePlot}
                                    {...downstreamData}></AnalysisResultView> */}

                            </>

                        },
                        // {
                        //     key: '2', label: `保存分析结果(${saveAnalysisMethod})`, children: <>
                        //         <Spin spinning={plotLoading}>
                        //             {filePlot && <>
                        //                 <hr />
                        // <Form.Item label="分析名称" name={"analysis_name"} style={{ maxWidth: 600 }}>
                        //     <Input></Input>
                        // </Form.Item>
                        // <Button type="primary" onClick={() => {
                        //     savePlot({ moduleName: moduleName, params: params })
                        // }}>{formId ? <>更新</> : <>保存</>}</Button>
                        // {formId && <Button type="primary" onClick={() => form.setFieldValue("id", undefined)}>取消更新</Button>}



                        //                 <hr />
                        //             </>}




                        //         </Spin>

                        //     </>
                        // }
                    ]}
                />
            </>}


            {/* </Form> */}
        </div>
        <div style={{ marginBottom: "1rem" }}></div>
        {/* 111 {project} */}
        {/* {JSON.stringify(getScriptComponentIds())} */}
        {componentIds &&
            <AnalysisList
                project={project}
                ref={tableRef}
                shouldTrigger={true}
                software={downstreamData}
                component_ids={componentIds}
                operatePipeline={operatePipeline}
                editParams={(record: any) => {
                    // console.log(scriptMap)
                    // console.log(record)
                    // console.log(record.component_id in scriptMap)
                    if (record.component_id in scriptMap) {
                        // console.log(11111111111111)
                        plot({ ...scriptMap[record.component_id] })

                        const param = JSON.parse(record.request_param)
                        console.log(param)
                        form.resetFields()
                        form.setFieldsValue(param)
                        if (record?.analysis_id) {
                            form.setFieldValue("analysis_id", record?.analysis_id)
                        }
                    }
                }}
                setRecord={(record: any) => {
                    // const param = JSON.parse(record.request_param)
                    // console.log(param)
                    // form.resetFields()
                    // form.setFieldsValue(param)
                    // if (record?.analysis_id) {
                    //     form.setFieldValue("analysis_id", record?.analysis_id)
                    // }
                    // record['dataType'] = "analysis"
                    // onClickItem(record)
                }}></AnalysisList>
        }
        {/* scriptMap */}


    </>
}

