import { Button, Card, Flex, Table, Tabs, Tag, Tooltip } from "antd"
import Typography from "antd/es/typography/Typography";
import axios from "axios"
import { FC, memo, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useOutletContext } from "react-router";
import { SyncOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { SSEContextType } from '@/type/sse'
import { readFileApi } from "@/api/file-operation";
import { findAnalysisById, runAnalysisApi } from "@/api/analysis";
import FileBrowser from "../file-browser";
import ResultParse from "../result-parse";
import { useModal } from "@/hooks/useModal";
import { CreateOrUpdatePipelineComponent } from "../create-pipeline";
import React from "react";
import { useSSEContext } from "@/context/sse/useSSEContext";

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

export const FileMonitor: FC<any> = memo(({ analysis, callback }) => {
    if (!analysis) return null
    // console.log("FileMonitor render")
    const { analysis_id } = analysis
    const [fileContent, setFileContent] = useState<any>("")
    const [fileTabKey, setFileTabKey] = useState<any>("workflow_log_file")
    // const { eventSourceRef } = useOutletContext<SSEContextType>();
    const { eventSourceRef, status, reconnect } = useSSEContext();
    const { messageApi } = useOutletContext<any>()
    const [fileMap, setFileMap] = useState<any>({})
    useEffect(() => {
        setFileMap({
            workflow_log_file: analysis.workflow_log_file,
            executor_log_file: analysis.executor_log_file,
            trace_file: analysis.trace_file,
            params_path: analysis.params_path,
            command_path: analysis.command_path
        })
    }, [analysis])

    const readFile = async (file: string) => {
        const res = await readFileApi(file)
        return res.data
    }
    const readLogFile = async (currentLogFile: string, showMessage: boolean = false) => {
        // console.log(currentLogFile)
        if (currentLogFile) {
            let res = await readFile(currentLogFile)
            if (fileTabKey === "params_path") {
                res = JSON.stringify(JSON.parse(res), null, 2)
            }
            setFileContent(res)
            if (showMessage) {
                messageApi.success(`日志加载成功: ${currentLogFile}`)
            }
        }

    }
    useEffect(() => {
        if (fileTabKey) {
            readLogFile(fileMap[fileTabKey])
        }

    }, [JSON.stringify(fileMap), fileTabKey])
    useEffect(() => {
        if (!eventSourceRef) return;

        const handler = (event: MessageEvent) => {
            const data = JSON.parse(event.data)
            if (data.msgType === "workflow_log" 
                || data.msgType === "executor_log" 
                || data.msgType === "trace" 
                || data.msgType === "process_end") {
                if (data.analysis_id == analysis_id) {
                    if (data.msgType === "workflow_log") {
                        setFileTabKey("workflow_log_file")
                        // console.log("workflow_log_file", data)
                        readLogFile(fileMap["workflow_log_file"])
                    } else if (data.msgType === "executor_log") {
                        setFileTabKey("executor_log_file")
                        readLogFile(fileMap["executor_log_file"])
                    } else if (data.msgType === "trace") {
                        setFileTabKey("trace_file")
                        readLogFile(fileMap["trace_file"])
                    } else if (data.msgType == "process_end") {
                        setFileTabKey("workflow_log_file")
                        // console.log("11111111111process_end", data)
                        readLogFile(fileMap["workflow_log_file"])
                        if (callback) {
                            callback()
                        }
                    }
                }
            }

        };

        eventSourceRef.current?.addEventListener('message', handler);

        return () => {
            console.log("removeEventListener")
            eventSourceRef.current?.removeEventListener('message', handler);
        };
    }, [eventSourceRef]);

    const runAnalysis = async () => {
        const res = await runAnalysisApi(analysis?.analysis_id)
        messageApi.success("运行成功")
        if (callback) {
            callback()
        }
    }
    const componentMap: any = {
        "output_dir": FileBrowser,
        "workflow_log_file": LogFile,
        "executor_log_file": LogFile,
        "trace_file": LogFile,
        "params_path": LogFile,
        "command_path": LogFile,
        "result_parse": ResultParse,
    }

    const ComponentRender = () => {
        // console.log("fileTabKey", fileTabKey)
        const Component = componentMap[fileTabKey]
        if (!Component) return <>no component</>
        return <Component {...analysis} content={fileContent} />
    }
    return <div>
        <Tabs tabBarExtraContent={
            <Flex gap={"small"} align={"center"}>
                <Tooltip title={<>
                    {fileMap[fileTabKey]}
                </>}>
                    <Button size="small" color="primary" variant="solid" onClick={() => {
                        readLogFile(fileMap[fileTabKey])
                    }}>刷新日志</Button>
                </Tooltip>
                <Tooltip title={<>
                    {analysis?.analysis_id}
                </>}>
                    <Button size="small" color="cyan" variant="solid" onClick={runAnalysis}>运行脚本</Button>
                </Tooltip>
            </Flex>

        } activeKey={fileTabKey} onChange={(key) => {
            setFileTabKey(key)
            // setCurrentLogFile(logFileMap[key])
        }} size="small" items={[
            {
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
                key: "trace_file",
                label: <Tooltip title={<>
                    <ul>
                        <li>{analysis?.trace_file}</li>
                    </ul>
                </>}>
                    跟踪日志
                </Tooltip>
            }, {
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
        ]}></Tabs>
        <ComponentRender></ComponentRender>
        {/* {fileTabKey == "output_dir" ? <>

          <OutputDir analysis={analysis} operatePipeline={operatePipeline}></OutputDir>
        </> : <Typography>

            <pre style={{ margin: 0 }}>

                {fileContent}
            </pre>
        </Typography>} */}
        {/* <ComponentRender></ComponentRender> */}
        {/* {JSON.stringify(analysis)} */}
    </div>
}, (prevProps, nextProps) => {
    return JSON.stringify(prevProps?.analysis) === JSON.stringify(nextProps?.analysis)
})

// export const FileMonitor = React.memo(({ analysis, callback, operatePipeline }: any) => {
//     console.log("👶 FileMonitor render");
//     return <FileMonitor0 analysis={analysis} callback={callback} operatePipeline={operatePipeline} />
// },(prevProps,nextProps)=>{  
//     console.log("prevProps",prevProps.analysis.analysis_id === nextProps.analysis.analysis_id)
//     return JSON.stringify(prevProps?.analysis) === JSON.stringify(nextProps?.analysis)
// })
// const MemoChild = React.memo(({ name }: { name: string }) => {
//     console.log("MemoChild render");
//     return <div>子组件：{name}</div>;
//   },(prevProps,nextProps)=>{
//     console.log("prevProps",prevProps.name === nextProps.name)
//     return true
// });

// const OutputDir: FC<any> = React.memo(({ analysis, operatePipeline }) => {
//     return <>
//         <FileBrowser dir={analysis?.output_dir} />
//         <div style={{ marginTop: "1rem" }}></div>
//         <ResultParse analysisId={analysis?.analysis_id} ></ResultParse>
//     </>
// })
const LogFile: FC<any> = ({ content }) => {
    return <>
        <Typography>

            <pre style={{ margin: 0 }}>

                {content}
            </pre>
        </Typography>
    </>
}
const PipelineInfo: FC<any> = ({ visible, params, onClose, callback }) => {

    if (!visible) return null
    const { analysis_id: analysisId, ...rest } = params

    const [analysis, setAnalysis] = useState<any>()
    const loadAnalysis = async () => {
        const res = await findAnalysisById(analysisId)
        const analysis = res.data
        setAnalysis(analysis)
    }
    useEffect(() => {
        loadAnalysis()
    }, [analysisId])


    return <>
        <Card
            title={`流程监控 ${analysisId}`}

            // activeTabKey={activeTabKey}
            extra={<>
                <Button size="small" onClick={onClose} color="cyan" variant="solid">关闭</Button>
            </>}>

            <FileMonitor analysis={analysis} callback={callback}></FileMonitor>
        </Card>


    </>
}
export default PipelineInfo