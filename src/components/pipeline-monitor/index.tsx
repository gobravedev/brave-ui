import { Button, Card, Flex, Table, Tabs, Tag, Tooltip, Typography } from "antd"
import axios from "axios"
import { FC, memo, useEffect, useRef, useState } from "react"
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
import { A } from "ollama/dist/shared/ollama.d792a03f.mjs";

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


interface LogFileProps {
    analysis_id: string
    content: { content: string[]; offset: number }
    file: string
    fileKey: string
    setContentMap: any // 可加类型
  }
  
const { Text } = Typography
const LogFile: FC<LogFileProps> = ({ analysis_id, content: contentProps, file, setContentMap, fileKey }) => {
    if (!contentProps) return null
    const { content, offset } = contentProps
    if (!content) return null
  
    const parentRef = useRef<HTMLDivElement>(null)
  
    const virtualizer = useVirtualizer({
      count: content.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 30,
      overscan: 10,
    })
  
    useEffect(() => {
      if (content?.length > 0) {
        virtualizer.scrollToIndex(content.length - 1, { align: "end", behavior: "smooth" })
      }
    }, [content?.length])
  
    const items = virtualizer.getVirtualItems()
  
    return (
      <Card
        size="small"
        title={
          <Flex gap="small" wrap="wrap">
            <Tag color="blue">文件: {file}</Tag>
            <Tag color="purple">偏移量: {offset}</Tag>
            <Tag color="green">分析ID: {analysis_id}</Tag>
          </Flex>
        }
        bodyStyle={{ padding: 0 }}
      >
        <div
          ref={parentRef}
          style={{
            height: 400,
            overflowY: "auto",
            fontFamily: "monospace",
            backgroundColor: "#1e1e1e",
            color: "#d4d4d4",
            padding: "0 12px",
          }}
        >
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: "100%",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${items[0]?.start ?? 0}px)`,
              }}
            >
              {items.map((virtualRow) => (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px solid #333",
                  }}
                >
                  <Flex gap="middle">
                    <Text type="secondary" style={{ width: 60, color: "#d4d4d4" }}>
                      #{virtualRow.index + 1}
                    </Text>
                    <Text style={{ whiteSpace: "pre-wrap", color: "#d4d4d4"}} >{content[virtualRow.index]}</Text>
                  </Flex>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    )
}
const ParamsFile: FC<any> = ({ content }) => {
    return <>
        <Typography>
            <pre style={{ margin: 0 }}>
                {content}
            </pre>
        </Typography>
    </>
}

const PipelineInfo: FC<any> = ({ visible, params, onClose, callback }) => {



    const [analysis, setAnalysis] = useState<any>()

    useEffect(() => {
        if (visible) {
            loadAnalysis()
        }
    }, [params])
    if (!visible) return null

    const { analysis_id: analysisId, ...rest } = params

    const loadAnalysis = async () => {
        const res = await findAnalysisById(analysisId)
        const analysis = res.data
        setAnalysis(analysis)
    }
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


const FileBrowserOutputDir: FC<any> = ({ output_dir ,...rest}) => {
    {JSON.stringify(rest)}
    return <FileBrowser path={output_dir}></FileBrowser>
}

const componentMap: any = {
    "output_dir": FileBrowserOutputDir,
    "workflow_log_file": LogFile,
    "executor_log_file": LogFile,
    "trace_file": LogFile,
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
    return <Component {...analysis} content={contentMap[fileKey]} file={file} setContentMap={setContentMap} fileKey={fileKey} />
}
export const FileMonitor: FC<any> = memo(({ analysis, callback }) => {
    
    // console.log("FileMonitor render")
    // const [fileContent, setFileContent] = useState<any>("")
    // const contentRef = useRef<any>(null);
    const [contentMap, setContentMap] = useState<{ [key: string]: any }>({})

    const [fileTabKey, setFileTabKey] = useState<any>("workflow_log_file")
    // const { eventSourceRef } = useOutletContext<SSEContextType>();
    // const { eventSourceRef, status, reconnect } = useSSEContext();
    const { messageApi } = useOutletContext<any>()
    const { eventSourceRef, status, reconnect } = useSSEContext();
    const offsetRef = useRef(0)
    const filekeyRef = useRef<any>(fileTabKey)
    // const [fileMap, setFileMap] = useState<any>({})

    useEffect(() => {
        if (analysis) {
            if (fileTabKey) {
                
                readFile(fileTabKey)
            }
        }
        
    }, [analysis, fileTabKey])

    useEffect(() => {
        if (analysis && eventSourceRef) {
            const handler = (event: MessageEvent) => {
                const data = JSON.parse(event.data)
                // console.log('fileTabKey',fileTabKey)
                if (data.analysis_id == analysis?.analysis_id) {
                    if (data.msgType == "workflow_log" || data.msgType == "executor_log" || data.msgType == "trace" || data.msgType == "process_end") {
                        readLogFile()
                        if(data.msgType == "process_end"){
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
        }




    }, [eventSourceRef.current,JSON.stringify(analysis)]);
    if (!analysis) return null
    const fileMap: any = {
        workflow_log_file: analysis.workflow_log_file,
        executor_log_file: analysis.executor_log_file,
        trace_file: analysis.trace_file,
        params_path: analysis.params_path,
        command_path: analysis.command_path
    }
    const { analysis_id } = analysis

    // useEffect(() => {
    //     setFileMap({

    //     })
    // }, [JSON.stringify(analysis)])


 
    // const readFile = async (file: string) => {
    //     const res = await readFileApi(file)
    //     return res.data
    // }
    const readFile = async (fileKey: string, showMessage: boolean = false) => {
        // console.log(currentLogFile)

        const file = fileMap[fileKey]
        console.log('fileKey', fileKey, file)
        if (file) {
            let resp: any
            if (fileKey === "workflow_log_file" || fileKey === "executor_log_file" || fileKey === "trace_file") {
                resp = await readLogFileApi(file)
                offsetRef.current = resp.data.offset
            } else {
                resp = await readFileApi(file)
            }



            let res = resp.data
            // let res = await readFile(currentLogFile)
            if (fileKey === "params_path") {
                res = JSON.stringify(JSON.parse(res), null, 2)
            }
            // setFileContent(res)
            setContentMap((prev: any) => ({
                ...prev,
                [fileKey]: res
            }))
            if (showMessage) {
                messageApi.success(`日志加载成功: ${file}`)
            }
        }

    }



    let isLoading = false

    const readLogFile = async () => {
        if (isLoading) return
        isLoading = true
        const fileTabKey = filekeyRef.current
        console.log('readLogFile',fileTabKey, fileMap[fileTabKey], offsetRef.current)

        const resp = await readLogFileApi(fileMap[fileTabKey], offsetRef.current)
        const data = resp.data
        isLoading = false
        // setOffset(data.offset)
        setContentMap((prev: any) => {
            const prevEntry = prev[fileTabKey];

            if (!prevEntry) {
                // 第一次设置
                offsetRef.current = data.offset;
                return {
                    ...prev,
                    [fileTabKey]: {
                        offset: data.offset,
                        content: [...data.content],
                    },
                };
            }

            if (data.offset === prevEntry.offset) {
                return prev;
            }

            offsetRef.current = data.offset;
            const newData = {
                ...prev,
                [fileTabKey]: {
                    offset: data.offset,
                    content: [...prevEntry.content, ...data.content],
                },
            };
            // console.log('newData', newData)
            return newData
        });

    }

    

    // useEffect(() => {
    //     if (!eventSourceRef) return;

    //     const handler = (event: MessageEvent) => {
    //         const data = JSON.parse(event.data)
    //         if (data.msgType === "workflow_log"
    //             || data.msgType === "executor_log"
    //             || data.msgType === "trace"
    //             || data.msgType === "process_end") {
    //             if (data.analysis_id == analysis_id) {
    //                 if (data.msgType === "workflow_log") {
    //                     setFileTabKey("workflow_log_file")
    //                     // console.log("workflow_log_file", data)
    //                     readFile("workflow_log_file")
    //                 } else if (data.msgType === "executor_log") {
    //                     setFileTabKey("executor_log_file")
    //                     readFile("executor_log_file")
    //                 } else if (data.msgType === "trace") {
    //                     setFileTabKey("trace_file")
    //                     readFile("trace_file")
    //                 } else if (data.msgType == "process_end") {
    //                     setFileTabKey("workflow_log_file")
    //                     // console.log("11111111111process_end", data)
    //                     readFile("workflow_log_file")
    //                     if (callback) {
    //                         callback()
    //                     }
    //                 }
    //             }
    //         }

    //     };

    //     eventSourceRef.current?.addEventListener('message', handler);

    //     return () => {
    //         console.log("removeEventListener")
    //         eventSourceRef.current?.removeEventListener('message', handler);
    //     };
    // }, [eventSourceRef.current]);

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
    ]

    return <>

        <Tabs tabBarExtraContent={
            <Flex gap={"small"} align={"center"}>
                <Tooltip title={<>
                    {fileMap[fileTabKey]}
                </>}>
                    <Button size="small" color="primary" variant="solid" onClick={() => {
                        readFile(fileTabKey)
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
export default PipelineInfo