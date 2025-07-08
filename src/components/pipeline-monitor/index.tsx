import { Button, Card, Flex, Table, Tabs, Tag, Tooltip } from "antd"
import Typography from "antd/es/typography/Typography";
import axios from "axios"
import { FC, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useOutletContext } from "react-router";
import { SyncOutlined, MinusCircleOutlined } from '@ant-design/icons';
import {SSEContextType} from '@/type/sse'
import { readFileApi } from "@/api/file-operation";
import { findAnalysisById, runAnalysisApi } from "@/api/analysis";

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
                    <div style={{textWrap:"wrap"}}>输出路径:{rest.output_dir}</div>
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

export const FileMonitor: FC<any> = ({ analysis,callback }) => {
    if (!analysis) return null
    const { analysis_id } = analysis
    const [fileContent, setFileContent] = useState<any>("")
    const [fileTabKey, setFileTabKey] = useState<any>("workflow_log_file")
    const { eventSource } = useOutletContext<SSEContextType>();
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
             if(fileTabKey === "params_path"){
                res = JSON.stringify(JSON.parse(res),null,2)
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

    }, [JSON.stringify(fileMap),fileTabKey])
    useEffect(() => {
        if (!eventSource) return;

        const handler = (event: MessageEvent) => {
            const data = JSON.parse(event.data)
            
            if (data.analysis_id == analysis_id) {
                if(data.msgType === "workflow_log" ){
                    setFileTabKey("workflow_log_file")
                    console.log("workflow_log_file",data)
                    readLogFile(fileMap["workflow_log_file"])
                }else if(data.msgType === "executor_log" ){
                    setFileTabKey("executor_log_file")
                    readLogFile(fileMap["executor_log_file"])
                }else if(data.msgType === "trace" ){
                    setFileTabKey("trace_file")
                    readLogFile(fileMap["trace_file"])
                }else if(data.msgType=="process_end"){
                    setFileTabKey("workflow_log_file")
                    readLogFile(fileMap["workflow_log_file"])
                    if(callback){
                        callback()
                    }
                }
            }
        };

        eventSource.addEventListener('message', handler);

        return () => {
            console.log("removeEventListener")
            eventSource.removeEventListener('message', handler);
        };
    }, [eventSource]);

    const runAnalysis = async () => {
        const res = await runAnalysisApi(analysis?.analysis_id)
        messageApi.success("运行成功")
        if(callback){
            callback()
        }
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
            }
        ]}></Tabs>

        <Typography>
  
            <pre style={{ margin: 0 }}>

                {fileContent}
            </pre>
        </Typography>
    </div>
}
const PipelineInfo: FC<any> = ({ analysis_id:analysisId,onClose,callback, ...rest }) => {

    if (!rest) return null
    // const [data, setData] = useState<any>()
    // const [activeTabKey, setActiveTabKey] = useState<any>("trace")
    const [analysis, setAnalysis] = useState<any>()
    const loadAnalysis = async () => {
        const res = await findAnalysisById(analysisId)
        const analysis = res.data
        setAnalysis(analysis)
    }
    useEffect(() => {
        loadAnalysis()
    }, [analysisId])
    // const { eventSource } = useOutletContext<SSEContextType>();
    // useEffect(() => {
    //     if (!eventSource) return;

    //     const handler = (event: MessageEvent) => {
    //         const data = JSON.parse(event.data)
    //         console.log(data)
    //         if (data.analysis_id == analysisId) {
    //             if ((data.msgType == "trace" || data.msgType == "process_end") && activeTabKey == "trace") {
    //                 loadData(activeTabKey)
    //                 console.log('子组件监听trace || process_end:', data);
    //             } else if (data.msgType == "workflow_log" && activeTabKey == "workflow_log") {
    //                 loadData(activeTabKey)
    //                 console.log('子组件监听: workflow_log', data);
    //             }
    //         }


    //     };

    //     eventSource.addEventListener('message', handler);

    //     return () => {
    //         console.log("removeEventListener")
    //         eventSource.removeEventListener('message', handler);
    //     };
    // }, [eventSource]);
    // const loadData = async (type: any) => {
    //     console.log(type)
    //     const resp = await axios.get(`/monitor-analysis/${analysisId}?type=${type}`)
    //     setData(resp.data)
    // }
    // const onTabChange = (key: any) => {
    //     // console.log(key)
    //     setData(undefined)
    //     setActiveTabKey(key)
    //     loadData(key)
    // }
    // useEffect(() => {
    //     loadData(activeTabKey)
    // }, [analysisId])
    // const componentMap: any = {
    //     trace: PipelineMonitor,
    //     params: PipelineParams,
    //     workflow_log: PipelineParams,
    //     executor_log: PipelineParams,
    //     script_config: PipelineParams
    // }
    // const ComponentsRender = (params: any) => {
    //     const Component = componentMap[activeTabKey] || (() => <div>未知类型</div>);
    //     return <Component {...params}></Component>
    // }
    return <>
        <Card
            title={`流程监控`}

            // activeTabKey={activeTabKey}
            extra={<>
                <Button size="small" onClick={onClose} color="cyan" variant="solid">关闭</Button>
            </>}>
            {/* {JSON.stringify(rest)} */}
            {/* {JSON.stringify(data)} */}
            {/* <ComponentsRender data={data} type={activeTabKey} {...rest}></ComponentsRender> */}
                <FileMonitor analysis={analysis} callback={callback}></FileMonitor>
        </Card>

        {/* <Tabs items={[
            {
                key: "1",
                label: "流程监控",
                children: <PipelineMonitor data={data}></PipelineMonitor>
            }, {
                key: "2",
                label: "流程参数",
                children: <PipelineParams {...params} type="params"></PipelineParams>
            }, {
                key: "3",
                label: "运行日志",
                children: <PipelineParams {...params} type="workflow_log" ></PipelineParams>
            }, {
                key: "4",
                label: "程序日志",
                children: <PipelineParams {...params} type="executor_log" ></PipelineParams>
            }
        ]}></Tabs> */}
    </>
}
export default PipelineInfo