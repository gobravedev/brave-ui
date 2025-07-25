import { Button, Card, Flex, Table, Tabs, Tag, Tooltip, Typography } from "antd"
import axios from "axios"
import { FC, forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { useOutletContext } from "react-router";
import { SyncOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { SSEContextType } from '@/type/sse'
import { readFileApi, readLogFileApi } from "@/api/file-operation";
import { findAnalysisById, runAnalysisApi } from "@/api/analysis";
import FileBrowser from "../file-browser";
import ResultParse from "../result-parse";
import { useModal } from "@/hooks/useModal";
import { CreateOrUpdatePipelineComponent } from "../create-pipeline";
import React from "react";
import { useSSEContext } from "@/context/sse/useSSEContext";
import { useVirtualizer } from "@tanstack/react-virtual";
import LogFile from "../log-file";

const PipelineMonitor: FC<any> = ({ data, ...rest }) => {

    return <>
        {/* {JSON.stringify(data)} */}
        {/* {JSON.stringify(sseData)} */}

        {data && <>
            <Card style={{ marginBottom: "1rem" }}>
                <Flex gap={"small"}>
                    <p>已完成数量: {data?.total} </p>
                    <p>状态: {data.status == "running" ? <>运行中({data.process_id})<Tag icon={<SyncOutlined spin />} color="processing"></Tag></> :
                        <>运行结束<Tag icon={<MinusCircleOutlined />} color="processing"></Tag></>}
                    </p>


                </Flex>
                <div style={{ flexDirection: "column" }}>
                    <div style={{ textWrap: "wrap" }}>输出路径:{rest.output_dir}</div>
                    <div>工作路径:{rest.work_dir}</div>
                </div>

            </Card>
            <Table dataSource={data?.traceTable} rowKey={(row: any) => row.hash} columns={[
                {
                    title: 'hash',
                    dataIndex: 'hash',
                    key: 'hash',
                    ellipsis: true,
                }, {
                    title: 'name',
                    dataIndex: 'name',
                    key: 'name',
                    ellipsis: true,
                }, {
                    title: 'tag',
                    dataIndex: 'tag',
                    key: 'tag',
                    ellipsis: true,
                }, {
                    title: 'status',
                    dataIndex: 'status',
                    key: 'status',
                    ellipsis: true,
                }, {
                    title: 'realtime',
                    dataIndex: 'realtime',
                    key: 'realtime',
                    ellipsis: true,
                },
            ]}></Table>
        </>}

        {/* %cpu:
"2867.4%"
%mem:
"0.8%"
cpus:
30
exit:
0
hash:
"2b/0eb520"
memory:
"50 GB"
name:
"bowtie2 (MTF-18)"
name.1:
"bowtie2 (MTF-18)"
native_id:
3356273
read_bytes:
"668.4 MB"
realtime:
"2m 49s"
rss:
"3.9 GB"
status:
"COMPLETED"
tag:
"MTF-18"
task_id:
6
vmem:
"8.5 GB"
write_bytes:
"6.1 GB" */}
    </>
}

const PipelineParams: FC<any> = ({ data, type }) => {

    if (type == "params") {
        return <>
            <Typography>
                <pre>
                    {JSON.stringify(data, null, 2)}
                </pre>
            </Typography>
        </>
    } else {
        return <>

            <Typography>
                <pre>
                    {typeof data == "string" ? data : JSON.stringify(data, null, 2)}
                </pre>
            </Typography>

        </>
    }

}

const ParamsFile: FC<any> = ({ file_path }) => {
    useEffect(() => {
        if (file_path) {
            readFile(file_path)
        }
    }, [file_path])
    // const { messageApi } = useOutletContext<any>()
    const [content, setContent] = useState<any>([])
    const readFile = async (file_path: string, showMessage: boolean = false) => {
        // console.log(currentLogFile)
        const resp = await readFileApi(file_path)
        if (file_path.endsWith(".json")) {
            setContent(JSON.stringify(JSON.parse(resp.data), null, 2))
        } else {
            setContent(resp.data)
        }

    }
    return <>
        <Card
            title={<Tag color="blue">文件: {file_path}</Tag>}
            extra={
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    readFile(file_path)
                }}>刷新日志</Button>
            }
            bodyStyle={{ padding: 0 }}
        >
            <Typography>
                <pre style={{ margin: 0 }}>
                    {content}
                </pre>
            </Typography>
        </Card>
    </>
}

const FileBrowserOutputDir: FC<any> = ({ output_dir, ...rest }) => {
    { JSON.stringify(rest) }
    return <FileBrowser path={output_dir}></FileBrowser>
}

const componentMap: any = {
    "output_dir": FileBrowserOutputDir,
    "workflow_log_file": LogFile,
    "executor_log_file": LogFile,
    "trace_file": LogFile,
    "command_log_path": LogFile,
    "params_path": ParamsFile,
    "command_path": ParamsFile,
    "result_parse": ResultParse,
}

const ComponentRender = ({ fileTabKey, analysis, contentMap, file, setContentMap, fileKey }: any) => {
    // console.log("ComponentRender render", fileKey)

    // console.log("fileTabKey", fileTabKey)
    // console.log( fileTabKey)
    const Component = componentMap[fileKey]
    // console.log('Component', componentMap[fileTabKey])
    if (!Component) return <>no component</>
    // if (fileTabKey === "workflow_log_file") {
    //     return <Component {...analysis} content={fileContent.content} setContent={setFileContent} offset={fileContent.offset} file={fileMap[fileTabKey]}/>
    // }
    return <Component {...analysis} file_path={file} content={contentMap[fileKey]} file={file} setContentMap={setContentMap} fileKey={fileKey} />
}




export const FileMonitor: FC<any> = memo(({ analysis, callback }) => {

    // console.log("FileMonitor render")
    // const [fileContent, setFileContent] = useState<any>("")
    // const contentRef = useRef<any>(null);
    const [contentMap, setContentMap] = useState<{ [key: string]: any }>({})

    const [fileTabKey, setFileTabKey] = useState<any>("command_log_path")
    // const { eventSourceRef } = useOutletContext<SSEContextType>();
    // const { eventSourceRef, status, reconnect } = useSSEContext();
    const { messageApi } = useOutletContext<any>()
    const { eventSourceRef, status, reconnect } = useSSEContext();
    const offsetRef = useRef(0)
    const filekeyRef = useRef<any>(fileTabKey)
    // const [fileMap, setFileMap] = useState<any>({})

    // useEffect(() => {
    //     if (analysis) {
    //         if (fileTabKey) {

    //             readFile(fileTabKey)
    //         }
    //     }

    // }, [analysis, fileTabKey])

    // useEffect(() => {
    //     if (analysis && eventSourceRef) {
    //         const handler = (event: MessageEvent) => {
    //             console.log('event', event)
    //             const data = JSON.parse(event.data)
    //             // console.log('fileTabKey',fileTabKey)
    //             if (data.analysis_id == analysis?.analysis_id) {
    //                 // if (fileTabKey == "workflow_log_file") {
    //                 //     if (data.event_type == "workflow_log" || data.event_type == "executor_log" || data.event_type == "trace" || data.event_type == "process_end") {
    //                 //         readLogFile()
    //                 //         if (data.event_type == "process_end") {
    //                 //             if (callback) {
    //                 //                 callback()
    //                 //             }
    //                 //         }
    //                 //     }
    //                 // }else if(fileTabKey == "trace_file"){
    //                 //     if(data.workflow_event == "on_process_complete"){
    //                 //         readLogFile()
    //                 //     }
    //                 // }
    //                 if (data.workflow_event == "on_flow_complete") {
    //                     callback()
    //                 }

    //             }
    //         };

    //         eventSourceRef.current?.addEventListener('message', handler);

    //         return () => {
    //             console.log("removeEventListener")
    //             eventSourceRef.current?.removeEventListener('message', handler);
    //         };
    //     }




    // }, [eventSourceRef.current, JSON.stringify(analysis)]);


    if (!analysis) return null
    const fileMap: any = {
        workflow_log_file: analysis.workflow_log_file,
        executor_log_file: analysis.executor_log_file,
        trace_file: analysis.trace_file,
        params_path: analysis.params_path,
        command_path: analysis.command_path,
        command_log_path: analysis.command_log_path
    }
    // const { analysis_id } = analysis

    // useEffect(() => {
    //     setFileMap({

    //     })
    // }, [JSON.stringify(analysis)])



    // const readFile = async (file: string) => {
    //     const res = await readFileApi(file)
    //     return res.data
    // }
    // const readFile = async (fileKey: string, showMessage: boolean = false) => {
    //     // console.log(currentLogFile)

    //     const file = fileMap[fileKey]
    //     console.log('fileKey', fileKey, file)
    //     if (file) {
    //         let resp: any
    //         if (fileKey === "workflow_log_file" || fileKey === "executor_log_file" || fileKey === "trace_file" || fileKey === "command_log_path") {
    //             resp = await readLogFileApi(file)
    //             offsetRef.current = resp.data.offset
    //         } else {
    //             resp = await readFileApi(file)
    //         }



    //         let res = resp.data
    //         // let res = await readFile(currentLogFile)
    //         if (fileKey === "params_path") {
    //             res = JSON.stringify(JSON.parse(res), null, 2)
    //         }
    //         // setFileContent(res)
    //         setContentMap((prev: any) => ({
    //             ...prev,
    //             [fileKey]: res
    //         }))
    //         if (showMessage) {
    //             messageApi.success(`日志加载成功: ${file}`)
    //         }
    //     }

    // }






    const runAnalysis = async () => {
        const res = await runAnalysisApi(analysis?.analysis_id)
        messageApi.success("运行成功")
        setContentMap((prev: any) => ({
            ...prev,
            workflow_log_file: {
                content: [],
                offset: 0
            },
            executor_log_file: {
                content: [],
                offset: 0
            },
            trace_file: {
                content: [],
                offset: 0
            }
        }))
        offsetRef.current = 0
        if (callback) {
            callback()
        }
    }

    const items = [
        {
            key: "command_log_path",
            label: <Tooltip title={<>
                <ul>
                    <li>{analysis?.command_log_path}</li>
                </ul>
            </>}>
                运行日志
            </Tooltip>
        }, {
            key: "trace_file",
            label: <Tooltip title={<>
                <ul>
                    <li>{analysis?.trace_file}</li>
                </ul>
            </>}>
                运行进度
            </Tooltip>
        }, {
            key: "workflow_log_file",
            label: <Tooltip title={<>
                <ul>
                    <li>{analysis?.workflow_log_file}</li>
                </ul>
            </>}>
                工作流日志
            </Tooltip>
        },
        {
            key: "executor_log_file",
            label: <Tooltip title={<>
                <ul>
                    <li>{analysis?.executor_log_file}</li>
                </ul>
            </>}>
                执行器日志
            </Tooltip>
        },
        {
            key: "params_path",
            label: <Tooltip title={<>
                <ul>
                    <li>{analysis?.params_path}</li>
                </ul>
            </>}>
                参数
            </Tooltip>
        },
        {
            key: "command_path",
            label: <Tooltip title={<>
                <ul>
                    <li>{analysis?.command_path}</li>
                </ul>
            </>}>
                命令
            </Tooltip>
        },
        {
            key: "output_dir",
            label: <Tooltip title={<>
                <ul>
                    <li>{analysis?.output_dir}</li>
                </ul>
            </>}>
                输出文件
            </Tooltip>
        }, {
            key: "result_parse",
            label: <Tooltip title={<>
                <ul>
                    <li>{analysis?.output_dir}</li>
                </ul>
            </>}>
                结果解析
            </Tooltip>
        }
    ]

    return <>
        {/* {JSON.stringify(analysis)} */}
        {/* {JSON.stringify(currentAnalysis)} */}
        <Tabs tabBarExtraContent={
            <Flex gap={"small"} align={"center"}>
                <Tag color="cyan" >{analysis?.analysis_status}</Tag>
                <Tooltip title={<>
                    {fileMap[fileTabKey]}
                </>}>
                    {/* <Button size="small" color="primary" variant="solid" onClick={() => {
                        readFile(fileTabKey)
                    }}>刷新日志</Button> */}
                </Tooltip>
                <Tooltip title={<>
                    {analysis?.analysis_id}
                </>}>
                    <Button disabled={analysis.analysis_status == "running"} size="small" color="cyan" variant="solid" onClick={runAnalysis}>
                        {analysis.analysis_status == "created" ? "运行" : "重新运行"}
                    </Button>
                </Tooltip>
            </Flex>

        } activeKey={fileTabKey} onChange={(key) => {
            setFileTabKey(key)
            filekeyRef.current = key

            // setCurrentLogFile(logFileMap[key])
        }} size="small" items={items.map((item: any) => ({
            key: item.key,
            label: item.label,
            children: <ComponentRender file={fileMap[item.key]} fileKey={item.key} analysis={analysis} contentMap={contentMap} setContentMap={setContentMap}></ComponentRender>
        }))
        }></Tabs>
    </>
})



const PipelineInfo: FC<any> = forwardRef<any, any>(({ visible, params, onClose, callback }, ref) => {

    const submitCallback = async () => {
        loadAnalysis()
        if (callback) {
            callback()
        }
    }
    const loadAnalysis = async () => {
        // console.log('11111111111111111params',params)

        const res = await findAnalysisById(analysisId)
        const analysis = res.data
        setAnalysis(analysis)

    }
    const [analysis, setAnalysis] = useState<any>()
    useImperativeHandle(ref, () => ({
        relaod: loadAnalysis
    }))
    useEffect(() => {
        if (visible) {
            loadAnalysis()
        }
    }, [params?.analysis_id])
    if (!visible) return null

    const { analysis_id: analysisId, ...rest } = params




    return <>
        <Card
            title={`流程监控 ${analysisId}`}

            // activeTabKey={activeTabKey}
            extra={<>
                <Button size="small" onClick={onClose} color="cyan" variant="solid">关闭</Button>
            </>}>

            <FileMonitor analysis={analysis} callback={submitCallback} loadAnalysis={loadAnalysis}></FileMonitor>
        </Card>


    </>
})



export default PipelineInfo
