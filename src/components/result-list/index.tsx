import { useSSEContext } from "@/context/sse/useSSEContext"
import { SSEContextType } from "@/type/sse"
import { Venn } from "@ant-design/plots"
import { Button, Card, Flex, message, Modal, Popconfirm, Popover, Space, Table, Tooltip, Typography } from "antd"
import axios from "axios"
import { FC, forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { useOutletContext, useParams } from "react-router"

export const readHdfsAPi = (contentPath: any) => axios.get(`/api/read-hdfs?path=${contentPath}`)
export const readJsonAPi = (contentPath: any) => axios.get(`/fast-api/read-json?path=${contentPath}`)


const ResultList = forwardRef<any, any>(({
    pipeline,
    software,
    title,
    form,
    appendSampleColumns = [],
    setResultTableList,
    cleanDom,
    analysisType,
    setRecord,
    setTableLoading,
    setTabletData,
    shouldTrigger,
    analysisMethod,
    columnsParamsALL,
    activeTabKey,
    setActiveTabKey,
    cardExtra,
    operatePipeline,
    relationType,
    currentAnalysisMethod,
    setCurrentAnalysisMethod,
    params
}, ref) => {
    useImperativeHandle(ref, () => ({
        reload
    }))

    const { project } = useOutletContext<any>()
    const [data, setData] = useState<any>([])
    const [groupedData, setGroupedData] = useState<any>()
    // const [content,setContent] = useState<any>()
    const [loading, setLoading] = useState(false)
    // const { eventSource } = useOutletContext<SSEContextType>();
    const { eventSourceRef, status, reconnect } = useSSEContext();

    useEffect(() => {
        if (!eventSourceRef) return;

        const handler = (event: MessageEvent) => {
            const data = JSON.parse(event.data)
            console.log("analysis_result", data)
            if (data.msgType === "analysis_result"){
                // message.success(data.msg)
                const componentIdList = analysisMethod.map((it:any)=>it.component_id)
                console.log("componentIdList", componentIdList) 
                console.log("data.component_id ", data.component_id )   
                console.log(" componentIdList.includes(data.component_id) ", componentIdList.includes(data.component_id))   
                if (  componentIdList.includes(data.component_id)){
                    reload()
                    // console.log("reload", currentAnalysisMethod?.component_id)   
                }
            }
            // if (data.analysis_id == analysis_id) {
            //     if (data.msgType === "workflow_log") {
            //         setFileTabKey("workflow_log_file")
            //         console.log("workflow_log_file", data)
            //         readLogFile(fileMap["workflow_log_file"])
            //     } else if (data.msgType === "executor_log") {
            //         setFileTabKey("executor_log_file")
            //         readLogFile(fileMap["executor_log_file"])
            //     } else if (data.msgType === "trace") {
            //         setFileTabKey("trace_file")
            //         readLogFile(fileMap["trace_file"])
            //     } else if (data.msgType == "process_end") {
            //         setFileTabKey("workflow_log_file")
            //         readLogFile(fileMap["workflow_log_file"])
            //         if (callback) {
            //             callback()
            //         }
            //     }
            // }
        };

        eventSourceRef.current?.addEventListener('message', handler);

        return () => {
            console.log("removeEventListener")
            eventSourceRef.current?.removeEventListener('message', handler);
        };
    }, [eventSourceRef]);
    // const [currentAnalysisMenthod, setCurrentAnalysisMenthod] = useState<any>()
    // const [currentAnalysisMethod, setCurrentAnalysisMethod] = useState<any>()
    // const { setPipelineStructure, setOperateOpen, setPipelineRecord, datelePipeline } = operatePipeline

    // const reload = () => {
    //     loadData(currentAnalysisMethod.value)
    // }
    // useEffect(() => {
    //     const currentAnalysisMethod = analysisMethod[0]
    //     initData(currentAnalysisMethod)
    // }, [])
    // const initData = (currentAnalysisMethod:any)=>{
    //     setActiveTabKey(currentAnalysisMethod.key)
    //     setCurrentAnalysisMethod(currentAnalysisMethod)
    //     loadData(currentAnalysisMethod.value)
    // }
    // const onTabChange = (key:any)=>{
    //     const currentAnalysisMethod = analysisMethod.filter((it:any)=>it.key==key)[0]
    //     initData(currentAnalysisMethod)
    // }

    const reload = () => {
        console.log(analysisMethod)
        if (analysisMethod && Array.isArray(analysisMethod)) {

            const analysisMethodList = analysisMethod.flatMap((it: any) => it.name)
            const componentIdList = analysisMethod.flatMap((it: any) => it.component_id)

            // console.log(analysisMethodList)
            loadData({ analysisMethodValues: undefined, componentIdList: componentIdList })
        } else {
            loadData({ params: params })
        }

    }

    const getCurrentAnalysisMenthod = (activeTabKey: any) => {
        const analysisMethodDict: any = analysisMethod.reduce((acc: any, item: any) => {
            acc[item?.name] = item;
            return acc;
        }, {});
        // const analysisMethodDict = analysisMethidtoDict(analysisMethod)
        const currentAnalysisMenthod = analysisMethodDict[activeTabKey]
        return currentAnalysisMenthod
    }
    useEffect(() => {
        // const currentAnalysisMethod = analysisMethod[0]
        if (analysisMethod && Array.isArray(analysisMethod) && analysisMethod.length > 0) {
            if (setActiveTabKey) {
                setActiveTabKey(analysisMethod[0]?.name)
                const currentAnalysisMethod = getCurrentAnalysisMenthod(analysisMethod[0]?.name)
                setCurrentAnalysisMethod(currentAnalysisMethod)
            }
        }

        reload()

        // initData(currentAnalysisMethod)
    }, [JSON.stringify(params), JSON.stringify(analysisMethod)])

    const onTabChange = (key: any) => {
        setData(groupedData[key])
        setActiveTabKey(key)
        const currentAnalysisMethod = getCurrentAnalysisMenthod(key)
        setCurrentAnalysisMethod(currentAnalysisMethod)
    }

    const getKeyMap = () => {
        const analysisMethodMap = Object.fromEntries(analysisMethod.map((item: any) => [item.name, item.inputKey]));
        // console.log(analysisMethodMap)
        const result: any = {};
        Object.entries(analysisMethodMap).forEach(([key, values]) => {
            if (Array.isArray(values)) {
                values.forEach((value: any) => {
                    result[value] = key;
                });
            } else {
                result[values] = key;
            }


        });
        return result
    }
    const loadData = async ({ analysisMethodValues, params, componentIdList }: any) => {
        setLoading(true)
        let resp: any = await axios.post(`/fast-api/find-analyais-result-by-analysis-method`, {
            project: project,
            analysis_method: analysisMethodValues,
            component_ids: componentIdList,
            ...params
        })

        if (componentIdList || analysisMethodValues) {
            const keyMap = getKeyMap()
            // console.log(keyMap)

            const groupedData = resp.data.reduce((acc: any, item: any) => {
                const key = item.analysis_method;
                // const key = keyMap[item.analysis_method]
                if (!acc[key]) {
                    acc[key] = [];
                }
                const { sample_name, id, sample_group, ...rest } = item
                // debugger
                acc[key].push({
                    label: sample_name,
                    value: id,
                    sample_group: sample_group ? sample_group : "no_group",
                    sample_name: sample_name,
                    id: id,
                    // "aaa":"1111",
                    ...rest
                });
                return acc;
            }, {});
            console.log(groupedData)
            if (setResultTableList) {
                // console.log(groupedData)
                setResultTableList(groupedData)
            }
            setGroupedData(groupedData)
            // console.log("activeTabKey: ", activeTabKey)
            if (activeTabKey) {
                setData(groupedData[activeTabKey] ? groupedData[activeTabKey] : [])
            } else {
                setData(groupedData[analysisMethod[0].name] ? groupedData[analysisMethod[0].name] : [])
            }
        } else {
            // console.log(resp.data)
            setData(resp.data)
        }

        setLoading(false)
    }

    // useEffect(() => {
    //     reload()

    // }, [])
    const deleteById = async (id: any) => {
        const resp: any = await axios.delete(`/analyais-result/delete-by-id/${id}`)
        message.success("删除成功!")
        reload()
    }
    // const readHdfs = async (contentPath: any) => {
    //     setTableLoading(true)
    //     const resp: any = await readHdfsAPi(contentPath)

    //     setTabletData(resp.data)
    //     setTableLoading(false)
    //     // reset()
    //     // console.log(resp.data)
    //     // setData(resp.data)
    // }
    const readJOSN = async (contentPath: any) => {
        setTableLoading(true)
        const resp: any = await readJsonAPi(contentPath)
        setTabletData(resp.data)
        setTableLoading(false)
        // reset()
        // console.log(resp.data)
        // setData(resp.data)
    }
    const downloadTSV = (tsvData: string, filename = 'data.tsv') => {
        const blob = new Blob([tsvData], { type: 'text/tab-separated-values' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // 释放内存:ml-citation{ref="2,7" data="citationList"}
    };
    const downloadHdfs = async (contentPath: any) => {
        const resp: any = await axios.get(`/api/download-hdfs?path=${contentPath}`)
        // console.log(contentPath.split('/').pop())
        downloadTSV(resp.data, contentPath.split('/').pop())
    }

    let columns: any = []
    if (analysisType == "sample") {
        columns = [
            {
                title: 'id',
                dataIndex: 'id',
                key: 'id',
                width: 50,
                ellipsis: true,

            },
            {
                title: '文件类型',
                dataIndex: 'analysis_method',
                key: 'analysis_method',
                ellipsis: true,
                render: (text: any, record: any) => {
                    return <Tooltip title={<>
                        <ul>
                            <li>component_id: {record.component_id}</li>
                            <li>analysis_result_id: {record.analysis_result_id}</li>
                            <li>sample_id: {record.sample_id}</li>
                            <li>file_name: {record.file_name}</li>
                            <li>analysis_result_hash: {record.analysis_result_hash}</li>
                        </ul>
                    </>}>
                        <span style={{ cursor: "pointer" }}>{text}</span>
                    </Tooltip>
                }
            },
            {
                title: '样本名称',
                dataIndex: 'sample_name',
                key: 'sample_name',
                ellipsis: true,
                render: (text: any, record: any) => {
                    return <Tooltip title={<>
                        <ul>
                            <li>sample_id: {record.sample_id}</li>
                            {/* <li>ID: {record.id}</li> */}
                            {/* <li>analysis_id: {record.analysis_id}</li>
                            <li>file_name: {record.file_name}</li> */}
                            {/* <li>analysis_name: {record.analysis_name}</li> */}
                        </ul>
                    </>}>
                        <span style={{ cursor: "pointer" }}>{text}</span>
                    </Tooltip>
                }

            },
            //  {
            //     title: '分析名称',
            //     dataIndex: 'analysis_name',
            //     key: 'analysis_name',
            //     ellipsis: true,

            // }, 
            // {
            //     title: '分析id',
            //     dataIndex: 'analysis_id',
            //     key: 'analysis_id',
            //     ellipsis: true,

            // },
            // {
            //     title: '分析版本',
            //     dataIndex: 'analysis_version',
            //     key: 'analysis_version',
            //     ellipsis: true,
            // },
            // {
            //     title: '样本名称',
            //     dataIndex: 'sample_name',
            //     key: 'sample_name',
            //     ellipsis: true,

            // },
            // {
            //     title: '样本名称',
            //     dataIndex: 'sample_name',
            //     key: 'sample_name',
            //     ellipsis: true,

            // },
            {
                title: '样本分组',
                dataIndex: 'sample_group',
                key: 'sample_group',
                ellipsis: true,

            }, {
                title: '样本分组名称',
                dataIndex: 'sample_group_name',
                key: 'sample_group_name',
                ellipsis: true,
            },

            //  {
            //     title: '组件id',
            //     dataIndex: 'component_id',
            //     key: 'component_id',
            //     ellipsis: true,
            // },

            // {
            //     title: '样本来源',
            //     dataIndex: 'sample_source',
            //     key: 'sample_source',
            //     ellipsis: true,

            // }, {
            //     title: '疾病',
            //     dataIndex: 'host_disease',
            //     key: 'host_disease',
            //     ellipsis: true,

            // },  {
            //     title: "软件",
            //     dataIndex: 'software',
            //     key: 'software',
            //     ellipsis: true,
            // },
            {
                title: 'project',
                dataIndex: 'project',
                key: 'project',
                ellipsis: true,
            },
            ...appendSampleColumns, {
                title: '操作',
                key: 'action',
                fixed: "right",
                ellipsis: true,
                width: 200,
                render: (_: any, record: any) => (
                    <Space size="middle">
                        <Popover content={<>
                            {/* {record.component_id} */}
                            <Typography >
                                <pre>{JSON.stringify(record.content, null, 2)}</pre>
                            </Typography>
                            {/* {record.analysis_name} */}
                        </>} >
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                // record.content = JSON.parse(record.content)
                                setRecord(record)
                                if (cleanDom) {
                                    cleanDom(undefined)
                                }

                                // const param = JSON.parse(record.request_param)
                                // console.log(param)
                                // form.resetFields()
                                // form.setFieldsValue(param)
                                // if (record?.id) {
                                //     form.setFieldValue("id", record?.id)
                                // }
                                // readHdfs(record.content)
                            }}>查看</Button>
                        </Popover>
                        {/* <Button size="small" color="cyan" variant="solid" onClick={() => {
                            operatePipeline.openModal("analysisResultEdit", {
                                ...record,
                                callback: reload
                            })
                        }}>编辑</Button> */}
                        {/* <a onClick={() => { downloadHdfs(record.content) }}>下载</a> */}

                        {
                            record.sample_name ?
                                <>
                                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                                        operatePipeline.openModal("metadataForm", {
                                            analysis_result_id: record.analysis_result_id,
                                            sample_id: record.sample_id,
                                            callback: reload
                                        })
                                    }}>metadata</Button>
                                </> :
                                <>
                                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                                        operatePipeline.openModal("metadataForm", {
                                            analysis_result_id: record.analysis_result_id,
                                            callback: reload
                                        })
                                    }}>添加metadata</Button>
                                </>
                        }
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            console.log(operatePipeline)
                            operatePipeline.openModals("bindSample", {
                                analysis_result_id: record.analysis_result_id,
                                callback: reload
                            })
                        }}>绑定样本</Button>
                        <Popconfirm title="确定删除吗?" onConfirm={async () => {
                            await deleteById(record.analysis_result_id)
                        }}>
                            <Button size="small" color="danger" variant="solid">删除</Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ]

    } else {
        columns = [
            {
                title: '分析名称',
                dataIndex: 'analysis_name',
                key: 'analysis_name',
                ellipsis: true,

            }, {
                title: 'id',
                dataIndex: 'id',
                key: 'id',
                ellipsis: true,

            }, {
                title: "分析方法",
                dataIndex: 'analysis_method',
                key: 'analysis_method',
                ellipsis: true,
            }, {
                title: '输入软件',
                dataIndex: 'software',
                key: 'software',
                ellipsis: true,
            }, {
                title: 'project',
                dataIndex: 'project',
                key: 'project',
                ellipsis: true,
            }, {
                title: 'analysis_type',
                dataIndex: 'analysis_type',
                key: 'analysis_type',
                ellipsis: true,
            },
            // {
            //     title: 'control',
            //     dataIndex: 'control',
            //     key: 'control',
            //     ellipsis: true,
            // }, {
            //     title: 'treatment',
            //     dataIndex: 'treatment',
            //     key: 'treatment',
            //     ellipsis: true,

            // }, {
            //     title: 'rank',
            //     dataIndex: 'rank',
            //     key: 'rank',
            //     ellipsis: true,
            // },
            {
                title: '创建时间',
                dataIndex: 'create_date',
                key: 'create_date',
                ellipsis: true,
            }, {
                title: '操作',
                key: 'action',
                fixed: "right",
                ellipsis: true,
                width: 200,
                render: (_: any, record: any) => (
                    <Space size="middle">
                        <Popover content={<>
                            <Typography >
                                <pre>{JSON.stringify(record.content, null, 2)}</pre>
                            </Typography>
                        </>} >
                            <a onClick={() => {
                                const param = JSON.parse(record.request_param)
                                if (form) {
                                    form.resetFields()
                                    form.setFieldsValue(param)
                                    if (record?.id) {
                                        form.setFieldValue("id", record?.id)
                                    }
                                }

                                readJOSN(record.content)
                                if (setRecord) {
                                    setRecord(record)
                                }
                            }}>查看</a>
                        </Popover>

                        {/* <a onClick={() => { downloadHdfs(record.content) }}>下载</a> */}
                        <Popconfirm title="确定删除吗?" onConfirm={async () => {
                            await deleteById(record.analysis_result_id)
                        }}>
                            <a>删除</a>
                        </Popconfirm>

                    </Space>
                ),
            },
        ]
    }



    return <>
        <Card title={<>{title}(
            <Tooltip title={<>
                <ul>
                    <li>namespace: {currentAnalysisMethod?.namespace_name}</li>
                    <li>pipeline: {pipeline?.component_id}</li>
                    <li>software: {software?.component_id}</li>
                    <li>file: {currentAnalysisMethod?.component_id}</li>
                    <li>name: {currentAnalysisMethod?.name}</li>
                </ul>


            </>}>
                {/* {currentAnalysisMethod?.label} */}
            </Tooltip>)</>}
            extra={<>{cardExtra}
                <Flex gap={"small"}>
                    {operatePipeline?.openModal && <>
                        <Tooltip title={currentAnalysisMethod?.label}>
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                operatePipeline.openModal("modalC", {
                                    data: undefined,
                                    structure: {
                                        relation_type: relationType, //"software_input_file",
                                        parent_component_id: software.component_id,
                                        // pipeline_id: pipeline.component_id,
                                        component_type: "file"
                                    }
                                })
                            }}>新增文件</Button>
                        </Tooltip>
                        <Tooltip title={currentAnalysisMethod?.label}>
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                operatePipeline.openModal("modalC", {
                                    data: currentAnalysisMethod, structure: {
                                        component_type: "file",
                                    }
                                })
                            }}>更新文件</Button>
                        </Tooltip>
                        <Tooltip title={currentAnalysisMethod?.label}>
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                operatePipeline.openModal("modalA", {
                                    data: undefined,
                                    pipelineStructure: {
                                        relation_type: relationType, //"software_input_file",
                                        parent_component_id: software.component_id,
                                        pipeline_id: pipeline.component_id
                                    }
                                })
                            }}>添加文件</Button>
                        </Tooltip>

                        <Tooltip title={currentAnalysisMethod?.label}>
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                // operatePipeline.setOperateOpen(true)
                                // operatePipeline.setPipelineRecord(currentAnalysisMethod)
                                // operatePipeline.setPipelineStructure({ pipeline_type: pipelineType })
                                operatePipeline.openModal("modalA", {
                                    data: currentAnalysisMethod,
                                    pipelineStructure: {
                                        relation_type: relationType,// "software_input_file",
                                        pipeline_id: pipeline.component_id
                                        // parent_component_id: currentAnalysisMethod.component_id,
                                        // pipeline_id: currentAnalysisMethod.pipeline_id
                                    }
                                })
                            }}>替换文件</Button>
                        </Tooltip>

                        <Tooltip title={currentAnalysisMethod?.label}>
                            <Popconfirm title="是否移除文件!" onConfirm={() => {
                                operatePipeline.deletePipelineRelation(currentAnalysisMethod.relation_id)
                            }}>
                                <Button size="small" color="cyan" variant="solid" >移除文件</Button>
                            </Popconfirm>
                        </Tooltip>
                    </>}

                    <Button size="small" color="primary" variant="solid" onClick={reload}>刷新</Button>
                </Flex>
            </>}
            tabList={analysisMethod && Array.isArray(analysisMethod) && analysisMethod.length > 1 ?
                analysisMethod.map((it: any) => ({ key: it.name, label: it.label })) : undefined}
            activeTabKey={activeTabKey}
            onTabChange={onTabChange}
        >
            {import.meta.env.MODE == "development" && <>

            </>}


            {/* {JSON.stringify(currentAnalysisMethod.component_id)} */}
            <Table
                rowKey={(it: any) => it.id}
                size="small"
                bordered
                // pagination={undefined}
                pagination={{ pageSize: 10 }}
                loading={loading}
                scroll={{ x: 'max-content', y: 55 * 5 }}
                columns={columnsParamsALL ? columnsParamsALL : columns}
                footer={() => `一共${data && Array.isArray(data) && data.length}条记录`}
                dataSource={data} />
            {currentAnalysisMethod?.parseFormat && currentAnalysisMethod?.relation_type == "software_output_file" && <Typography>
                <pre>
                    {JSON.stringify(currentAnalysisMethod.parseFormat, null, 2)}
                </pre>
            </Typography>}

        </Card>
        {/* <Card style={{ marginBottom: "1rem" }}>
            <Button onClick={loadData}>刷新</Button>
        </Card> */}

    </>

})

export default ResultList


export const AnalysisResultModal: FC<any> = ({ visible, onClose, params }) => {
    if (!visible) return null
    return <>
        <Modal title="分析结果" open={visible} onCancel={onClose} width={"80%"} >
            {/* {JSON.stringify(params)} */}
            <ResultList {...params} analysisType="sample" ></ResultList>
        </Modal>
    </>
}