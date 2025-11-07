import { Button, Card, Flex, Input, Popconfirm, Spin, Table, Tabs, Tag, Tooltip, Typography } from "antd"
import axios from "axios"
import { FC, forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { useOutletContext } from "react-router";
import { SyncOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { SSEContextType } from '@/type/sse'
import { readFileApi, readLogFileApi } from "@/api/file-operation";
import { findAnalysisById, runAnalysisApi, stopAnalysisApi } from "@/api/analysis";
import FileBrowser from "../file-browser";
import ResultParse from "../result-parse";
import { useModal } from "@/hooks/useModal";
import { CreateOrUpdatePipelineComponent } from "../create-pipeline";
import React from "react";
import { useSSEContext } from "@/context/sse/useSSEContext";
import { useVirtualizer } from "@tanstack/react-virtual";
import LogFile from "../log-file";
import { ComponentsRender as FileComponentRender } from '../analysis-result-view'
import { Bar, Column } from "@ant-design/plots";
import OpenFile from "../open-file";
import { on } from "events";
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

export const ParamsFile: FC<any> = ({ visible, params, onClose, callback }) => {
    useEffect(() => {
        if (params?.file_path) {
            readFile(params?.file_path)
        }
    }, [params?.file_path])


    // const { messageApi } = useOutletContext<any>()
    const [content, setContent] = useState<any>([])
    const readFile = async (file_path: string, showMessage: boolean = false) => {
        // console.log(currentLogFile)
        const resp = await readFileApi(file_path)
        setContent(resp.data)
        // if (file_path.endsWith(".json")) {
        //     setContent(JSON.stringify(JSON.parse(resp.data), null, 2))
        // } else {
        //     setContent(resp.data)
        // }

    }
    if (!visible) return null
    return <>
        <Card
            size="small"
            title={<Tag color="blue">Path: {params?.file_path}</Tag>}
            extra={<Flex gap={"small"} >
                { onClose && <Button size="small" onClick={onClose} color="blue" variant="solid">Close</Button>}
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    readFile(params?.file_path)
                }}>Refresh</Button>
            </Flex>

            }
            styles={{
                body: { padding: 0 }
            }}
        >
            <FileComponentRender {...content}></FileComponentRender>
            {/* <Typography>
                <pre style={{ margin: 0 }}>
                    {content}
                </pre>
            </Typography> */}
        </Card>
    </>
}

const FileBrowserOutputDir: FC<any> = ({ output_dir, ...rest }) => {
    { JSON.stringify(rest) }
    return <FileBrowser path={output_dir}></FileBrowser>
}




const componentMap: any = {
    // "output_dir": FileBrowserOutputDir,
    "workflow_log_file": LogFile,
    "executor_log_file": LogFile,
    "trace_file": LogFile,
    "command_log_path": LogFile,
    // "params_path": ParamsFile,
    // "command_path": ParamsFile,
    // "result_parse": ResultParse,
    // "analysis_progress": AnalysisProgress
}

const ComponentRender = ({ analysis, file, fileKey }: any) => {
    // console.log("ComponentRender render", fileKey)

    // console.log("fileTabKey", fileTabKey)
    // console.log( fileTabKey)
    const Component = componentMap[fileKey]
    // console.log('Component', componentMap[fileTabKey])
    if (!Component) return <>no component</>
    // if (fileTabKey === "workflow_log_file") {
    //     return <Component {...analysis} content={fileContent.content} setContent={setFileContent} offset={fileContent.offset} file={fileMap[fileTabKey]}/>
    // }
    return <Component {...analysis} file_path={file} file={file} fileKey={fileKey} />
}




export const FileMonitor: FC<any> = memo(({ analysis, callback }) => {

    // console.log("FileMonitor render")
    // const [fileContent, setFileContent] = useState<any>("")
    // const contentRef = useRef<any>(null);
    // const [contentMap, setContentMap] = useState<{ [key: string]: any }>({})

    const [fileTabKey, setFileTabKey] = useState<any>("command_log_path")
    // const { eventSourceRef } = useOutletContext<SSEContextType>();
    // const { eventSourceRef, status, reconnect } = useSSEContext();
    const { messageApi } = useOutletContext<any>()
    const { eventSourceRef, status, reconnect } = useSSEContext();
    // const offsetRef = useRef(0)
    const filekeyRef = useRef<any>(fileTabKey)

    if (!analysis) return null
    const fileMap: any = {
        workflow_log_file: analysis.workflow_log_file,
        executor_log_file: analysis.executor_log_file,
        trace_file: analysis.trace_file,
        params_path: analysis.params_path,
        command_path: analysis.command_path,
        command_log_path: analysis.command_log_path
    }

    const runAnalysis = async () => {
        const res = await runAnalysisApi(analysis?.analysis_id, "job")
        messageApi.success("运行成功")
        // setContentMap((prev: any) => ({
        //     ...prev,
        //     workflow_log_file: {
        //         content: [],
        //         offset: 0
        //     },
        //     executor_log_file: {
        //         content: [],
        //         offset: 0
        //     },
        //     trace_file: {
        //         content: [],
        //         offset: 0
        //     }
        // }))
        // offsetRef.current = 0
        if (callback) {
            callback()
        }
    }
    const items = [
        {
            key: "command_log_path",
            label: <Tooltip title={
                <ul>
                    <li>{analysis?.command_log_path}</li>
                </ul>
            }>
                Run Log
            </Tooltip>
        }, {
            key: "trace_file",
            label: <Tooltip title={
                <ul>
                    <li>{analysis?.trace_file}</li>
                </ul>
            }>
                Progress
            </Tooltip>
        }, {
            key: "workflow_log_file",
            label: <Tooltip title={
                <ul>
                    <li>{analysis?.workflow_log_file}</li>
                </ul>
            }>
                Workflow Log
            </Tooltip>
        },
        {
            key: "executor_log_file",
            label: <Tooltip title={
                <ul>
                    <li>{analysis?.executor_log_file}</li>
                </ul>
            }>
                Executor Log
            </Tooltip>
        },
        // {
        //     key: "params_path",
        //     label: <Tooltip title={
        //         <ul>
        //             <li>{analysis?.params_path}</li>
        //         </ul>
        //     }>
        //         Parameters
        //     </Tooltip>
        // },
        // {
        //     key: "command_path",
        //     label: <Tooltip title={
        //         <ul>
        //             <li>{analysis?.command_path}</li>
        //         </ul>
        //     }>
        //         Command
        //     </Tooltip>
        // },
        // {
        //     key: "output_dir",
        //     label: <Tooltip title={
        //         <ul>
        //             <li>{analysis?.output_dir}</li>
        //         </ul>
        //     }>
        //         Output File
        //     </Tooltip>
        // },
        // {
        //     key: "analysis_progress",
        //     label: <Tooltip title={
        //         <ul>
        //             <li>{analysis?.output_dir}</li>
        //         </ul>
        //     }>
        //         Analysis Visualization
        //     </Tooltip>
        // },
        //  {
        //     key: "result_parse",
        //     label: <Tooltip title={
        //         <ul>
        //             <li>{analysis?.output_dir}</li>
        //         </ul>
        //     }>
        //         Result Parsing
        //     </Tooltip>
        // }
    ]

    return <>
        {/* {JSON.stringify(analysis)} */}
        {/* {JSON.stringify(currentAnalysis)} */}
        <Tabs tabBarExtraContent={
            <Flex gap={"small"} align={"center"}>
                <Tag color="cyan" >{analysis?.job_status}</Tag>
                <Tooltip title={<>
                    {fileMap[fileTabKey]}
                </>}>
                    {/* <Button size="small" color="primary" variant="solid" onClick={() => {
                        readFile(fileTabKey)
                    }}>刷新日志</Button> */}
                </Tooltip>
                {analysis.job_status == "running" ?
                    <>
                        <Popconfirm title={"Stop the job?"} onConfirm={async () => {
                            await stopAnalysisApi(analysis.analysis_id, "job")
                            messageApi.success("Stopped successfully")
                        }}>
                            <Button size="small" color="cyan" variant="solid">
                                Stop
                            </Button>
                        </Popconfirm>
                    </> : <>
                        <Popconfirm title={"Run the job?"} onConfirm={runAnalysis}>
                            <Button size="small" color="cyan" variant="solid">
                                {analysis.analysis_status == "created" ? "Run" : "Re-Run"}
                            </Button>
                        </Popconfirm>
                    </>
                }


            </Flex>

        } activeKey={fileTabKey} onChange={(key) => {
            setFileTabKey(key)
            filekeyRef.current = key

            // setCurrentLogFile(logFileMap[key])
        }} size="small" items={items.map((item: any) => ({
            key: item.key,
            label: item.label,
            children: <ComponentRender file={fileMap[item.key]} fileKey={item.key} analysis={analysis} ></ComponentRender>
        }))
        }></Tabs>
    </>
})



const PipelineInfo: FC<any> = forwardRef<any, any>(({ visible, params, onClose, callback }, ref) => {
    console.log("PipelineInfo Render")
    const submitCallback = async () => {
        loadAnalysis()
        if (callback) {
            callback()
        }
    }

    const { analysis_id: analysisId, ...rest } = params || {}
    const loadAnalysis = async () => {
        if (analysisId) {
            const res = await findAnalysisById(analysisId)
            const analysis = res.data
            setAnalysis(analysis)
        }
    }
    const [analysis, setAnalysis] = useState<any>()
    useImperativeHandle(ref, () => ({
        relaod: loadAnalysis
    }))
    useEffect(() => {
        if (visible) {
            loadAnalysis()
        }
    }, [visible && params?.analysis_id])
    if (!visible) return <>

    </>





    return <>
        <Card
            size="small"
            title={`Process Monitoring ${analysisId}`}
            extra={<>
                <Button size="small" onClick={onClose} color="cyan" variant="solid">关闭</Button>
            </>}>
            <FileMonitor analysis={analysis} callback={submitCallback} loadAnalysis={loadAnalysis}></FileMonitor>
        </Card>


    </>
})



export default memo(PipelineInfo);
