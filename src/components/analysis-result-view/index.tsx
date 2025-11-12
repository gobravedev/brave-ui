import { Button, Input, Popover, Spin, Table, Image, Typography, Collapse, Flex, Card, Skeleton, Tag, Tabs, Row, Col, Popconfirm, Drawer, Form, Alert, Modal, Tooltip, Divider } from "antd";
import TextArea from "antd/es/input/TextArea";
import { FC, forwardRef, memo, use, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import Markdown from '../markdown'
import axios from "axios";
import LogFile from "../log-file";
import { DeleteOutlined, DownloadOutlined, ExportOutlined, QuestionCircleOutlined, RedoOutlined } from "@ant-design/icons"
import { MonacoEditor } from "../react-monaco-editor";
import { useNavigate, useOutletContext } from "react-router";
import { useSSEContext } from "@/context/sse/useSSEContext";
import { findAnalysisById, runAnalysisApi, stopAnalysisApi } from "@/api/analysis";
import { useModal, useModals } from "@/hooks/useModal";
import FormJsonComp from "../form-components";
import ParamsView from "../params-view";
import Project from "@/pages/project";
import EditParams from '../edit-params'
import { KGMLMapSVG } from "../databases/kegg";
import { download } from "@antv/s2";
import { useSelector } from "react-redux";
import ModuleEdit from "../module-edit";
import { useGlobalMessage } from "@/hooks/useGlobalMessage";
import { CreateOrUpdatePipelineComponent } from "../create-pipeline";
import BigTable from '@/components/big-table';
import { componentMap, ImgView, UrlComp } from './components'
import MicrobiomeSummaryCard from "./components/diff-summary-card";




export const ComponentsRender0 = ({ type, ...rest }: any) => {
    const Component = componentMap[type] || (() => <div>未知类型 {type}</div>)
    return <div style={{ marginBottom: "1rem" }}>
        <Component {...rest} />
    </div>;
}
export const ComponentsRender =  memo(ComponentsRender0)

export const AnalysisResultViewComp: FC<any> = ({ analysis_id, onClose, loadTree, openPanel, overflowY = "hidden" }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [analsyisResult, setAnalsyisResult] = useState<any>(null)
    const navigate = useNavigate()
    // const { eventSourceRef, status, reconnect } = useSSEContext();
    const analysisIdRef = useRef<any>(null)
    const sseAnalysisIdRef = useRef<any>(null)
    // const { messageApi } = useOutletContext<any>()
    const message = useGlobalMessage()
    const { modals, openModals, closeModals } = useModals(["editParams", "moduleEdit", "createOrUpdatePipelineComponent"]);
    const { containerURL, project } = useSelector((state: any) => state.user);
    const [runingLoading, setRuningLoading] = useState<boolean>(false)
    const [form] = Form.useForm();

    const loadData = async (analysis_id: any) => {
        setLoading(true)
        // const res = await axios.get(`/file-operation/visualization-results?path=${output_dir}`)
        const res = await axios.get(`/analysis/visualization-results/${analysis_id}`)

        setAnalsyisResult(res.data)
        form.resetFields()
        form.setFieldsValue(res.data.request_param)
        analysisIdRef.current = analysis_id
        setLoading(false)
    }
    function deepMerge(target: any, source: any) {
        for (const key in source) {
            if (
                source[key] &&
                typeof source[key] === "object" &&
                !Array.isArray(source[key])
            ) {
                // 如果是对象，则递归合并
                if (!target[key] || typeof target[key] !== "object") {
                    target[key] = {};
                }
                deepMerge(target[key], source[key]);
            } else {
                // 否则直接覆盖
                target[key] = source[key];
            }
        }
        return target;
    }
    const buildRequest = (values: any) => {
        const merged = deepMerge({ ...analsyisResult?.request_param }, values);

        const requestParam = {
            analysis_id: analysis_id,
            project: project,
            ...merged,
        }
        return requestParam

    }
    useEffect(() => {
        loadData(analysis_id)
    }, [analysis_id])


    const sseData = useSelector((state: any) => state.global.sseData)
    useEffect(() => {
        // console.log("sseData in result list:", data.msgType)
        const data = sseData
        sseAnalysisIdRef.current = data
        if (analysisIdRef.current == data.analysis_id) {

            if (data.event == "analysis_complete" || data.event == "analysis_failed" || data.event == "analysis_started") {
                loadData(analysisIdRef.current)
            }
        }
    }, [sseData])



    return <>

        <Card size="small"
            style={overflowY == "auto" ? {
                flex: 1,
                display: "flex",
                flexDirection: "column",
                height: " 100%",
                boxShadow: "none"
            } : { boxShadow: "none" }}
            styles={{
                body: {
                    // padding: 0,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    height: " 100%",
                    overflowY: overflowY
                }
            }}
            // style={{ boxShadow: "none" }}
            variant="borderless"
            // bodyStyle={{ padding: 0 }}

            title={<>
                {analsyisResult ? <>
                    <Tag style={{ cursor: "pointer" }} onClick={() => {
                        navigate(`/component/${analsyisResult?.component_type}/${analsyisResult?.component_id}`)
                    }}>{analsyisResult?.component_name}</Tag>
                    <Tag>{analsyisResult?.analysis_name}</Tag>
                    <Tag>{String(analsyisResult?.analysis_id).slice(0, 8)}</Tag>
                    <Tag>{analsyisResult?.job_status}</Tag>
                    {analysisIdRef.current == sseAnalysisIdRef.current?.analysis_id && <Tag> <>{sseAnalysisIdRef.current?.event}</>
                    </Tag>}

                </> : <>

                </>}



            </>}
            extra={
                <Flex gap={"small"} wrap>
                    {onClose && <>
                        <Button size="small" color="blue" variant="solid" onClick={() => onClose()}>Close</Button>
                    </>}
                    {openPanel && <>
                        {analsyisResult && <Button size="small" color="primary" variant="solid" onClick={() =>
                            navigate(`/component/${analsyisResult?.component_type}/${analsyisResult?.component_id}`)
                        }>Go {analsyisResult?.component_type}</Button>}
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            openPanel("note")
                        }}>Open Note</Button>

                    </>}
                    {analsyisResult && <Button size="small" color="cyan" variant="solid" onClick={() => {
                        openModals("createOrUpdatePipelineComponent", {
                            data: {
                                component_id: analsyisResult?.component_id,
                            }, structure: {
                                component_type: analsyisResult?.component_type,
                            }
                        })
                    }}>Edit {analsyisResult?.component_type}</Button>}





                    {analsyisResult && <>
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            openModals("moduleEdit", {
                                component_id: analsyisResult?.component_id,
                            })
                        }}>Component Code</Button>
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            openModals("editParams", analsyisResult.analysis_id)
                        }}>
                            Edit Parameters
                        </Button>


                        {analsyisResult?.job_status == "running" ?
                            <>
                                <Popconfirm title={"Whether or not to stop?"} onConfirm={async () => {
                                    await stopAnalysisApi(analsyisResult.analysis_id, "job")
                                    message.success("Stop Success")

                                }}>
                                    <Button size="small" color="red" variant="solid">
                                        Stop
                                    </Button>
                                </Popconfirm>

                            </> : <>
                                <Popconfirm title={"Whether or not to run?"} onConfirm={async () => {
                                    await runAnalysisApi(analsyisResult.analysis_id, "job")
                                    message.success("run successfully")


                                }}>
                                    <Button size="small" color="cyan" variant="solid">
                                        {analsyisResult.job_status == "created" ? "Run" : "Re-Run"}
                                    </Button>
                                </Popconfirm>

                            </>
                        }
                        {analsyisResult?.server_status == "running" ?
                            <>
{/* 
                                <Tooltip title={<>
                                    {`${containerURL}/container/${analsyisResult.analysis_id}/`}
                                </>}>
                                    <Button size="small" color="blue" variant="solid" onClick={() => {
                                        //  console.log("record", record)

                                        window.open(`${containerURL}/container/${analsyisResult.analysis_id}/`, "_blank")
                                    }}>Open URL</Button>
                                </Tooltip> */}
                                <Popconfirm title={"Whether or not to stop?"} onConfirm={async () => {
                                    // stopAnalysis(record, "server")
                                    await stopAnalysisApi(analsyisResult.analysis_id, "server")
                                }}>
                                    <Button size="small" color="red" variant="solid">
                                        Stop Server
                                    </Button>
                                </Popconfirm>
                                <Tooltip title={<>
                                    {`${containerURL}/container/${analsyisResult.analysis_id}/`}
                                </>}>
                                    <ExportOutlined style={{ cursor: "pointer" }} onClick={() => {

                                        window.open(`${containerURL}/container/${analsyisResult.analysis_id}/`, "_blank")
                                    }} />
                                </Tooltip>


                            </> : <>
                                <Popconfirm title="Whether to start the server?" onConfirm={async () => {
                                    await runAnalysisApi(analsyisResult.analysis_id, "server")
                                }}>
                                    <Button size="small" color="cyan" variant="solid">Run Server</Button>
                                </Popconfirm>

                            </>
                        }
                        <Popconfirm title={analsyisResult?.is_report ? "Whether to cancel the report?" : "Reported or not?"} onConfirm={async () => {
                            await axios.post(`/analysis/update-report/${analsyisResult?.analysis_id}`)
                            message.success("operate successfully!")
                            // setAnalsyisResult(null)
                            loadData(analysis_id)
                            if (loadTree) {
                                loadTree()
                            }
                            // loadData()
                        }}>
                            <Button size="small" color={"cyan"} variant="solid">{analsyisResult?.is_report ? "Cancel Report" : "Report"}</Button>
                        </Popconfirm>
                        {onClose && <Button size="small" color="primary" variant="solid" onClick={() =>
                            navigate(`/analysis-report?key=${analsyisResult?.analysis_id}&project=${project}`)
                        }>Go Report</Button>}

                        <Popconfirm title={`Delete ${analysis_id}?`} onConfirm={async () => {
                            await axios.delete(`/fast-api/analysis/${analysis_id}`)
                            message.success("Deleted Successfully!")
                            if (loadTree) {
                                loadTree()
                            }
                            onClose()
                        }}>
                            <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
                        </Popconfirm>
                    </>}


                    {/* <Button
                        type="link" // 可选：primary / default / text / link
                        color="cyan"
                        icon={<RedoOutlined color="cyan" />}
                        onClick={() => loadData(analysis_id)}

             
                    >

                    </Button> */}

                    <RedoOutlined

                        style={{ cursor: "pointer" }} onClick={() => loadData(analysis_id)} />

                    {/* <Button size="small" color="cyan" variant="solid" onClick={() => loadData(analysis_id)}>Refresh</Button> */}

                </Flex>
            }>

            {/* <div >
                dew<br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />

            </div> */}
            {/* {analysis_id} */}
            <Spin spinning={loading} tip="loading..." style={{ minHeight: "5rem", }}>

                <Row gutter={[8, 8]}

                >
                    <Col lg={16} sm={16} xs={24}>

                        {analsyisResult?.job_status == "failed" ? <div style={{ textAlign: "center" }}>
                            <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
                                <LogFile file_path={analsyisResult?.command_log_path}  ></LogFile>

                            </div>
                        </div> : <>
                            {((analsyisResult?.job_status == "running" && analsyisResult?.run_type != "server")) ? <Skeleton active></Skeleton> : <>


                                {analysis_id && <AnalysisResultDisplay analsyisResult={analsyisResult} loading={loading}></AnalysisResultDisplay>}

                            </>
                            }
                        </>}



                    </Col>
                    <Col lg={8} sm={8} xs={24} style={{}}>
                        {/* <Divider  />  layout="vertical" */}
                        <div style={{ border: "1px solid rgba(5,5,5,0.06)", maxHeight: "70vh", overflowY: "auto", padding: "0.5rem", marginBottom: "1rem" }}>
                            <Form form={form} size="small" layout="vertical"  >
                                {analsyisResult?.form_json && <>


                                    <FormJsonComp formJson={analsyisResult?.form_json} dataMap={{}} ></FormJsonComp>
                                    <Form.Item  >
                                        <Popconfirm
                                            title={"Whether to submit?"}
                                            onConfirm={async () => {
                                                if (analsyisResult?.job_status == "running") {
                                                    message.error("Running, please wait!")
                                                } else {
                                                    const values = buildRequest(await form.validateFields())
                                                    const resp: any = await axios.post(`/fast-api/analysis-controller?save=true&is_submit=true`, values)
                                                    console.log(values)
                                                    message.success("Submit Success!")
                                                }

                                                // // console.log('values', values)
                                                // const requestParam = buildRequest(values)
                                                // // console.log('requestParam', requestParam)
                                                // setAnalsyisResult({
                                                //     ...analsyisResult,
                                                //     request_param: requestParam
                                                // })
                                                // messageApi.success("Update Success")
                                            }}>
                                            <Button disabled={analsyisResult?.job_status == "running"} type="primary" size="small" >Submit</Button>
                                        </Popconfirm>

                                    </Form.Item>
                                    <Collapse ghost items={[
                                        {
                                            key: "1",
                                            label: "More",
                                            children: <>
                                                <Form.Item noStyle shouldUpdate>
                                                    {() => (
                                                        <Typography>
                                                            <pre>{JSON.stringify(buildRequest(form.getFieldsValue()), null, 2)}</pre>
                                                        </Typography>
                                                    )}
                                                </Form.Item>
                                            </>
                                        }
                                    ]} />

                                </>}
                            </Form>
                        </div>

                        {/* {analsyisResult?.params && <ParamsView params={analsyisResult?.params}></ParamsView>} */}


                        {/* <Divider /> */}
                        <div style={{ border: "1px solid rgba(5,5,5,0.06)", maxHeight: "70vh", overflowY: "auto", padding: "0.5rem", marginBottom: "1rem" }}>
                            <Markdown data={analsyisResult?.description}></Markdown>

                        </div>


                    </Col>
                </Row>


            </Spin >

            <EditParams
                callback={() => {
                    loadTree()
                    loadData(analysis_id)
                }}
                visible={modals.editParams.visible}
                params={modals.editParams.params}
                onClose={() => closeModals("editParams")}
            ></EditParams>

            <ModuleEdit
                visible={modals.moduleEdit.visible}
                onClose={() => closeModals("moduleEdit")}
                callback={() => loadData(analysis_id)}
                params={modals.moduleEdit.params}
            >
            </ModuleEdit>
            <CreateOrUpdatePipelineComponent
                callback={() => loadData(analysis_id)}
                // pipelineStructure={pipelineStructure}
                // data={record}
                visible={modals.createOrUpdatePipelineComponent.visible}
                onClose={() => closeModals("createOrUpdatePipelineComponent")}
                params={modals.createOrUpdatePipelineComponent.params}></CreateOrUpdatePipelineComponent>

        </Card >

    </>

}


export default AnalysisResultViewComp

const AnalysisResultDisplay: FC<any> = ({ analsyisResult, loading }) => {
    const { baseURL } = useSelector((state: any) => state.user)
    const { projectObj } = useSelector((state: any) => state.user);

    const { modal, openModal, closeModal } = useModal()

    return <div >
        {analsyisResult && <>

            {analsyisResult.images && <div style={{ padding: "1rem" }}>
                {
                    Array.isArray(analsyisResult.images) ?

                        <Row gutter={[8,8]}>
                            {analsyisResult.images.map((it: any, index: any) => (
                                <Col lg={8} sm={8} xs={24} key={index} span={4}>
                                    <ImgView {...it} baseURL={baseURL}></ImgView>
                                </Col>))}
                        </Row> :
                        <>
                            <ImgView {...analsyisResult.images} baseURL={baseURL}></ImgView>
                        </>
                }
            </div>}

            <div style={{ padding: "1rem" }}>
                {analsyisResult.htmls && Array.isArray(analsyisResult.htmls) && <>
                    {analsyisResult.htmls.map((item: any, index: any) => (
                        <div key={index}>

                            {/* <iframe width={"100%"} height={"1000px"} src={`${baseURL}${item.url}`}></iframe> */}
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                openModal("HtmlPreview", { data: item.url })
                            }}>Open {item.filename}</Button>
                            &nbsp;
                            <UrlComp url={item.url} filename={item.filename} baseURL={baseURL}></UrlComp>

                        </div>

                    ))}
                </>}
            </div>

            {/* <MicrobiomeSummaryCard></MicrobiomeSummaryCard> */}
            <div style={{ padding: "1rem" }}>
                {analsyisResult.tables && Array.isArray(analsyisResult.tables) && <>
                    {analsyisResult.tables.map((item: any, index: any) => (
                        <ComponentsRender projectObj={projectObj} key={index} {...item} baseURL={baseURL}></ComponentsRender>


                    ))}
                </>}
            </div>

        </>}

        <HtmlPreview
            baseURL={baseURL}
            visible={modal.visible && modal.key == "HtmlPreview"}
            onClose={closeModal}
            params={modal.params}
        ></HtmlPreview>
    </div>
}

const HtmlPreview: FC<any> = ({ visible, onClose, params, baseURL }) => {
    return <Modal open={visible} onCancel={onClose} onClose={onClose} width={"80%"} title={"HTML Preview"} footer={null}>
        {params?.data && <>
            <iframe src={`${baseURL}${params?.data}`} width={"100%"} style={{ height: "80vh", border: "none" }}>
            </iframe>
        </>}

    </Modal>
}