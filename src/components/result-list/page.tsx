import { useSSEContext } from "@/context/sse/useSSEContext"
import { SSEContextType } from "@/type/sse"
import { Venn } from "@ant-design/plots"
import { Alert, Button, Card, Dropdown, Empty, Flex, Form, GetProp, Input, InputNumber, Modal, Pagination, Popconfirm, Popover, Select, Skeleton, Space, Spin, Table, Tabs, Tag, theme, Tooltip, Typography, Upload, UploadFile, UploadProps } from "antd"
import axios from "axios"
import { FC, forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useNavigate, useOutletContext, useParams } from "react-router"
import { DeleteFilled, DeleteOutlined, DownloadOutlined, DownOutlined, EditOutlined, FileOutlined, ImportOutlined, InboxOutlined, PlusCircleOutlined, QuestionCircleOutlined, RedoOutlined, UploadOutlined } from "@ant-design/icons"
import ImportData from "../import-data"
import { useModal } from "@/hooks/useModal"
export const readHdfsAPi = (contentPath: any) => axios.get(`/api/read-hdfs?path=${contentPath}`)
export const readJsonAPi = (contentPath: any) => axios.get(`/fast-api/read-json?path=${contentPath}`)
import AnalysisResultEdit from "../analysis-result-edit"
import Dragger from "antd/es/upload/Dragger"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
import { useSelector } from "react-redux"
import BigTable from '@/components/big-table';
import { el, fa } from "@faker-js/faker"
import { EditResultTableModal } from "../edit-table"
import { usePagination } from "@/hooks/usePagination"
import AnalysisResultLLMLPanel from "./components/analysis-result-llm-panel"


const ResultList = forwardRef<any, any>((params_, ref) => {
    console.log("ResultList Render")
    const {
        pipeline,
        software,
        title,
        appendSampleColumns = [],
        setResultTableList,
        cleanDom,
        analysisType,
        setRecord,
        setTableLoading,
        setTabletData,
        analysisMethod,
        columnsParamsALL,
        activeTabKey,
        setActiveTabKey,
        cardExtra,
        operatePipeline,
        relationType,
        onChangeAnalysisResultId,
        component,
        setComponent,
        params,
        ...rest
    } = params_
    useImperativeHandle(ref, () => ({
        reload
    }))


    const { project, projectObj } = useOutletContext<any>()
    const message = useGlobalMessage()
    // const [data, setData] = useState<any>()
    // const [groupedData, setGroupedData] = useState<any>()
    // const [content,setContent] = useState<any>()
    // const [loading, setLoading] = useState(true)
    // const { eventSource } = useOutletContext<SSEContextType>();
    // const { eventSourceRef, status, reconnect } = useSSEContext();
    const { modal, openModal, closeModal } = useModal();
    const [tableRows, setTableRows] = useState<any[]>([])
    const [tableRowsInfo, setTableRowsInfo] = useState<any>({})

    const [tableColumns, setTableColumns_] = useState<any[]>([])
    const [tableRowLoading, setTableRowLoading] = useState<boolean>(true)
    const [analysisResultId, setAnalysisResultId_] = useState<any>()
    const [rowNum, setRowNum] = useState<number>(50)
    const { baseURL } = useSelector((state: any) => state.user)
    const navigate = useNavigate()
    const [componentParent, setComponentParent] = useState<any>()

    const { data, pageNumber, totalPage, loading, reload: loadData, pageSize, setPageNumber, search } = usePagination({
        url: `/analysis-result/page-analysis-result`,
        params: {
            ...params,
            parent_id: componentParent?.analysis_result_id,
            project: project
        },
        initialPageSize: 10
    })



    const setAnalysisResultId = (analysis_result_id: any) => {
        setAnalysisResultId_(analysis_result_id)
        if (onChangeAnalysisResultId) {
            onChangeAnalysisResultId(analysis_result_id)

        }
    }
    const setTableColumns = (columns: any[]) => {
        // const columns_ = columns.map((it: any) => it.columns_name)
        setTableColumns_([])
    }
    const sseData = useSelector((state: any) => state.global.sseData)
    useEffect(() => {
        // console.log("sseData in result list:", data.msgType)
        const data = sseData
        if (data.msgType === "analysis_result") {
            // notify.info({ message: "qqqqqqqqqq" })

            let isReload = false
            if (analysisMethod) {
                const componentIdList = analysisMethod.map((it: any) => it.component_id)
                for (const component_id of data.component_ids) {
                    console.log(component_id)
                    if (componentIdList.includes(component_id)) {
                        isReload = true
                        break
                    }
                }
            }


            if (isReload) {
                reload()
            }
        }
    }, [sseData])



    const reload = () => {
        loadData()
    }







    const loadTable = async () => {
        if (component?.file_type == "collected" && analysisResultId) {
            setTableRowLoading(true)
            const resp = await axios.get(`/analysis-result/table/${analysisResultId}?row_num=${rowNum}`, {
                timeout: 20000
            })
            setTableRows(resp.data.tables)
            setTableRowLoading(false)
            setTableRowsInfo({
                "nrow": resp.data.nrow,
                "ncol": resp.data.ncol
            })
        } else {
            setTableRows([])
            setTableRowLoading(false)
        }
    }

    useEffect(() => {

        loadTable()

    }, [analysisResultId, rowNum])

    useEffect(() => {
        if (component && component?.file_type == "collected") {
            if (data.length > 0) {
                setAnalysisResultId(data[0].analysis_result_id)
            } else {
                setAnalysisResultId(undefined)
            }
        } else {
            setAnalysisResultId(undefined)
        }
    }, [data])
    // const loadData = async ({ activeTabKey, params, componentIdList }: any) => {
    //     setLoading(true)


    //     if (componentIdList) {
    //         // const keyMap = getKeyMap()
    //         // console.log(keyMap)
    //         let resp: any = await axios.post(`/analysis-result/list-analysis-result-grouped`, {
    //             project: project,
    //             // analysis_method: analysisMethodValues,
    //             component_ids: componentIdList,
    //             component_parent_ids_map: componentParentIdsMap,
    //             // rows: -1,
    //             ...params
    //         })
    //         setLoading(false)
    //         const groupedData = resp.data;
    //         console.log("groupedData", groupedData)
    //         if (setResultTableList) {
    //             // console.log(groupedData)
    //             setResultTableList(groupedData)
    //         }
    //         setGroupedData(groupedData)
    //         // console.log("activeTabKey: ", activeTabKey)
    //         let currentData;
    //         if (activeTabKey) {
    //             currentData = groupedData[activeTabKey] ? groupedData[activeTabKey] : []

    //         } else {
    //             currentData = groupedData[analysisMethod[0]?.component_id] ? groupedData[analysisMethod[0]?.component_id] : []
    //             // setData(groupedData[analysisMethod[0]?.component_id] ? groupedData[analysisMethod[0]?.component_id] : [])
    //         }
    //         setData(currentData)

    //         if (currentData.length > 0) {
    //             setAnalysisResultId(currentData[0].analysis_result_id)
    //             setTableColumns(currentData[0].columns)
    //         } else {
    //             setTableColumns([])
    //             setAnalysisResultId(undefined)
    //         }

    //     } else {
    //         let resp: any = await axios.post(`/analysis-result/list-analysis-result`, {
    //             project: project,
    //             // analysis_method: analysisMethodValues,
    //             component_ids: componentIdList,
    //             ...params
    //         })
    //         // console.log(resp.data)
    //         setData(resp.data)
    //     }

    //     setLoading(false)
    // }



    const deleteById = async (id: any) => {
        const resp: any = await axios.delete(`/analyais-result/delete-by-id/${id}`)
        message.success("删除成功!")
        reload()
    }



    const getMetadataColumns = () => {
        // console.log("projectObj",projectObj?.metadata_form)
        if (!projectObj?.metadata_form || !Array.isArray(projectObj?.metadata_form)) return []
        return projectObj?.metadata_form?.map((item: any) => {
            return {
                title: item.label,
                dataIndex: item.name,
                key: item.name,
                ellipsis: true,
            }
        })
    }

    let columns: any = [
        {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
            width: 100,
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={record.project}>
                    <span style={{ cursor: "pointer" }}>{text}</span>
                </Tooltip>
            }
        }, {
            title: 'File Name',
            dataIndex: 'file_name',
            key: 'file_name',
            width: 100,
            ellipsis: true,
        },{
            title: 'File Type',
            dataIndex: 'file_type',
            key: 'file_type',
            width: 100,
            ellipsis: true,
        }, {
            title: 'Analysis Result ID',
            dataIndex: 'analysis_result_id',
            key: 'analysis_result_id',
            width: 50,
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={record.analysis_result_id}>
                    <span style={{ cursor: "pointer" }} >{String(text).slice(0, 8)}</span>
                </Tooltip>
            }

        }, {
            title: 'Analysis Name',
            dataIndex: 'analysis_name',
            key: 'analysis_name',
            width: 100,
            ellipsis: true,
        },

        {
            title: 'Analysis Id',
            dataIndex: 'analysis_id',
            key: 'analysis_id',
            width: 50,
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={record.analysis_id}>
                    <span style={{ cursor: "pointer" }} >{text ? String(text).slice(0, 8) : ""}</span>
                </Tooltip>
            }

        },
        {
            title: 'Component Name',
            dataIndex: 'component_name',
            key: 'component_name',
            width: 100,
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={<>
                    <ul>
                        <li>analysis_id: {record.analysis_id}</li>
                        <li>component_id: {record.component_id}</li>
                        <li>analysis_result_id: {record.analysis_result_id}</li>
                        <li>sample_id: {record.sample_id}</li>
                        <li>file_name: {record.file_name}</li>
                        <li>analysis_result_hash: {record.analysis_result_hash}</li>
                    </ul>
                </>}>
                    <a onClick={async () => {
                        const resp = await axios.get(`/find-by-component-id/${record.component_id}`)
                        setComponent(resp.data)
                        message.success(`Component ${record.component_name} loaded!`)
                    }} style={{ cursor: "pointer" }}>{text}</a>
                </Tooltip>
            }
        },
        {
            title: 'Sample Name',
            dataIndex: 'sample_name',
            key: 'sample_name',
            width: 100,
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
        //     title: 'Sample Source',
        //     dataIndex: 'sample_source',
        //     key: 'sample_source',
        //     width: 100,
        //     ellipsis: true,
        // },
        ...getMetadataColumns(),

        ...appendSampleColumns, {
            title: 'Action',
            key: 'action',
            fixed: "right",
            ellipsis: true,
            width: 100,

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
                            if (setRecord) {
                                setRecord(record)
                            }
                            // if (cleanDom) {
                            //     cleanDom(undefined)
                            // }
                            if (record.type == "folder") {

                                setComponentParent(record)
                            } else {
                                operatePipeline.openModal("openFile", { content: record.content, fileType: record.file_type, description: component.description })

                            }

                            // const param = JSON.parse(record.request_param)
                            // console.log(param)
                            // form.resetFields()
                            // form.setFieldsValue(param)
                            // if (record?.id) {
                            //     form.setFieldValue("id", record?.id)
                            // }
                            // readHdfs(record.content)
                        }}>{record.type == "folder" ? "Open Folder" : "Open File"}</Button>
                    </Popover>
                    {/* {record?.file_type == 'collected' && <>
                        
                    </>} */}
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                            openModal("llmPanel", record)
                        } }>llm</Button>
                    <Dropdown menu={{
                        items: [
                            {
                                key: 'metadata',
                                label: <>
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
                                                }}>Add Metadata</Button>
                                            </>
                                    }
                                </>
                            }, {
                                key: 'bind-sample',
                                label: <>
                                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                                        console.log(operatePipeline)
                                        operatePipeline.openModals("bindSample", {
                                            analysis_result_id: record.analysis_result_id,
                                            callback: reload
                                        })
                                    }}>Bind Sample </Button>
                                </>
                            }, {
                                key: 'delete',
                                label: <>

                                    <Popconfirm title="Are you sure you want to delete it?" onConfirm={async () => {
                                        await deleteById(record.analysis_result_id)
                                    }}>
                                        <Button size="small" color="danger" variant="solid">Delete</Button>
                                    </Popconfirm>
                                </>
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



                </Space>
            ),
        },
    ]
    const [searchText, setSearchText] = useState("");
    let filteredData: any = useMemo(() => {
        if (!searchText) {
            if (component?.file_type == "collected") {
                return tableRows
            } else {
                return data
            }
        }
        if (component?.file_type == "collected") {
            return tableRows.filter((item: any) =>
                Object.values(item).some((val) =>
                    String(val).toLowerCase().includes(searchText.toLowerCase())
                )
            );
        } else {
            return data.filter((item: any) =>
                Object.values(item).some((val) =>
                    String(val).toLowerCase().includes(searchText.toLowerCase())
                )
            );
        }

    }, [data, tableRows, searchText]);






    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    // const [file, setFile] = useState<any>();

    const props: UploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            // setFileList([...fileList, file]);
            // console.log("file", file)
            handleUpload(file);
            // setFile(file)
            return false;
        },
        fileList,
        // onChange(info) {
        //     console.log("onChange: ", info.fileList);
        //     // if (info.fileList.length > 0) {
        //     //     handleUpload(info.fileList[0] as FileType);
        //     // }

        // }
    };
    type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

    const handleUpload = async (file: any) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project', project);
        // formData.append('file_type', component?.file_type)
        formData.append('component_id', component?.component_id)
        // console.log("formData", formData)f
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        // /analysis-result/upload
        try {
            const resp = await axios.post('/analysis-result/upload', formData, {
                timeout: 60000
            })
            message.success(`${resp.data.file_path} file uploaded successfully`);
        } catch (error) {

        }

        setUploading(false);
        reload()



        // fileList.forEach((file) => {
        //     formData.append('files[]', file as FileType);
        // });
        // setUploading(true);
        // You can use any AJAX library you like
        // fetch('https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload', {
        //     method: 'POST',
        //     body: formData,
        // })
        //     .then((res) => res.json())
        //     .then(() => {
        //         setFileList([]);
        //         message.success('upload successfully.');
        //     })
        //     .catch(() => {
        //         message.error('upload failed.');
        //     })
        //     .finally(() => {
        //         setUploading(false);
        //     });
    };

    const getCurrectParent = () => {
        if (!componentParent) return null
        return <Tag closable onClose={() => {
            setComponentParent(undefined)
        }}>
            {componentParent?.file_name}
        </Tag>
    }
    return <>
        <Card size="small"
            variant="borderless"
            style={{
                boxShadow: "none"
            }}
            styles={{
                body: {
                    padding: "0.5rem"
                }
            }}
            title={<Flex gap={"small"}><FileOutlined />

                {component?.component_name && <Tooltip title={<>
                    <ul>
                        {pipeline?.component_id && <li>pipeline: {pipeline?.component_id}</li>}
                        {software?.component_id && <li>software: {software?.component_id}</li>}
                        {component?.component_id && <li>file: {component?.component_id}</li>}
                        {component?.name && <li>name: {component?.name}</li>}
                    </ul>
                </>}>
                    <span
                        onClick={() => {
                            navigate(`/component/file/${component.component_id}`)
                        }}
                        style={{ cursor: "pointer" }}>{title} ({component?.component_name})</span>

                </Tooltip>}

                {component?.file_type && <Tag color="success">{component?.file_type}</Tag>}
            </Flex>}

            extra={<>{cardExtra}

                <Flex gap={"small"} wrap>

                    {/* <Input.Search
                        size="small"
                        placeholder="Search..."
                        allowClear
                        enterButton
                        value={searchText}
                        onChange={(e: any) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    /> */}
                    <Input.Search
                        size="small"
                        placeholder="Search..."
                        allowClear
                        enterButton
                        onSearch={(e: any) => {
                            search(e)
                        }}

                        style={{ width: 300 }}
                    />

                    {/* {(component?.component_type != "file" )&&  <>
                      
                    </>} */}
                    {params?.component_id && <>

                        <Popconfirm title="Confirm adding example?" onConfirm={async () => {
                            await axios.post(`/analysis-result/add-example/${component.component_id}?project=${project}`)
                            message.success("Example added successfully!")
                            reload()
                        }}>
                            <a>Example</a>
                        </Popconfirm>

                        <Tooltip title="Download Example File">

                            <a onClick={async () => {
                                const resp = await axios.get(`/analysis-result/download-example/${component.component_id}`)
                                window.open(`${baseURL}${resp.data.example_url}`, '_blank');
                                message.success(`Example ${baseURL}${resp.data.example_url} downloading...`)
                            }}> <DownloadOutlined /></a>
                        </Tooltip>
                        {/* 
                        {component?.relation_id && <Popconfirm title="Are you sure to delete?" onConfirm={() => {
                            operatePipeline.deletePipelineRelation(component.relation_id)
                        }}>
                            <Tooltip title={`Delete ${component?.component_name}`}>
                                <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
                            </Tooltip>
                        </Popconfirm>} */}

                        <ImportOutlined style={{ cursor: "pointer" }} onClick={() => {
                            openModal("importFile", {
                                ...component,
                                analysisResultParentId: componentParent?.analysis_result_id,
                                operatePipeline: operatePipeline
                            })
                        }} />


                        {component?.file_type != "collected" && <>
                            <a onClick={() => {
                                openModal("createFolder", { ...component })
                            }}>Create Folder</a>

                        </>}

                        {operatePipeline?.openModal && <>
                            {(rest.component_type == "software" || rest.component_type == "file" || rest.component_type == "script") && <>
                                <Dropdown menu={{
                                    items: [

                                        {
                                            key: '4',
                                            label: (<Tooltip title={component?.component_name}>

                                                <a onClick={() => {
                                                    operatePipeline.openModal("modalC", {
                                                        data: undefined,
                                                        structure: {
                                                            relation_type: relationType, //"software_input_file",
                                                            parent_component_id: software.component_id,
                                                            // pipeline_id: pipeline.component_id,
                                                            component_type: "file"
                                                        }
                                                    })
                                                }}>New File</a>
                                            </Tooltip>
                                            )
                                        }, {
                                            key: '3',
                                            label: (
                                                <Tooltip title={component?.component_name}>
                                                    <a onClick={() => {
                                                        operatePipeline.openModal("modalC", {
                                                            data: component, structure: {
                                                                component_type: "file",
                                                            }
                                                        })
                                                    }}>Edit File</a>
                                                </Tooltip>
                                            )
                                        }, {
                                            key: '2',
                                            label: (
                                                <Tooltip title={component?.component_name}>
                                                    <a onClick={() => {
                                                        operatePipeline.openModal("modalA", {
                                                            data: undefined,
                                                            pipelineStructure: {
                                                                relation_type: relationType, //"software_input_file",
                                                                parent_component_id: software.component_id,
                                                                // pipeline_id: pipeline.component_id
                                                            }
                                                        })
                                                    }}>Add File</a>
                                                </Tooltip>

                                            )
                                        }, {
                                            key: '1',
                                            label: (
                                                <Tooltip title={component?.component_name}>
                                                    <a onClick={() => {
                                                        // operatePipeline.setOperateOpen(true)
                                                        // operatePipeline.setPipelineRecord(component)
                                                        // operatePipeline.setPipelineStructure({ pipeline_type: pipelineType })
                                                        operatePipeline.openModal("modalA", {
                                                            data: component,
                                                            pipelineStructure: {
                                                                relation_type: relationType,// "software_input_file",
                                                                // pipeline_id: pipeline.component_id
                                                                // parent_component_id: component.component_id,
                                                                // pipeline_id: component.pipeline_id
                                                            }
                                                        })
                                                    }}>Replace File</a>
                                                </Tooltip>
                                            )
                                        },
                                        {
                                            label: (
                                                <Tooltip title={component?.component_name}>
                                                    <Popconfirm title="Whether to remove file?" onConfirm={() => {
                                                        operatePipeline.deletePipelineRelation(component.relation_id)
                                                    }}>
                                                        {/* <Button size="small" color="cyan" variant="solid" ></Button> */}
                                                        <a>Remove File</a>
                                                    </Popconfirm>
                                                </Tooltip>
                                            ),
                                            key: '0',
                                        },
                                        {
                                            label: (
                                                <Tooltip title={component?.component_name}>
                                                    <Popconfirm title="Whether bind metadata?" onConfirm={async () => {
                                                        await axios.post(`/analysis-result/batch-bind-sample/${component.component_id}?project_id=${project}`)
                                                        message.success("Bind metadata successfully!")
                                                        reload()
                                                    }}>
                                                        <a>Bind metadata</a>
                                                    </Popconfirm>
                                                </Tooltip>
                                            ),
                                            key: '9',
                                        },
                                        {
                                            label: (
                                                <Tooltip title={component?.component_name}>
                                                    <Popconfirm title="Remove all?" onConfirm={async () => {
                                                        await axios.post(`/analysis-result/batch-remove/${component.component_id}?project_id=${project}`)
                                                        message.success("Remove all successfully!")
                                                        reload()
                                                    }}>
                                                        <a>Remove all</a>
                                                    </Popconfirm>
                                                </Tooltip>
                                            ),
                                            key: '10',
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
                            </>}
                        </>}

                        <Popconfirm title="Create metadata?" onConfirm={async () => {
                            await axios.post(`/analysis-result/create-metadata?project_id=${project}&component_id=${component.component_id}`)
                        }}>
                            <PlusCircleOutlined style={{ cursor: "pointer" }} />
                        </Popconfirm>

                        {component?.file_type != "collected" && <EditOutlined style={{ cursor: "pointer" }} onClick={() => {
                            openModal("editTable", {
                                data: data,
                            })
                        }} />}

                        {/* <RedoOutlined style={{ cursor: "pointer"}}  onClick={reload}/> */}
                        <QuestionCircleOutlined onClick={() => {
                            operatePipeline.openModal("descriptionModal", component.description)
                        }} style={{ cursor: "pointer" }} />
                    </>}
                    <RedoOutlined style={{ cursor: "pointer" }} onClick={reload} />


                </Flex>
            </>}


        >

            <>
                {getCurrectParent()}

                {component && <Tag closable onClose={() => {
                    setComponent(undefined)
                    setAnalysisResultId(undefined)

                }}>
                    {component.component_name}
                </Tag>}
            </>
            {/* {analysisResultId} */}


            {/* {analysisResultId} */}
            {component?.file_type == "collected" ? <>


                {data ? <>

                    <Spin spinning={uploading} tip={"Uploading..."}>

                        {(Array.isArray(data) && data.length == 0) ? <>


                            <Dragger {...props} maxCount={1} >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                {/* <p className="ant-upload-hint">
                                Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                                banned files.
                            </p> */}
                            </Dragger>


                            {/* <Button onClick={handleUpload}>aa</Button> */}
                        </>
                            :
                            <>

                                <Tabs

                                    activeKey={analysisResultId}
                                    onChange={(key) => {
                                        // debugger
                                        const currentData = data.filter((it: any) => it.analysis_result_id == key)
                                        if (currentData.length > 0) {
                                            setTableColumns(currentData[0].columns)
                                        }

                                        setAnalysisResultId(key)
                                    }}
                                    tabBarExtraContent={
                                        <Flex gap={"small"}>

                                            <InputNumber size="small" value={rowNum} onChange={(val: any) => setRowNum(val)} />

                                            <Upload {...props}>
                                                <Tooltip title="Upload new file">
                                                    <UploadOutlined style={{ cursor: "pointer" }} />
                                                </Tooltip>

                                            </Upload>

                                            <DownloadOutlined style={{ cursor: "pointer" }} onClick={() => {
                                                const currentData = data.find((it: any) => it.analysis_result_id == analysisResultId)
                                                console.log("currentData", currentData)
                                                window.open(`${baseURL}${currentData.url}`, '_blank');
                                            }} />
                                            <EditOutlined style={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    console.log("analysisResultId", analysisResultId)
                                                    openModal("analysisResultEdit", { analysis_result_id: analysisResultId })
                                                }} />

                                            <Popconfirm title={`Are you sure you want to delete ${analysisResultId}?`} onConfirm={async () => {
                                                await deleteById(analysisResultId)
                                            }}>
                                                <Tooltip title={`Delete current tab ${analysisResultId}`}>
                                                    <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
                                                </Tooltip>
                                            </Popconfirm>
                                            <RedoOutlined style={{ cursor: "pointer" }} onClick={() => loadTable()} />

                                        </Flex>
                                    }
                                    items={data.map((item: any, index: any) => ({
                                        key: item.analysis_result_id,
                                        label: <Tooltip title={`${item?.content} ${item.analysis_result_id}`}>
                                            {`${item?.file_name}`}

                                        </Tooltip>
                                    }))}></Tabs>
                                <Spin spinning={tableRowLoading} tip={"Loading table data..."}>

                                    <div style={{ height: '50vh' }}>
                                        <BigTable shape={tableRowsInfo} rows={[tableColumns,
                                            ...filteredData]} />
                                    </div>
                                </Spin>
                            </>}

                    </Spin>

                </> : <Skeleton active />}




            </> : <>

                <Table
                    // title={()=>}
                    rowKey={(it: any) => it.id}
                    size="small"
                    // bordered
                    // pagination={undefined}
                    pagination={false}
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    columns={columnsParamsALL ? columnsParamsALL : columns}
                    footer={() => <>
                        {totalPage != 0 && <Flex style={{ marginTop: "1rem" }} justify="space-between" align="center">
                            A total of {totalPage} records  &nbsp;
                            <Pagination
                                size="small"
                                current={pageNumber}
                                pageSize={pageSize}
                                total={totalPage}
                                onChange={(p) => setPageNumber(p)}
                                showSizeChanger={false}
                            />
                        </Flex>}
                    </>}
                    // footer={() => `A total of ${filteredData && Array.isArray(filteredData) && filteredData.length} records`}
                    dataSource={data} />

            </>}


            {/* {JSON.stringify(data)} */}


            {component?.parseFormat && component?.relation_type == "software_output_file" && <Typography>
                <pre>
                    {JSON.stringify(component.parseFormat, null, 2)}
                </pre>
            </Typography>}

        </Card>
        {/* <Card style={{ marginBottom: "1rem" }}>
            <Button onClick={loadData}>刷新</Button>
        </Card> */}

        <ImportData
            visible={modal.visible && modal.key == "importFile"}
            params={modal.params}
            callback={reload}
            onClose={closeModal}></ImportData>
        <AnalysisResultLLMLPanel
            visible={modal.visible && modal.key == "llmPanel"}
            params={modal.params}
            onClose={closeModal}
        ></AnalysisResultLLMLPanel>

        <AnalysisResultEdit
            visible={modal.visible && modal.key == "analysisResultEdit"}
            params={modal.params}
            callback={reload}
            onClose={closeModal}
        ></AnalysisResultEdit>

        <EditResultTableModal
            visible={modal.visible && modal.key == "editTable"}
            params={modal.params}
            onClose={closeModal}
            callback={reload}
        ></EditResultTableModal>
        <CreateFolderModal
            visible={modal.visible && modal.key == "createFolder"}
            params={modal.params}
            onClose={closeModal}
            callback={reload}
        ></CreateFolderModal>




    </>

})



// const Test:FC<any> = ()=>{
//     console.log("Test Component Render")
//     return <div>Test Component</div>
// }

export default memo(ResultList);


export const AnalysisResultModal: FC<any> = ({ visible, onClose, params }) => {
    if (!visible) return null
    return <>
        <Modal title="分析结果" open={visible} onCancel={onClose} width={"80%"} >
            {/* {JSON.stringify(params)} */}
            <ResultList {...params} analysisType="sample" ></ResultList>
        </Modal>
    </>
}

const CreateFolderModal: FC<any> = ({ visible, onClose, params, callback }) => {
    // use form create a folder
    const [form] = Form.useForm();
    const { project } = useSelector((state: any) => state.user);

    const message = useGlobalMessage();
    const handleOk = async () => {
        const values = await form.validateFields();
        const reqParams = {
            component_id: params.component_id,
            project: project,
            ...values

        }
        console.log("Create Folder Params:", reqParams);
        // api post /analysis-result/create
        const resp = await axios.post('/analysis-result/create', reqParams)
        message.success("Folder created successfully!")
        onClose()
        if (callback) {
            callback()
        }
    };

    return <>
        <Modal title="Create Folder" open={visible} onCancel={onClose} onOk={handleOk}>
            {/* form with fields:
            file_name: str
            parent_id: Optional[str]=None
            type: str  # 'folder','file'
            component_id: str */}
            <Form form={form} layout="vertical">
                <Form.Item name="type" label="Type" initialValue="folder" rules={[{ required: true, message: 'Please select the type!' }]}>
                    <Select>
                        <Select.Option value="folder">Folder</Select.Option>
                        <Select.Option value="file">File</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="file_name" label="Folder Name" rules={[{ required: true, message: 'Please input the folder name!' }]}>
                    <Input />
                </Form.Item>
                {/* <Form.Item name="parent_id" label="Parent ID">
                    <Input />
                </Form.Item> */}

            </Form>
        </Modal>
    </>

}



