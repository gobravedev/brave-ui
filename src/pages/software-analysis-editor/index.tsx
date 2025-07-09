import { Button, Card, Flex, Splitter, Tabs, Tooltip, Typography } from "antd";
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

    const [contentTabKey, setContentTabKey] = useState<any>("pipeline_script")
    const [contentFileMap, setContentFileMap] = useState<any>({})
    const [format, setFormat] = useState<any>(false)

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
                setContent(res)
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
                    {analysis?.analysis_name}
                    <Tooltip title={<>
                        {currentFile}
                    </>}>
                        <Button color="cyan" variant="solid" onClick={writeFile}>保存</Button>
                    </Tooltip>


                    <Tooltip title={<>
                        {currentFile}
                    </>}>
                        <Button color="cyan" variant="solid" onClick={() => {
                            readScriptFile(currentFile, true)
                        }}>刷新脚本</Button>
                    </Tooltip>

                    {locationPath && (
                        <Button color="cyan" variant="solid" onClick={() => {
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

        <FileMonitor analysis={analysis} operatePipeline={ {
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
