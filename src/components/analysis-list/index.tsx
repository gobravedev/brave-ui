import { Venn } from "@ant-design/plots"
import { Button, Card, Dropdown, Flex, Input, message, Popconfirm, Popover, Space, Table, Tag, Tooltip } from "antd"
import axios from "axios"
import { FC, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import ResultParse from "../result-parse"
import { useModal } from "@/hooks/useModal"
import PipelineInfo from "../pipeline-monitor"
import { runAnalysisApi, stopAnalysisApi } from "@/api/analysis"
import AnalysisResultView from "../analysis-result-view"
import { useSSEContext } from "@/context/sse/useSSEContext"
import { DownOutlined, LineChartOutlined } from '@ant-design/icons'
export const readHdfsAPi = (contentPath: any) => axios.get(`/api/read-hdfs?path=${contentPath}`)
export const readJsonAPi = (contentPath: any) => axios.get(`/fast-api/read-json?path=${contentPath}`)

const ResultList = forwardRef<any, any>(({
    title,
    form,
    appendSampleColumns = [],
    setResultTableList,
    cleanDom,
    analysisType,
    setRecord: setRecord_,
    setTableLoading,
    setTabletData,
    shouldTrigger,
    // analysisMethod,
    columnsParamsALL,
    project,
    software,
    component_id,
    component_ids,
    operatePipeline,
    editParams
}, ref) => {
    useImperativeHandle(ref, () => ({
        reload: loadData
    }))
    const [record, setRecord0] = useState<any>()
    const [messageApi, contextHolder] = message.useMessage();
    const { modal, openModal, closeModal } = useModal();
    const [openMonitor, setOpenMonitor] = useState<any>(false)
    const navigate = useNavigate()
    const location = useLocation()
    const { eventSourceRef, status, reconnect } = useSSEContext();
    const [data, setData] = useState<any>([])
    const analysisIdRef = useRef<any>([])
    const analysisResultRef = useRef<any>(null)
    const pipelineInfoRef = useRef<any>(null)
    // const [content,setContent] = useState<any>()
    const [loading, setLoading] = useState(false)
    const [currentAnalysis, setCurrentAnalysis] = useState<any>()

    useEffect(() => {
        if (data && Array.isArray(data) && data.length > 0) {
            // const runningAnalysis = data.filter((item: any) => item.analysis_status == "running")
            if (modal.visible && modal.params) {
                const analysis = data.find((item: any) => item.analysis_id == modal.params.analysis_id)
                if (analysis) {
                    setCurrentAnalysis(analysis)
                }
            }

        }
    }, [data, modal.params])

    useEffect(() => {
        if (eventSourceRef) {
            const handler = (event: MessageEvent) => {
                // console.log('event', event)
                const data = JSON.parse(event.data)
                console.log('analysisId', analysisIdRef.current)
                if (analysisIdRef.current.includes(data.analysis_id)) {

                    if (data.event == "analysis_complete" || data.event == "analysis_failed" || data.event == "analysis_started") {
                        loadData()
                        if (analysisResultRef.current) {
                            analysisResultRef.current?.relaod()
                        }
                        if (pipelineInfoRef.current) {
                            pipelineInfoRef.current?.relaod()
                        }
                    }

                }
            };

            eventSourceRef.current?.addEventListener('message', handler);

            return () => {
                console.log("removeEventListener")
                eventSourceRef.current?.removeEventListener('message', handler);
            };
        }




    }, [eventSourceRef.current,project]);



    const setRecord = (record: any) => {
        if (setRecord_) {
            setRecord_(record)
        }

        setRecord0(record)
    }

    const loadData = async () => {
        setLoading(true)
        // ?analysis_method=${analysisMethod}&project=${project}
        let resp: any = await axios.post(`/list-analysis`, {
            // analysisMethod: analysisMethod,
            component_id: component_id,
            component_ids: component_ids,
            project: project
        });
        // if (analysisMethod) {
        //     resp = await axios.get(`/api/analysis-result?project=${project}&analysis_method=${analysisMethod}`)
        // } else {
        //     resp 
        // }
        if (setResultTableList) {
            setResultTableList(resp.data)
        }

        setData(resp.data)
        const analysisId = resp.data.map((item: any) => item.analysis_id)
        // console.log('>>>>>>>>analysisId', analysisId)

        analysisIdRef.current = analysisId
        setLoading(false)
    }
    const deleteById = async (id: any) => {
        const resp: any = await axios.delete(`/fast-api/analysis/${id}`)
        message.success("删除成功!")
        loadData()
    }


    const readJOSN = async (contentPath: any) => {
        setTableLoading(true)
        const resp: any = await readJsonAPi(contentPath)
        setTabletData(resp.data)
        setTableLoading(false)
        // reset()
        // console.log(resp.data)
        // setData(resp.datafv)
    }

    const isSelected = (record: any, key: any) => {
        if (!modal.params) return false
        return record.analysis_id == modal.params.analysis_id && key == modal.key
    }
    const runAnalysis = async (record: any, run_type: string) => {
        await runAnalysisApi(record.analysis_id, run_type)
        message.success("运行成功")
        loadData()
    }
    const stopAnalysis = async (record: any) => {
        await stopAnalysisApi(record.analysis_id)
        message.success("停止成功")
        loadData()
    }
    let columns: any = [
        {
            title: 'project_name',
            dataIndex: 'project_name',
            key: 'project_name',
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={record.project}>
                    <span style={{ cursor: "pointer" }}>{text}</span>
                </Tooltip>
            }
        }, {
            title: 'analysis_status',
            dataIndex: 'analysis_status',
            key: 'analysis_status',
            ellipsis: true,
            render: (text: any) => {
                return <Tag color={text === "success" ? "green" : text === "failed" ? "red" : "blue"}>{text}</Tag>
            }
        }, {
            title: "分析名称",
            dataIndex: 'analysis_name',
            key: 'analysis_name',
            ellipsis: true,
        },
        {
            title: 'analysis_id',
            dataIndex: 'analysis_id',
            key: 'analysis_id',
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Popover title={<>
                    <ul>
                        <li>analysis_id:{record.analysis_id}</li>
                        <li>analysis_name:{record.analysis_name}</li>
                        <li>pipeline_script:{record.pipeline_script}</li>
                        <li>work_dir:{record.work_dir}</li>
                        <li>output_dir:{record.output_dir}</li>
                        <li>command_log_path:{record.command_log_path}</li>
                        <li>trace_file:{record.trace_file}</li>
                        <li>executor_log_file:{record.executor_log_file}</li>
                        <li>workflow_log_file:{record.workflow_log_file}</li>

                    </ul>
                </>}><span style={{ cursor: "pointer" }}> <span style={{ cursor: "pointer" }} >{String(text).slice(0, 8)}</span></span></Popover>
            }

        }, {
            title: "组件名称",
            dataIndex: 'component_name',
            key: 'component_name',
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={record.component_id}>
                    <span style={{ cursor: "pointer" }}>{text}</span>
                </Tooltip>
            }
        }, {
            title: "容器",
            dataIndex: "container_name",
            key: "container_name",
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={<>
                    <ul>
                        <li>{record.container_id}</li>
                        <li>{record.container_image}</li>
                    </ul>
                </>}>
                    <span style={{ cursor: "pointer" }}>{text}</span>
                </Tooltip>
            }

        },
        // {
        //     title: "ports",
        //     dataIndex: 'ports',
        //     key: 'ports',
        //     ellipsis: true,
        //     render:(text: any, record: any)=>(<>
        //         {text}
        //     </>)
        // }, 
        {
            title: '操作',
            key: 'action',
            fixed: "right",
            ellipsis: true,
            width: 200,
            render: (_: any, record: any) => (
                <Space size="middle">

                    {/* /analysis/stop-analysis/{analysis_id} */}
                    {record.analysis_status == "running" ?
                        <>
                            <Popconfirm title={"是否停止!"} onConfirm={() => {
                                stopAnalysis(record)

                            }}>
                                <Button size="small" color="cyan" variant="solid">
                                    停止
                                </Button>
                            </Popconfirm>

                        </> : <>
                            <Popconfirm title={"是否运行!"} onConfirm={() => {
                                runAnalysis(record, "job")
                                openModal("modalA", record)
                                setRecord(record)
                            }}>
                                <Button size="small" color="cyan" variant="solid">
                                    {record.analysis_status == "created" ? "运行" : "重新运行"}
                                </Button>
                            </Popconfirm>

                        </>
                    }



                    {editParams && <Button size="small" color="cyan" variant="solid" onClick={() => editParams(record)}>编辑参数</Button>}

                    {
                        isSelected(record, "modalA") ?
                            <Button size="small" color={"cyan"} variant="solid" onClick={() => {
                                closeModal()
                            }}>关闭</Button> :
                            <Button size="small" color={"cyan"} variant="solid" onClick={() => {
                                openModal("modalA", record)
                                // setRecord(record)
                            }}>查看结果</Button>
                    }


                    {/* <Button size="small" color="cyan" variant="solid" onClick={() => {
                        openModal("modalB", record)
                    }}>查看/运行</Button> */}

                    {/* <Popconfirm title={"是否运行!"} onConfirm={async () => {
                        await runAnalysisApi(record.analysis_id)
                        setRecord(record)
                        loadData()
                    }}>
                        <Button size="small" color="cyan" variant="solid">运行</Button>
                    </Popconfirm> */}
                    {/* {isSelected(record, "modalA") ?
                        <Button size="small" color={"cyan"} variant="solid" onClick={() => {
                            closeModal()
                        }}>关闭</Button> :
                        <Button size="small" color={"cyan"} variant="solid" onClick={() => {
                            openModal("modalA", record)
                        }}>输出结果</Button>} */}



                    {/* <Popconfirm title={"是否解析!"} onConfirm={async () => {
                        try {
                            await parseAnalysisResultAPi(record.id, true)
                            messageApi.success("提交成功")
                        } catch (error: any) {
                            console.log(error)
                            messageApi.error(error?.response?.data?.detail)
                        }

                    }}>
                        
                    </Popconfirm> */}
                    <Dropdown menu={{
                        items: [
                            {
                                key: "1",
                                label: (<>
                                    {
                                        isSelected(record, "modalB") ?
                                            <a  onClick={() => {
                                                closeModal()
                                            }}>关闭</a> :
                                            <a  onClick={() => {
                                                openModal("modalB", record)
                                                // setRecord(record)
                                            }}>详情</a>
                                    }
                                </>)
                            },
                            {
                                key: "2",
                                label: (<>
                                    {record.analysis_status == "running" ? <>
                                        {record.run_type == "server" && <>
                                            <Tooltip title={<>
                                                {record.url}
                                            </>}>
                                                <a  onClick={() => {
                                                    window.open(`${record.url}`, "_blank")
                                                }}>打开URL</a>
                                            </Tooltip>
                                        </>}

                                    </> : <>
                                        <Popconfirm title="是否启动服务?" onConfirm={() => {

                                            runAnalysis(record, "server")
                                        }}>
                                            <a >启动服务</a>
                                        </Popconfirm>
                                    </>
                                    }
                                </>)
                            },
                            {
                                key: '3',
                                label: (<>
                                    <a onClick={() => {
                                        navigate(`/software-analysis-editor/${record.analysis_id}`, {
                                            state: {
                                                location: location.pathname,
                                            }
                                        })
                                    }}>编辑</a>
                                </>)
                            }, {
                                key: '4',
                                label: (<> <Popconfirm title={"是否删除!"} onConfirm={async () => {
                                    await deleteById(record.id)
                                    loadData()
                                }}>
                                    <a >删除</a>
                                </Popconfirm></>)
                            }
                        ]
                    }}>
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                更多
                                <DownOutlined />
                            </Space>
                        </a>
                    </Dropdown>
                </Space >
            ),
        },
    ]

    useEffect(()=>{
        closeModal()
    },[project])

    useEffect(() => {
        loadData()
    }, [project])
    const [searchText, setSearchText] = useState("");
    const filteredData = useMemo(() => {
        if (!searchText) return data;
        return data.filter((item: any) =>
            Object.values(item).some((val) =>
                String(val).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [data, searchText]);
    return <>
        {contextHolder}
        {/* {JSON.stringify(location.pathname)} */}
        <Card size="small" title={<><LineChartOutlined /> 分析记录</>} extra={
            <Flex gap={"small"}>
                {/* {software && <>
                    {software.outputFormat && <>
                        {software.outputFormat.map((item: any, index: any) =>
                            <Button key={index} color="cyan" variant="solid" onClick={() => {
                                operatePipeline.openModal("modalB", {
                                    module_type: "py_parse_analysis_result",
                                    module_name: item.module,
                                    component_id: software.component_id,
                                })
                            }}>输出解析模块({item.module})</Button>)}
                    </>}
                </>} */}
                <Button size="small" type="primary" onClick={loadData}>刷新</Button>
            </Flex>
        } >
            {/* {software && <ul style={{ marginBottom: "0.5rem" }}>
                {software.outputFormat && <>
                    {software.outputFormat.map((item: any, index: any) => <li key={index}>
                            输出文件: {item.outputFile} 输出路径: {item.dir}
                    </li>
                    )}
                </>}
            </ul>} */}

            <Table
                title={() => (
                    <Input.Search
                        size="small"
                        placeholder="搜索结果..."
                        allowClear
                        enterButton
                        value={searchText}
                        onChange={(e: any) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                )}
                rowKey="analysis_id"
                size="small"
                bordered
                pagination={false}
                loading={loading}
                scroll={{ x: 'max-content', y: 55 * 5 }}
                columns={columns}
                footer={() => `一共${filteredData.length}条记录`}
                dataSource={filteredData} />

        </Card>
        <div style={{ marginBottom: "1rem" }}></div>

        <AnalysisResultView
            ref={analysisResultRef}
            visible={modal.key == "modalA" && modal.visible}
            params={modal.params}
            currentAnalysis={currentAnalysis}
            status={record?.analysis_status}
            operatePipeline={operatePipeline}
            onClose={closeModal}></AnalysisResultView>
        <PipelineInfo
            ref={pipelineInfoRef}
            visible={modal.key == "modalB" && modal.visible}
            params={modal.params}
            onClose={closeModal}
            callback={loadData}></PipelineInfo>

        {/* <ResultParse
            visible={modal.key == "modalA" && modal.visible}
            onClose={closeModal}
            // callback={loadData}
            params={modal.params}
        ></ResultParse> */}

    </>
})

export default ResultList

