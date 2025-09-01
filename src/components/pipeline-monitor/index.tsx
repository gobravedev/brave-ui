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
        setContent(resp.data)
        // if (file_path.endsWith(".json")) {
        //     setContent(JSON.stringify(JSON.parse(resp.data), null, 2))
        // } else {
        //     setContent(resp.data)
        // }

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

const ColumnChart: FC<any> = ({ data }) => {
    const config = {
        data: data,
        xField: 'task',          // 横轴是任务 ID
        yField: 'realtime',      // 纵轴是运行时间（秒）
        colorField: 'process',   // 按 process 分组
        // isGroup: true,
        // style: {
        //     maxWidth: 50,
        // },
        group: { padding: 0 },
        label: {
            text: (d: any) => d.label,
            textBaseline: 'bottom',
        },
    };

    return <>
        {/* {JSON.stringify(data)} */}
        <Column {...config} />
    </>
};

const ProcessChart: FC<any> = ({ data }) => {
    const processes = Array.from(new Set(data.map((d: any) => d.process)));
    const [selectedProcess, setSelectedProcess] = useState(processes[0]);

    // 筛选出当前 process 的数据
    const filteredData = data.filter((d: any) => d.process === selectedProcess);

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                {processes.map((p: any) => (
                    <Button
                        size="small"
                        key={p}
                        type={p === selectedProcess ? 'primary' : 'default'}
                        onClick={() => setSelectedProcess(p)}
                        style={{ marginRight: 8 }}
                    >
                        {p}
                    </Button>
                ))}
            </div>

            <ColumnChart data={filteredData} />
        </div>
    );
}

const BarChart: FC<any> = ({ data }) => {
    // };
    const config = {
        data: data,
        xField: 'process',
        yField: 'count',
        colorField: 'status',
        stack: true,
        sort: {
            reverse: true,
            by: 'y',
        },
        style: {
            maxWidth: 50,
        },
        // axis: {
        //     y: { labelFormatter: '~s' },
        //     x: {
        //         labelSpacing: 4,
        //         style: {
        //             labelTransform: 'rotate(90)',
        //         },
        //     },
        // },
    };

    return <Bar {...config} />
}

const TaskTable: FC<any> = ({ data }) => {
    // "task_id":1,"tag":"-","container":"192.168.3.60:5001/r-notebook-nf:x86_64-ubuntu-22.04","process":"metaphlan","native_id":219,"workdir":"/data/wangyang/nf_work/a4f4acb2-e119-4a9e-8c59-cdea6bff3df5/55/7068441d5359cffa8b7c1f3306658e","hash":"55/706844","name":"metaphlan (1)","status":"FAILED","exit":"1","realtime":"5.5s","%cpu":"-","cpus":10,"%mem":"-","memory":"10 GB","rss":"-","vmem":"-","read_bytes":"-","write_bytes":"-"},
    const { modal, openModal, closeModal } = useModal();
    const columns: any = [
        {
            title: 'process',
            dataIndex: 'process',
            key: 'process',
            ellipsis: true,
        }, {
            title: 'tag',
            dataIndex: 'tag',
            key: 'tag',
            ellipsis: true,
        }, {
            title: 'name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={<>
                    <ul>
                        <li> {record.workdir} </li>
                    </ul>
                </>}>
                    {text}
                </Tooltip>
            }
        }, {
            title: 'container',
            dataIndex: 'container',
            key: 'container',
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
        }, {
            title: 'cpus',
            dataIndex: 'cpus',
            key: 'cpus',
            ellipsis: true,
            render: (text: any, record: any) => {
                return <Tooltip title={<>
                    {record["%cpu"]}
                </>}>
                    {text}
                </Tooltip>
            }
        }, {
            title: 'memory',
            dataIndex: 'memory',
            key: 'memory',
            ellipsis: true,
            width: 100,
            render: (text: any, record: any) => {
                return <Tooltip title={<>
                    {record["%mem"]}
                </>}>
                    {text}
                </Tooltip>
            }
        }, {
            title: "操作",
            key: "action",
            fixed: "right",
            ellipsis: true,
            width: 200,
            render: (_: any, record: any) => (
                <Flex gap={"small"}>

                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        openModal("openFile", {
                            content: {
                                ".command.sh": `${record.workdir}/.command.sh`,
                                ".command.trace": `${record.workdir}/.command.trace`,
                                ".command.run": `${record.workdir}/.command.run`,
                                ".command.out": `${record.workdir}/.command.out`,
                                ".command.err": `${record.workdir}/.command.err`,
                                ".command.begin": `${record.workdir}/.command.begin`,
                            }
                        })

                    }}>查看</Button>
                </Flex>
            )
        }
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

        <Table
            title={() => (
                <Input.Search
                    size="small"
                    placeholder="搜索任务..."
                    allowClear
                    enterButton
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
            )}
            scroll={{ x: 'max-content', y: 55 * 5 }}
            size="small"
            bordered
            footer={() => `一共${filteredData.length}条记录`}
            // pagination={false}
            columns={columns} dataSource={filteredData} rowKey={(record: any) => record.task_id}></Table>
        {/* {JSON.stringify(data)} */}

        <OpenFile
            visible={modal.key == "openFile" && modal.visible}
            onClose={closeModal}
            params={modal.params}></OpenFile>
    </>
}
const AnalysisProgress: FC<any> = ({ analysis_id }) => {
    const [chartData, setChartData] = useState<any>()
    const [loading, setLoading] = useState<any>(false)

    function parseRealtime(str: any) {
        const minMatch = str.match(/(\d+)m/);
        const secMatch = str.match(/(\d+)s/);
        const minutes = minMatch ? parseInt(minMatch[1]) : 0;
        const seconds = secMatch ? parseInt(secMatch[1]) : 0;
        return minutes * 60 + seconds;
    }

    const loadData = async () => {
        setLoading(true)
        const resp = await axios.get(`/analysis/analysis-progress/${analysis_id}`)
        const grouped: any = {};
        resp.data.forEach((item: any) => {
            const key = `${item.process}-${item.status}`;
            if (!grouped[key]) {
                grouped[key] = { process: item.process, status: item.status, count: 0 };
            }
            grouped[key].count += 1;
        });

        const statusData = Object.values(grouped);
        const timeData = resp.data.map((d: any) => ({
            process: d.process,
            task: d.task_id,
            realtime: parseRealtime(d.realtime),
            label: d.realtime
        }));
        setChartData({
            table: resp.data,
            statusData: statusData,
            timeData: timeData
        })
        setLoading(false)

    }





    useEffect(() => {
        loadData()
    }, [])
    return <div>
        <Flex justify="flex-end" gap={"small"}>
            <Button size="small" color="cyan" variant="solid" onClick={loadData}>刷新</Button>
        </Flex>
        {/* {JSON.stringify(data)} */}

        {chartData &&
            <Tabs
                defaultActiveKey="0"
                onChange={() => {
                    // setTimeout(() => {
                    //     window.dispatchEvent(new Event("resize"));
                    // }, );
                    window.dispatchEvent(new Event("resize"));
                }}
                items={[
                    {
                        key: "0",
                        label: "任务表格",
                        children: <TaskTable data={chartData?.table || []}></TaskTable>
                    }, {
                        key: "1",
                        label: "任务状态",
                        children: <BarChart data={chartData?.statusData || []}></BarChart>
                    }, {
                        key: "2",
                        label: "运行时间",
                        children: <ProcessChart data={chartData?.timeData || []}></ProcessChart>
                    }
                ]}></Tabs>
        }

    </div>
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
    "analysis_progress": AnalysisProgress
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
            key: "analysis_progress",
            label: <Tooltip title={<>
                <ul>
                    <li>{analysis?.output_dir}</li>
                </ul>
            </>}>
                分析可视化
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
                {analysis.analysis_status == "running" ?
                    <>
                        <Popconfirm title={"是否停止!"} onConfirm={async () => {
                                await stopAnalysisApi(analysis.analysis_id)
                                messageApi.success("停止成功")

                        }}>
                            <Button size="small" color="cyan" variant="solid">
                                停止
                            </Button>
                        </Popconfirm>

                    </> : <>
                        <Popconfirm title={"是否运行!"} onConfirm={runAnalysis}>
                            <Button size="small" color="cyan" variant="solid">
                                {analysis.analysis_status == "created" ? "运行" : "重新运行"}
                            </Button>
                        </Popconfirm>

                    </>
                }


                {/* <Tooltip title={<>
                    {analysis?.analysis_id}
                </>}>
                    <Button disabled={analysis.analysis_status == "running"} size="small" color="cyan" variant="solid" onClick={runAnalysis}>
                        {analysis.analysis_status == "created" ? "运行" : "重新运行"}
                    </Button>
                </Tooltip> */}
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
    console.log("loading PipelineInfo...")
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
    }, [visible && params?.analysis_id])
    if (!visible) return <>
        {/* 无数据....... */}
    </>

    const { analysis_id: analysisId, ...rest } = params




    return <>
        <Card
            size="small"
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
