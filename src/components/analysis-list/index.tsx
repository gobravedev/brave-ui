import { Venn } from "@ant-design/plots"
import { Button, Card, Dropdown, Flex, Form, Input, message, Modal, Popconfirm, Popover, Select, Space, Table, Tag, Tooltip } from "antd"
import axios from "axios"
import { FC, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router"
import ResultParse from "../result-parse"
import { useModal } from "@/hooks/useModal"
import PipelineInfo from "../pipeline-monitor"
import { runAnalysisApi, stopAnalysisApi } from "@/api/analysis"
import AnalysisResultView from "../analysis-result-view"
import { useSSEContext } from "@/context/sse/useSSEContext"
import { DownOutlined, LineChartOutlined } from '@ant-design/icons'
export const readHdfsAPi = (contentPath: any) => axios.get(`/api/read-hdfs?path=${contentPath}`)
export const readJsonAPi = (contentPath: any) => axios.get(`/fast-api/read-json?path=${contentPath}`)
import EditParams from '../edit-params'
import { useSelector } from "react-redux"
import { InspectPanel } from "@/pages/container"

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
    // const analysisResultRef = useRef<any>(null)
    const pipelineInfoRef = useRef<any>(null)
    // const [content,setContent] = useState<any>()
    const [loading, setLoading] = useState(false)
    const [currentAnalysis, setCurrentAnalysis] = useState<any>()
    const { containerURL } = useSelector((state: any) => state.user); // 'light' | 'dark'

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
                        // if (analysisResultRef.current) {
                        //     analysisResultRef.current?.relaod()
                        // }
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




    }, [eventSourceRef.current, project]);



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
        message.success("successfully delete!")
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
        message.success("run successfully")
        loadData()
    }
    const stopAnalysis = async (record: any) => {
        await stopAnalysisApi(record.analysis_id)
        message.success("Stop Success")
        loadData()
    }
    let columns: any = [
        {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={record.project}>
                    <span style={{ cursor: "pointer" }}>{text}</span>
                </Tooltip>
            }
        }, {
            title: 'Analysis Status',
            dataIndex: 'analysis_status',
            key: 'analysis_status',
            ellipsis: true,
            render: (text: any) => {
                return <Tag color={text === "success" ? "green" : text === "failed" ? "red" : "blue"}>{text}</Tag>
            }
        }, {
            title: "Component Name",
            dataIndex: 'component_name',
            key: 'component_name',
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={record.component_id}>
                    <span style={{ cursor: "pointer" }}>{text}</span>
                </Tooltip>
            }
        }, {
            title: "Analysis Name",
            dataIndex: 'analysis_name',
            key: 'analysis_name',
            ellipsis: true,
        }, {
            title: "Report",
            dataIndex: 'is_report',
            key: 'is_report',
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tag color={text ? "green" : "blue"}>{text ? "Report" : "NonReport"}</Tag>
            }
        },
        {
            title: 'Analysis Id',
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
            title: "Container Name",
            dataIndex: "container_name",
            key: "container_name",
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={<>
                    <ul>
                        <li>{record.container_image}</li>
                        {record.sub_container_image && <li>{record.sub_container_image}</li>}
                    </ul>
                </>}>
                    <Tag style={{ cursor: "pointer" }}>{text}</Tag>
                    {record.sub_container_name && <Tag style={{ cursor: "pointer" }}>{record.sub_container_name}</Tag>}
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
            title: 'Action',
            key: 'action',
            fixed: "right",
            ellipsis: true,
            width: 200,
            render: (_: any, record: any) => (
                <Space size="middle">

                    {/* /analysis/stop-analysis/{analysis_id} */}
                    {record.analysis_status == "running" ?
                        <>
                            <Popconfirm title={"Whether or not to stop?"} onConfirm={() => {
                                stopAnalysis(record)

                            }}>
                                <Button size="small" color="cyan" variant="solid">
                                    Stop
                                </Button>
                            </Popconfirm>

                        </> : <>
                            <Popconfirm title={"Whether or not to run?"} onConfirm={() => {
                                runAnalysis(record, "job")
                                openModal("modalA", record)
                                setRecord(record)
                            }}>
                                <Button size="small" color="cyan" variant="solid">
                                    {record.analysis_status == "created" ? "Run" : "Rerun"}
                                </Button>
                            </Popconfirm>

                        </>
                    }



                    {/* {editParams && <Button size="small" color="cyan" variant="solid" onClick={() => editParams(record)}>编辑参数</Button>} */}
                    <Button size="small" color="cyan" variant="solid" onClick={() => openModal("editParams", record.analysis_id)}>Edit Parameters</Button>
                    {
                        isSelected(record, "modalA") ?
                            <Button size="small" color={"cyan"} variant="solid" onClick={() => {
                                closeModal()
                            }}>Close</Button> :
                            <Button size="small" color={"cyan"} variant="solid" onClick={() => {
                                openModal("modalA", record)
                                // setRecord(record)
                            }}>View Results</Button>
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
                                            <a onClick={() => {
                                                closeModal()
                                            }}>Close</a> :
                                            <a onClick={() => {
                                                openModal("modalB", record)
                                                // setRecord(record)
                                            }}>Details</a>
                                    }
                                </>)
                            },
                            {
                                key: "2",
                                label: (<>
                                    {record.analysis_status == "running" ? <>
                                        {record.run_type == "server" && <>
                                            {/* <Tooltip title={<>
                                                {record.url}
                                            </>}>
                                                <a onClick={() => {
                                                    window.open(`${record.url}`, "_blank")
                                                }}>Open URL</a>
                                            </Tooltip> */}

                                            <Tooltip title={<>
                                                {`${containerURL}/container/${record.analysis_id}/`}
                                            </>}>
                                                <a onClick={() => {
                                                    //  console.log("record", record)

                                                    window.open(`${containerURL}/container/${record.analysis_id}/`, "_blank")
                                                }}>Open URL</a>
                                            </Tooltip>


                                        </>}

                                    </> : <>
                                        <Popconfirm title="Whether to start the server?" onConfirm={() => {

                                            runAnalysis(record, "server")
                                        }}>
                                            <a >Run Server</a>
                                        </Popconfirm>
                                    </>
                                    }
                                </>)
                            }, {
                                key: 'inspect',
                                disabled: record.analysis_status != "running",
                                label: (<>
                                    <a onClick={async () => {
                                        // await axios.get(`/container/inspect/${record.analysis_id}`)
                                        openModal("inspectPanel", {
                                            inspect: "inspect",
                                            id: record.analysis_id
                                        })
                                    }}>Inspect</a>
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
                                    }}>Edit</a>
                                </>)
                            }, {
                                key: '4',
                                label: (<> <Popconfirm title={"Delete or not?"} onConfirm={async () => {
                                    await deleteById(record.analysis_id)
                                    loadData()
                                }}>
                                    <a >Delete</a>
                                </Popconfirm></>)
                            }, {
                                key: '5',
                                label: (<> <Popconfirm title={record.is_report ? "Whether to cancel the report?" : "Whether to the report?"} onConfirm={async () => {
                                    await axios.post(`/analysis/update-report/${record.analysis_id}`)
                                    loadData()
                                }}>
                                    {record.is_report ? "Cancel Report" : "Report"}
                                </Popconfirm></>)
                            },
                            {
                                key: '6',
                                label: (<>
                                    <a onClick={() => {
                                        openModal("addProject", record)
                                    }}>Add Project</a>
                                </>)
                            }
                        ]
                    }}>
                        <a onClick={(e) => e.preventDefault()}>
                            <Space>
                                More
                                <DownOutlined />
                            </Space>
                        </a>
                    </Dropdown>
                </Space >
            ),
        },
    ]

    useEffect(() => {
        closeModal()
    }, [project])

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
        <Card size="small" title={<><LineChartOutlined />  Analysis Record</>} extra={
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
                <Button size="small" type="primary" onClick={loadData}>Refresh</Button>
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
                footer={() => `A total of ${filteredData.length} records`}
                dataSource={filteredData} />

        </Card>
        <div style={{ marginBottom: "1rem" }}></div>

        <AnalysisResultView
            // ref={analysisResultRef}
            visible={modal.key == "modalA" && modal.visible}
            params={modal.params}
            onClose={closeModal}></AnalysisResultView>
        <PipelineInfo
            ref={pipelineInfoRef}
            visible={modal.key == "modalB" && modal.visible}
            params={modal.params}
            onClose={closeModal}
            callback={loadData}></PipelineInfo>
        <EditParams
            callback={loadData}
            visible={modal.key == "editParams" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></EditParams>
        <AddProject
            callback={loadData}
            visible={modal.key == "addProject" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></AddProject>

        <InspectPanel
            callback={loadData}
            visible={modal.key == "inspectPanel" && modal.visible}
            params={modal.params}
            onClose={closeModal}
        ></InspectPanel>
        {/* <ResultParse
            visible={modal.key == "modalA" && modal.visible}
            onClose={closeModal}
            // callback={loadData}
            params={modal.params}
        ></ResultParse> */}

    </>
})

export default ResultList


const AddProject: FC<any> = ({ visible, params, onClose, callback }) => {
    const [projectList, setProjectList] = useState<any>([])
    const { messageApi, project } = useOutletContext<any>()
    const [form] = Form.useForm()


    const loadData = async () => {
        const resp: any = await axios.get("/project/list-project")
        // console.log(resp.data)
        const projectList_ = resp.data.map((item: any) => {
            return {
                label: `${item.project_name}`,
                value: item.project_id
            }
        })
        setProjectList(projectList_.filter((item: any) => item.value != project))
    }



    useEffect(() => {
        loadData()
        form.resetFields()
        if (params?.extra_project_ids) {
            form.setFieldValue("project", JSON.parse(params?.extra_project_ids))

        }
    }, [project])
    const updateProject = async () => {

        const values = await form.validateFields()
        await axios.post(`/analysis/update-extra-project/${params?.analysis_id}`, values)
        messageApi.success("添加成功!")
        if (callback) {
            callback()
        }
    }

    return <Modal
        onOk={updateProject}
        title={`添加项目(${params?.analysis_name})`}
        open={visible}
        onCancel={onClose}
        onClose={onClose} >
        {/* {JSON.stringify(params)} */}
        <Form form={form}>
            <Form.Item name={"project"} label="项目">
                <Select options={projectList} mode="multiple"></Select>
            </Form.Item>
        </Form>
    </Modal>
}

