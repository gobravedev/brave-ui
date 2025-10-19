import { useSSEContext } from "@/context/sse/useSSEContext"
import { SSEContextType } from "@/type/sse"
import { Venn } from "@ant-design/plots"
import { Button, Card, Dropdown, Flex, Input, InputNumber, message, Modal, Popconfirm, Popover, Space, Spin, Table, Tabs, Tag, theme, Tooltip, Typography } from "antd"
import axios from "axios"
import { FC, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useOutletContext, useParams } from "react-router"
import { DeleteFilled, DownOutlined, FileOutlined, QuestionCircleOutlined, RedoOutlined } from "@ant-design/icons"
import ImportData from "../import-data"
import { useModal } from "@/hooks/useModal"
export const readHdfsAPi = (contentPath: any) => axios.get(`/api/read-hdfs?path=${contentPath}`)
export const readJsonAPi = (contentPath: any) => axios.get(`/fast-api/read-json?path=${contentPath}`)
// import { List } from "react-window";
// import { getScrollbarSize, List, type RowComponentProps } from "react-window";

// interface LargeDataTableProps {
//     columns: string[];
//     rows: any[][];
// }

// // 每行渲染组件
// function RowComponent({
//     index,
//     style,
//     rows,
// }: RowComponentProps<{
//     rows: any[][];
// }>) {
//     const row = rows[index];
//     return (
//         <div
//             role="row"
//             className="flex flex-row items-center border-b border-gray-200 px-2"
//             style={style}
//         >
//             {row.map((value: any, j: number) => (
//                 <div
//                     key={j}
//                     role="cell"
//                     className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm"
//                 >
//                     {String(value)}
//                 </div>
//             ))}
//         </div>
//     );
// }
// // const  Example2:FC<any> = ({ names })=> {
// //     return (
// //         <List
// //             rowComponent={RowComponent}
// //             rowCount={names.length}
// //             rowHeight={25}
// //         />
// //     );
// // }

// const LargeDataTable: FC<LargeDataTableProps> = ({ columns, rows }) => {
//     const [scrollbarWidth] = useState(getScrollbarSize);

//     return (
//         <div
//             role="table"
//             className="flex flex-col border border-gray-300 rounded-md"
//         >
//             {/* 表头 */}
//             <div
//                 role="rowgroup"
//                 className="flex flex-row bg-gray-100 font-semibold px-2 py-1 border-b border-gray-300"
//             >
//                 <div className="grow flex flex-row items-center gap-2 w-full">
//                     {columns.map((col, i) => (
//                         <div
//                             key={i}
//                             role="columnheader"
//                             className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
//                         >
//                             {col}
//                         </div>
//                     ))}
//                 </div>
//                 {/* 滚动条预留空间 */}
//                 <div className="shrink-0" style={{ width: scrollbarWidth }} />
//             </div>

//             {/* 虚拟滚动主体 */}
//             <div className="overflow-hidden">
//                 <List
//                     //   height={600}
//                     rowCount={rows.length}
//                     rowHeight={35}
//                     rowProps={{ rows }}
//                     rowComponent={RowComponent}
//                 />
//             </div>
//         </div>
//     );
// };
// import { useVirtualizer } from "@tanstack/react-virtual"

// const  Example:FC<any> = ({ addresses }) =>{
//     const [size] = useState(getScrollbarSize);
//     return (
//         <div className="h-55 flex flex-col">
//             <div className="flex flex-row bg-teal-600 p-1 px-2">
//                 <div className="grow flex flex-row items-center gap-2 font-bold">
//                     <div className="flex-1">City</div>
//                     <div className="flex-1">State</div>
//                     <div className="w-10">Zip</div>
//                 </div>
//                 <div className="shrink" style={{ width: size }} />
//             </div>
//             <div className="overflow-hidden">
//                 <List
//                     rowComponent={RowComponent}
//                     rowCount={addresses.length}
//                     rowHeight={25}
//                     rowProps={{ addresses }}
//                 />
//             </div>
//         </div>
//     );
// }
// function RowComponent({
//     index,
//     addresses,
//     style
// }: RowComponentProps<{
//     addresses: any[];
// }>) {
//     const address = addresses[index];
//     return (
//         <div className="flex flex-row items-center gap-2 px-2" style={style}>
//             <div className="flex-1">{address.city}</div>
//             <div className="flex-1">{address.state}</div>
//             <div className="w-10 text-xs">{address.zip}</div>
//         </div>
//     );
// }

// import { List } from "react-window";
// function Example({ names }: { names: string[] }) {
//     return (
//         <List
//             rowComponent={RowComponent}
//             rowCount={names.length}
//             rowHeight={25}
//             rowProps={{ names }}
//         />
//     );
// }
// import { type RowComponentProps } from "react-window";
// function RowComponent({
//     index,
//     names,
//     style
// }: RowComponentProps<{
//     names: string[];
// }>) {
//     return (
//         <div className="flex items-center justify-between" style={style}>
//             {names[index]}
//             <div className="text-slate-500 text-xs">{`${index + 1} of ${names.length}`}</div>
//         </div>
//     );
// }




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
    params,
    ...rest
}, ref) => {
    useImperativeHandle(ref, () => ({
        reload
    }))

    const { project, projectObj } = useOutletContext<any>()

    const [data, setData] = useState<any>([])
    const [groupedData, setGroupedData] = useState<any>()
    // const [content,setContent] = useState<any>()
    const [loading, setLoading] = useState(true)
    // const { eventSource } = useOutletContext<SSEContextType>();
    const { eventSourceRef, status, reconnect } = useSSEContext();
    const { modal, openModal, closeModal } = useModal();
    const [tableRows, setTableRows] = useState<any[]>([])
    const [tableColumns, setTableColumns] = useState<any[]>([])
    const [tableRowLoading, setTableRowLoading] = useState<boolean>(true)
    const [analysisResultId, setAnalysisResultId] = useState<any>()
    const [rowNum, setRowNum] = useState<number>(200)

    useEffect(() => {
        if (!eventSourceRef) return;

        const handler = (event: MessageEvent) => {
            const data = JSON.parse(event.data)
            // console.log("analysis_result", data)
            if (data.msgType === "analysis_result") {
                // message.success(data.msg)
                const componentIdList = analysisMethod.map((it: any) => it.component_id)
                console.log("componentIdList", componentIdList)
                console.log("data.component_id ", data.component_id)
                console.log(" componentIdList.includes(data.component_id) ", componentIdList.includes(data.component_id))
                if (componentIdList.includes(data.component_id)) {
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
    }, [eventSourceRef.current]);
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
        console.log("analysisMethod: ", analysisMethod)
        if (analysisMethod && Array.isArray(analysisMethod)) {

            // const analysisMethodList = analysisMethod.flatMap((it: any) => it.name)
            const componentIdList = analysisMethod.flatMap((it: any) => it.component_id)

            // console.log("componentIdList", componentIdList)
            loadData({ componentIdList: componentIdList })
        } else {
            loadData({ params: params })
        }

    }

    const getCurrentAnalysisMenthod = (activeTabKey: any) => {
        const analysisMethodDict: any = analysisMethod.reduce((acc: any, item: any) => {
            acc[item?.component_id] = item;
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

                setActiveTabKey(analysisMethod[0]?.component_id)
                const currentAnalysisMethod = getCurrentAnalysisMenthod(analysisMethod[0]?.component_id)
                // console.log("currentAnalysisMethod",currentAnalysisMethod)

                setCurrentAnalysisMethod(currentAnalysisMethod)


            }
        }

        reload()

        // initData(currentAnalysisMethod)
    }, [JSON.stringify(params), JSON.stringify(analysisMethod), project, projectObj?.metadata_form])

    const onTabChange = (key: any) => {
        const data = groupedData[key]

        setData(data)
        setActiveTabKey(key)
        const currentAnalysisMethod = getCurrentAnalysisMenthod(key)
        setCurrentAnalysisMethod(currentAnalysisMethod)

        if (data.length > 0) {
            setAnalysisResultId(data[0].analysis_result_id)
            setTableColumns(data[0].columns)
        } else {
            setTableColumns([])
            setAnalysisResultId(undefined)
        }

    }

    // const getKeyMap = () => {
    //     const analysisMethodMap = Object.fromEntries(analysisMethod.map((item: any) => [item.name, item.inputKey]));
    //     // console.log(analysisMethodMap)
    //     const result: any = {};
    //     Object.entries(analysisMethodMap).forEach(([key, values]) => {
    //         if (Array.isArray(values)) {
    //             values.forEach((value: any) => {
    //                 result[value] = key;
    //             });
    //         } else {
    //             result[values] = key;
    //         }


    //     });
    //     return result
    // }

    const loadTable = async () => {
        if (currentAnalysisMethod?.file_type == "collected"  && analysisResultId) {
            setTableRowLoading(true)
            const resp = await axios.get(`/analysis-result/table/${analysisResultId}?row_num=${rowNum}`, {
                timeout: 20000
            })
            setTableRows(resp.data)
            setTableRowLoading(false)
        } else {
            setTableRows([])
        }
    }

    useEffect(() => {

        loadTable()

    }, [analysisResultId])


    const loadData = async ({ analysisMethodValues, params, componentIdList }: any) => {
        setLoading(true)


        if (componentIdList) {
            // const keyMap = getKeyMap()
            // console.log(keyMap)
            let resp: any = await axios.post(`/analysis-result/list-analysis-result-grouped`, {
                project: project,
                // analysis_method: analysisMethodValues,
                component_ids: componentIdList,
                // rows: -1,
                ...params
            })
            const groupedData = resp.data;
            // const groupedData = resp.data.reduce((acc: any, item: any) => {
            //     const key = item.component_id;
            //     // const key = keyMap[item.analysis_method]
            //     if (!acc[key]) {
            //         acc[key] = [];
            //     }
            //     const { sample_name, id, sample_group, ...rest } = item
            //     // debugger
            //     acc[key].push({
            //         label: sample_name,
            //         value: id,
            //         // sample_group: sample_group ? sample_group : "no_group",
            //         sample_name: sample_name,
            //         id: id,
            //         // "aaa":"1111",
            //         ...rest
            //     });
            //     return acc;
            // }, {});
            console.log("groupedData", groupedData)
            if (setResultTableList) {
                // console.log(groupedData)
                setResultTableList(groupedData)
            }
            setGroupedData(groupedData)
            // console.log("activeTabKey: ", activeTabKey)
            let currentData;
            if (activeTabKey) {
                currentData = groupedData[activeTabKey] ? groupedData[activeTabKey] : []

            } else {
                currentData = groupedData[analysisMethod[0]?.component_id] ? groupedData[analysisMethod[0]?.component_id] : []
                // setData(groupedData[analysisMethod[0]?.component_id] ? groupedData[analysisMethod[0]?.component_id] : [])
            }
            setData(currentData)

            if (currentData.length > 0) {
                setAnalysisResultId(currentData[0].analysis_result_id)
                setTableColumns(currentData[0].columns)
            }

        } else {
            let resp: any = await axios.post(`/analysis-result/list-analysis-result`, {
                project: project,
                // analysis_method: analysisMethodValues,
                component_ids: componentIdList,
                ...params
            })
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

    const getMetadataColumns = () => {
        // console.log("projectObj",projectObj?.metadata_form)
        if (!projectObj?.metadata_form || !Array.isArray(projectObj?.metadata_form)) return []
        return projectObj?.metadata_form?.map((item: any) => {
            return {
                title: item.label,
                dataIndex: item.name,
                key: item.name,
                ellipsis: true,
                // render: (text: any, record: any) => {
                //     return <Tooltip title={record[item.name]}>
                //         <span style={{ cursor: "pointer" }}>{text}</span>
                //     </Tooltip>
                // }
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
        },

        {
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
                    <span style={{ cursor: "pointer" }}>{text}</span>
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

        }, {
            title: 'Sample Source',
            dataIndex: 'sample_source',
            key: 'sample_source',
            width: 100,
            ellipsis: true,
        },
        ...getMetadataColumns(),
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
        // {
        //     title: '样本分组',
        //     dataIndex: 'sample_group',
        //     key: 'sample_group',
        //     ellipsis: true,

        // }, 
        // {
        //     title: '样本分组名称',
        //     dataIndex: 'sample_group_name',
        //     key: 'sample_group_name',
        //     ellipsis: true,
        // },

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

        ...appendSampleColumns, {
            title: 'Action',
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
                            if (setRecord) {
                                setRecord(record)
                            }
                            // if (cleanDom) {
                            //     cleanDom(undefined)
                            // }
                            operatePipeline.openModal("openFile", { content: record.content, fileType: record.file_type, description: currentAnalysisMethod.description })

                            // const param = JSON.parse(record.request_param)
                            // console.log(param)
                            // form.resetFields()
                            // form.setFieldsValue(param)
                            // if (record?.id) {
                            //     form.setFieldValue("id", record?.id)
                            // }
                            // readHdfs(record.content)
                        }}>Open</Button>
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
                                }}>Add Metadata</Button>
                            </>
                    }
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        console.log(operatePipeline)
                        operatePipeline.openModals("bindSample", {
                            analysis_result_id: record.analysis_result_id,
                            callback: reload
                        })
                    }}>Bind Sample </Button>
                    <Popconfirm title="Are you sure you want to delete it?" onConfirm={async () => {
                        await deleteById(record.analysis_result_id)
                    }}>
                        <Button size="small" color="danger" variant="solid">Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]
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
            title={<Flex gap={"small"}><FileOutlined /> {title}
                {currentAnalysisMethod?.component_name && <Tooltip title={<>
                    <ul>
                        <li>namespace: {currentAnalysisMethod?.namespace_name}</li>
                        {pipeline?.component_id && <li>pipeline: {pipeline?.component_id}</li>}
                        {software?.component_id && <li>software: {software?.component_id}</li>}
                        {currentAnalysisMethod?.component_id && <li>file: {currentAnalysisMethod?.component_id}</li>}
                        {currentAnalysisMethod?.name && <li>name: {currentAnalysisMethod?.name}</li>}
                    </ul>


                </>}>
                    <span style={{ cursor: "pointer" }}>({currentAnalysisMethod?.component_name})</span>

                </Tooltip>}

                <Tag color="success">{currentAnalysisMethod?.file_type}</Tag>
            </Flex>}

            extra={<>{cardExtra}
                <Flex gap={"small"} wrap>
                    <Input.Search
                        size="small"
                        placeholder="搜索结果..."
                        allowClear
                        enterButton
                        value={searchText}
                        onChange={(e: any) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                    {currentAnalysisMethod?.relation_id && <Popconfirm title="Are you sure to delete?" onConfirm={() => {
                        operatePipeline.deletePipelineRelation(currentAnalysisMethod.relation_id)
                    }}>
                        <Button size="small" color="danger" variant="solid" >Delete {currentAnalysisMethod?.component_name}</Button>
                    </Popconfirm>}

                    {operatePipeline?.openModal && <>
                        {/* <Button size="small" color="cyan" variant="solid" onClick={() => {
                        operatePipeline.openModal("modalA", {
                            data: downstreamData,
                            pipelineStructure: {
                                relation_type: "file_script",
                                // pipeline_id: downstreamData.component_id,

                            }
                        })

                    }}>Replace {item?.component_name}</Button> */}
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            // operatePipeline.openModals("modalD", { ...currentAnalysisMethod, operatePipeline: operatePipeline })
                            openModal("importFile", { ...currentAnalysisMethod, operatePipeline: operatePipeline })
                        }}>Import data </Button>
                        {/* <Popconfirm title="是否计算MD5?" onConfirm={() => {
                                console.log(currentAnalysisMethod.component_id)
                            }}>
                            <Button size="small" color="cyan" variant="solid" >计算MD5</Button>
                        </Popconfirm> */}
                        <Button size="small" color="cyan" variant="solid" onClick={reload}>Refresh</Button>

                        {(rest.component_type == "software" || rest.component_type == "file") && <>
                            <Dropdown menu={{
                                items: [
                                    // {
                                    //     key: '5',
                                    //     label: (<Popconfirm title="是否检查MD5?" onConfirm={() => {
                                    //         console.log(currentAnalysisMethod.component_id)
                                    //     }}>
                                    //         <a >检查MD5</a>
                                    //     </Popconfirm>
                                    //     )
                                    // }, 
                                    {
                                        key: '4',
                                        label: (<Tooltip title={currentAnalysisMethod?.component_name}>

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
                                            }}>Add File</a>
                                        </Tooltip>
                                        )
                                    }, {
                                        key: '3',
                                        label: (
                                            <Tooltip title={currentAnalysisMethod?.component_name}>
                                                <a onClick={() => {
                                                    operatePipeline.openModal("modalC", {
                                                        data: currentAnalysisMethod, structure: {
                                                            component_type: "file",
                                                        }
                                                    })
                                                }}>Edit File</a>
                                            </Tooltip>
                                        )
                                    }, {
                                        key: '2',
                                        label: (
                                            <Tooltip title={currentAnalysisMethod?.component_name}>
                                                <a onClick={() => {
                                                    operatePipeline.openModal("modalA", {
                                                        data: undefined,
                                                        pipelineStructure: {
                                                            relation_type: relationType, //"software_input_file",
                                                            parent_component_id: software.component_id,
                                                            // pipeline_id: pipeline.component_id
                                                        }
                                                    })
                                                }}>New File</a>
                                            </Tooltip>

                                        )
                                    }, {
                                        key: '1',
                                        label: (
                                            <Tooltip title={currentAnalysisMethod?.component_name}>
                                                <a onClick={() => {
                                                    // operatePipeline.setOperateOpen(true)
                                                    // operatePipeline.setPipelineRecord(currentAnalysisMethod)
                                                    // operatePipeline.setPipelineStructure({ pipeline_type: pipelineType })
                                                    operatePipeline.openModal("modalA", {
                                                        data: currentAnalysisMethod,
                                                        pipelineStructure: {
                                                            relation_type: relationType,// "software_input_file",
                                                            // pipeline_id: pipeline.component_id
                                                            // parent_component_id: currentAnalysisMethod.component_id,
                                                            // pipeline_id: currentAnalysisMethod.pipeline_id
                                                        }
                                                    })
                                                }}>Replace File</a>
                                            </Tooltip>
                                        )
                                    },
                                    {
                                        label: (
                                            <Tooltip title={currentAnalysisMethod?.component_name}>
                                                <Popconfirm title="Whether to remove file?" onConfirm={() => {
                                                    operatePipeline.deletePipelineRelation(currentAnalysisMethod.relation_id)
                                                }}>
                                                    {/* <Button size="small" color="cyan" variant="solid" ></Button> */}
                                                    <a>Remove File</a>
                                                </Popconfirm>
                                            </Tooltip>
                                        ),
                                        key: '0',
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

                    {/* <RedoOutlined style={{ cursor: "pointer"}}  onClick={reload}/> */}
                    <QuestionCircleOutlined onClick={() => {
                        operatePipeline.openModal("descriptionModal", currentAnalysisMethod.description)
                    }} style={{ cursor: "pointer" }} />
                </Flex>
            </>}
            tabList={analysisMethod && Array.isArray(analysisMethod) && analysisMethod.length > 1 ?
                analysisMethod.map((it: any) => ({
                    key: it.component_id, label:
                        <Tooltip title={it.component_id}>{it.component_name ? it.component_name : "no_name"}</Tooltip>
                })) : undefined}
            activeTabKey={activeTabKey}
            onTabChange={onTabChange}
        >
            {/* <pre>
                {JSON.stringify(analysisMethod,null,2)}
            </pre> */}

            {/* {JSON.stringify(rest)} */}
            {/* {JSON.stringify(projectObj)} */}
            {/* {JSON.stringify(filteredData)} */}

            {currentAnalysisMethod?.file_type == "collected" ? <>
                {/* {data && <>

                    {data.map((item: any, index: any) => (<div key={index} >

                    </div>))}

                </>} */}
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
                            <Popconfirm title={`Are you sure you want to delete ${analysisResultId}?`} onConfirm={async () => {
                                await deleteById(analysisResultId)
                            }}>
                                <DeleteFilled style={{ cursor: "pointer", color: "red" }} />
                            </Popconfirm>
                            <RedoOutlined style={{ cursor: "pointer" }} onClick={() => loadTable()} />

                        </Flex>
                    }
                    items={data.map((item: any, index: any) => ({
                        key: item.analysis_result_id,
                        label: <Tooltip title={`${item?.content} ${item.analysis_result_id}`}>
                            {`${item?.file_name} (${item?.sample_source})`}

                        </Tooltip>
                    }))}></Tabs>

                <Spin spinning={tableRowLoading}>

                    <div style={{ height: '50vh' }}>
                        <Example rows={[tableColumns.map((it:any)=>it.columns_name),
                            ...tableRows]}  />
                    </div>

                </Spin>


                {/* <App></App> */}
                {/* <Table
                    // title={() => (
                    //     <Input.Search
                    //         size="small"
                    //         placeholder="搜索结果..."
                    //         allowClear
                    //         enterButton
                    //         value={searchText}
                    //         onChange={(e: any) => setSearchText(e.target.value)}
                    //         style={{ width: 300 }}
                    //     />
                    // )}
                    rowKey={(it: any) => it.id}
                    size="small"
                    // bordered
                    // pagination={undefined}
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                    scroll={{ x: 'max-content', y: 55 * 5 }}
                    columns={columnsParamsALL ? columnsParamsALL : columns}
                    footer={() => `A total of ${filteredData && Array.isArray(filteredData) && filteredData.length} records`}
                    dataSource={filteredData} /> */}
            </> : <>

                <Table
                    // title={() => (
                    //     <Input.Search
                    //         size="small"
                    //         placeholder="搜索结果..."
                    //         allowClear
                    //         enterButton
                    //         value={searchText}
                    //         onChange={(e: any) => setSearchText(e.target.value)}
                    //         style={{ width: 300 }}
                    //     />
                    // )}
                    rowKey={(it: any) => it.id}
                    size="small"
                    // bordered
                    // pagination={undefined}
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                    scroll={{ x: 'max-content', y: 55 * 5 }}
                    columns={columnsParamsALL ? columnsParamsALL : columns}
                    footer={() => `A total of ${filteredData && Array.isArray(filteredData) && filteredData.length} records`}
                    dataSource={filteredData} />

            </>}





            {currentAnalysisMethod?.parseFormat && currentAnalysisMethod?.relation_type == "software_output_file" && <Typography>
                <pre>
                    {JSON.stringify(currentAnalysisMethod.parseFormat, null, 2)}
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


import { List } from "react-window";
import { type RowComponentProps } from "react-window";


function Example({ rows, columns }: { rows: any[], columns?: any[] }) {
    const { token } = theme.useToken();

    return (
        <>

            {columns && <Flex
                align="center"
                style={{
                    background: token.colorBgContainerDisabled,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    padding: "0 8px",
                    fontWeight: 500,
                }}
            >
                {Array.isArray(columns) && <>
                    {columns.map((it: any, index: any) => (<span key={index}>
                        <div
                            key={index}
                            style={{
                                flex: "0 0 200px", // ✅ 与表头列宽一致
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                padding: "0 8px",
                            }}
                            title={it.columns_name}
                        >
                            <Tooltip title={it.analysis_result_id}>{it.columns_name}</Tooltip>
                        </div>
                    </span>))}
                </>}

            </Flex>
            }

            <List
                rowComponent={RowComponent}
                rowCount={rows?.length}
                rowHeight={30}
                rowProps={{ rows }}
            />
        </>

    );
}


function RowComponent({
    index,
    rows,
    style
}: RowComponentProps<{ rows: any[] }>) {
    const row = rows[index];
    const { token } = theme.useToken();

    return (
        <Flex
            align="center"
            style={{
                ...style,
                backgroundColor: index % 2 ? token.colorBgContainer : token.colorFillQuaternary,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                padding: "0 8px",
                fontSize: 13,
                minWidth: "fit-content",
                transition: "background-color 0.2s",
            }}
            className="table-row"
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = token.colorFillTertiary;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = index % 2 ? token.colorBgContainer : token.colorFillQuaternary;
            }}
        >
            {row.map((value: any, j: number) => (
                <div
                    key={j}
                    style={{
                        flex: "0 0 200px", // ✅ 与表头列宽一致
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        padding: "0 8px",
                    }}
                    title={String(value)}
                >
                    {String(value)}
                </div>
            ))}
        </Flex>
    );
}
