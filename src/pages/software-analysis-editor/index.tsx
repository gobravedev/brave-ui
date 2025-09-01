import { Button, Card, Flex, Popconfirm, Splitter, Tabs, Tag, Tooltip, Typography } from "antd";
import { FC, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router";
import { MonacoEditor } from "@/components/react-monaco-editor";
import { findAnalysisById, monitorAnalysisApi, runAnalysisApi } from "@/api/analysis";
import { readFileApi, writeFileApi } from "@/api/file-operation";
import { current } from "@reduxjs/toolkit";
import { SSEContextType } from '@/type/sse'
import { FileMonitor } from "@/components/pipeline-monitor";
import { CreateOrUpdatePipelineComponent } from "@/components/create-pipeline";
import { useModal } from "@/hooks/useModal";
import { useSSEContext } from "@/context/sse/useSSEContext";
import axios from "axios";

const SoftwareAnalysisEditor: FC<any> = () => {
    const { analysisId } = useParams()
    if (!analysisId) return <div>404</div>
    const navigate = useNavigate()
    const location = useLocation()
    const { location: locationPath } = location.state || {}
    const editorRef = useRef<any>(null)
    const [analysis, setAnalysis] = useState<any>(null)
    const { messageApi } = useOutletContext<any>()

    const [content, setContent] = useState<any>("")
    const [currentFile, setCurrentFile] = useState<any>(null)
    const { eventSourceRef, status, reconnect } = useSSEContext();

    const [contentTabKey, setContentTabKey] = useState<any>("pipeline_script")
    const [contentFileMap, setContentFileMap] = useState<any>({})
    const [format, setFormat] = useState<any>(false)
    useEffect(() => {
        if (eventSourceRef) {
            const handler = (event: MessageEvent) => {
                // console.log('event', event)
                const data = JSON.parse(event.data)
                if (analysisId == data.analysis_id) {
                    // if (fileTabKey == "workflow_log_file") {
                    //     if (data.event_type == "workflow_log" || data.event_type == "executor_log" || data.event_type == "trace" || data.event_type == "process_end") {
                    //         readLogFile()
                    //         if (data.event_type == "process_end") {
                    //             if (callback) {
                    //                 callback()
                    //             }
                    //         }
                    //     }
                    // }else if(fileTabKey == "trace_file"){
                    //     if(data.workflow_event == "on_process_complete"){
                    //         readLogFile()
                    //     }
                    // }
                    if (data.event == "analysis_complete" || data.event == "analysis_failed") {
                        loadAnalysis()
                    }

                }
            };

            eventSourceRef.current?.addEventListener('message', handler);

            return () => {
                console.log("removeEventListener")
                eventSourceRef.current?.removeEventListener('message', handler);
            };
        }




    }, [eventSourceRef.current]);


    const readFile = async (file: string) => {
        const res = await readFileApi(file)
        return res.data
    }
    const writeFile = async () => {
        if (!currentFile) return
        const res = await writeFileApi(currentFile, editorRef.current.getValue())
        messageApi.success("保存成功")
    }


    const loadAnalysis = async () => {
        const res = await findAnalysisById(analysisId)
        const analysis = res.data
        setAnalysis(analysis)
        setCurrentFile(analysis.pipeline_script)
        // setCurrentLogFile(analysis.workflow_log_file)
        setContentFileMap({
            pipeline_script: analysis.pipeline_script,

            script_config_file: analysis.script_config_file,

        })

        // readLogFile(analysis.workflow_log_file)
        // readScriptFile(analysis.pipeline_script)
    }

    useEffect(() => {
        if (currentFile) {
            readScriptFile(currentFile)
        }
    }, [currentFile])



    const readScriptFile = async (currentFile: string, showMessage: boolean = false) => {
        if (currentFile) {
            readFile(currentFile).then(res => {
                setContent(res.data)
                if (showMessage) {
                    messageApi.success(`脚本加载成功: ${currentFile}`)
                }
            })

        }
    }


    // Listen for Ctrl+S and call writeFile
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (typeof writeFile === 'function') {
                    writeFile();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const { modal, openModal, closeModal } = useModal();

    useEffect(() => {
        loadAnalysis()
    }, [])
    return <div>
        {/* {JSON.stringify(analysis)} */}

        {/* {currentLogFile} */}
        <Tabs size="small"
            activeKey={contentTabKey}
            onChange={(key) => {
                setContentTabKey(key)
                setCurrentFile(contentFileMap[key])
                if (key === "params_path") {
                    setFormat(true)
                } else {
                    setFormat(false)
                }
            }}
            tabBarExtraContent={
                <Flex gap={"small"} align={"center"}>
                    <Tag color="cyan">{analysis?.container_name}</Tag>

                    <Tag color="cyan">{analysis?.analysis_status}</Tag>
                    <Tag color="cyan">{analysis?.analysis_name}</Tag>
                    <Popconfirm title="是否生成脚本" onConfirm={async ()=>{
                        await axios.post(`/analysis/convert-ipynb/${analysis.analysis_id}`)
                        messageApi.success("是否生成脚本成功!")
                    }}>
                        <Button size="small" color="cyan" variant="solid">生成脚本</Button>
                    </Popconfirm>

                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                       window.open(`http://10.110.1.11:8888/jupyter/notebooks/${analysis.jupyter_notebook_path}`, "_blank")
                    }}>jupyter</Button>

                    <Tooltip title={<>
                        {currentFile}
                    </>}>
                        <Button size="small" color="cyan" variant="solid" onClick={writeFile}>保存</Button>
                    </Tooltip>

                        
                        

                    <Tooltip title={<>
                        {currentFile}
                    </>}>
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            readScriptFile(currentFile, true)
                        }}>刷新脚本</Button>
                    </Tooltip>

                    <Button size="small" color="cyan" variant="solid" onClick={loadAnalysis}>
                        刷新
                    </Button>
                    
                    {locationPath && (
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            navigate(locationPath)
                        }}>返回</Button>
                    )}
                </Flex>
            }
            items={[
                {
                    key: "pipeline_script",
                    label: <Tooltip title={<>
                        <ul>
                            <li>{analysis?.pipeline_script}</li>
                        </ul>
                    </>}>
                        脚本
                    </Tooltip>
                },

                {
                    key: "script_config_file",
                    label: <Tooltip title={<>
                        <ul>
                            <li>{analysis?.script_config_file}</li>
                        </ul>
                    </>}>
                        脚本配置
                    </Tooltip>
                }
                // {
                //     key: "result",
                //     label: "结果"
                // }
            ]}></Tabs>
        <MonacoEditor format={format} value={content} editorRef={editorRef} defaultLanguage="python" height="50vh" />

        <FileMonitor
            callback={loadAnalysis}
            analysis={analysis}
            operatePipeline={{
                openModal: openModal
            }} />
        {/* <CreateOrUpdatePipelineComponent
            // callback={loadData}
            // pipelineStructure={pipelineStructure}
            // data={record}
            visible={modal.key == "modalC" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdatePipelineComponent> */}


    </div>
}

export default SoftwareAnalysisEditor
