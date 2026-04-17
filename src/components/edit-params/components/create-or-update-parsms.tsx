import { Button, Input, Popover, Spin, Table, Image, Typography, Collapse, Flex, Card, Skeleton, Tag, Tabs, Row, Col, Popconfirm, Drawer, Form, Tooltip, Space, Switch } from "antd";
import TextArea from "antd/es/input/TextArea";
import { FC, forwardRef, lazy, Suspense, useEffect, useImperativeHandle, useRef, useState } from "react";
import Markdown from '@/components/markdown'
import axios from "axios";
import LogFile from "@/components/log-file";
import { DeleteColumnOutlined, DeleteOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { MonacoEditor } from "@/components/react-monaco-editor";
import { useNavigate, useOutletContext } from "react-router";
import { findAnalysisById, runAnalysisApi, stopAnalysisApi } from "@/api/analysis";
import { useModal, useModals } from "@/hooks/useModal";
// import FormJsonComp from "@/components/form-components";
import ParamsView from "@/components/params-view";
import Project from "@/pages/project";
import BioDatabaseForm from "@/components/bio-database-form";
import BioDatabases from "@/components/bio-databases";
import { useSelector } from "react-redux";
import { useStoreRender } from "@/context/render/RenderProvider";
import { ActionDispatcher } from "@/llmv2/dispatcher";
import { useGlobalMessage } from "@/hooks/useGlobalMessage";
const RenderFromJson = lazy(() => import("./render-form-json"));


const CreateOrUpdateParsms: FC<any> = ({ form, showCreate = false,
    requestParam, dataMap, formJson, jobStatus,
    databases, callback, analysisResultId, showCancal = false }) => {
    const { modals, openModals, closeModals } = useModals(["paramsView", "bioDatabases"]);
    const [loading, setLoading] = useState<boolean>(false)
    const messageApi = useGlobalMessage()
    const { project } = useSelector((state: any) => state.user);
    const { setAnalysisId, analysisNodeId, formStatus, setFormStatus } = useStoreRender()

    // const [jobStatus, setJobStatus] = useState<string>(job_status )
    // useEffect(() => {
    //     // setJobStatus(job_status)
    //     jobStatus.current=job_status
    // }, [job_status])

    // useEffect(()=>{

    // },[project])



    const getRequestParams = (values: any) => {
        const requestParams = {
            ...requestParam,
            ...values,
            project: project,
        }
        return requestParams
    }
    const createAnalysis = async () => {
        const values = await form.validateFields()
        const requestParams = getRequestParams(values)
        delete requestParams.analysis_id
        console.log(requestParams)
        try {
            setLoading(true)

            const resp: any = await axios.post(`/fast-api/analysis-controller`, {
                request_param: requestParams,
                is_report: true,
                save: true,
                is_submit: false,
            })
            setLoading(false)
            // setFilePlot(resp.data)
            // setAnalysisParams(resp.data)
            console.log(resp)

            messageApi.success("Created Successfully!")
            if (callback) {
                callback()
            }
        } catch (error: any) {
            console.log(error)
            if (error.response?.data) {
                messageApi.error(error.response.data.detail)
            }
        }
    }
    const saveUpstreamAnalysis = async (save: any, is_submit: any = false) => {
        const values = await form.validateFields()
        const requestParams = getRequestParams(values)
        setLoading(true)
        try {
            // let url = `/fast-api/analysis-controller?save=${save}&is_submit=${is_submit}`
            // if (analysisNodeId){
            //     url = `/fast-api/analysis-node-controller?save=${save}&is_submit=${is_submit}&analysis_node_id=${analysisNodeId}`
            // }
            //             request_param: Dict[str, Any]
            // save: Optional[bool] = False
            // is_submit: Optional[bool] = False
            // is_report: Optional[bool] = None
            // analysis_node_id: Optional[str] = None
            const resp: any = await axios.post(`/fast-api/analysis-controller`, {
                request_param: requestParams,
                save: save,
                is_submit: is_submit,
                analysis_node_id: analysisNodeId
            })
            // setFilePlot(resp.data)
            // setAnalysisParams(resp.data)
            // console.log(resp)
            // if (jobStatus && is_submit) {
            //     // jobStatus.current = "running"

            // }
            if (is_submit) {
                setFormStatus("running")
            }
            if (save) {
                messageApi.success("save successful!")
                // setToolsPanelView("analysisList")
                if (resp.data.analysis_id) {
                    setAnalysisId(resp.data.analysis_id)
                }
                const data = {
                    action: "component.invoke",
                    payload: {
                        category: "tables",
                        id: "analysis-list",
                        method: "reload",
                    }
                }
                ActionDispatcher.dispatch(data.action, data.payload);
                if (callback) {
                    callback()
                }
            } else {
                openModals("paramsView", resp.data)
            }
        } catch (error: any) {
            console.log(error)
            if (error.response?.data) {
                messageApi.error(error.response.data.detail)
            }
        }

        // setAnalysisId()
        setLoading(false)
    }

    return <Suspense fallback={<Skeleton active></Skeleton>}>
        {/* {JSON.stringify(formJson)} */}
        <Spin spinning={loading}>
            <Form size="small" form={form}
                // labelCol={{ span: 8 }}
                // wrapperCol={{ span: 16 }}
                layout="vertical" onValuesChange={(changedValues, allValues) => {
                    // onChange(allFields);
                    // console.log(_)
                    // if(changedValues?.addedProject){
                    //     // console.log(onChangeAddProject)


                    // }

                }}>
                <RenderFromJson
                    analysisResultId={analysisResultId}
                    formJson={formJson}
                    databases={databases}
                    dataMap={dataMap}
                ></RenderFromJson>
                <Form.Item label="Analysyis Name" name={"analysis_name"} style={{ maxWidth: 600 }} rules={[{ required: true, message: 'This field cannot be empty!' }]}>
                    <Input></Input>
                </Form.Item>
                <Flex gap={"small"} justify="space-between">
                    <Button disabled={formStatus == "running"} size="small" color="cyan" variant="solid" onClick={() => saveUpstreamAnalysis(true, true)}>
                        Submit {analysisNodeId ? "Node" : ""}
                    </Button>

                    <Space>
                        <Form.Item
                        noStyle
                            initialValue={false}
                            label="is cache"
                            name={`is_cache`}
                            // tooltip="is cache"
                            valuePropName="checked"
                        >
                            <Switch  size="small" checkedChildren="cache" unCheckedChildren="no-cache" disabled={formStatus == "running"}/>
                        </Form.Item>
                        <Button disabled={formStatus == "running"} size="small" color="cyan" variant="solid" onClick={() => {
                            saveUpstreamAnalysis(false)
                        }}>Parameters</Button>

                        {/* Analysis({requestParam.analysis_name})({String(requestParam.analysis_id).slice(0, 8)}) */}
                        <Button disabled={formStatus == "running"} size="small" color="cyan" variant="solid" onClick={() => saveUpstreamAnalysis(true)}>
                            {requestParam?.analysis_id ? <>Update </> : <>Create</>}</Button>
                        {(requestParam?.analysis_id && showCancal) && <Button size="small" color="cyan" onClick={() => form.setFieldValue("analysis_id", undefined)}>Cancel</Button>}
                        {/* <Button size="small" color="cyan" variant="solid" onClick={() => saveUpstreamAnalysis(true)}>更新分析</Button> */}

                        {showCreate &&
                            <Popconfirm title="Are you sure to create a new analysis?"
                                onConfirm={createAnalysis}
                            >
                                <Button disabled={formStatus == "running"} size="small" color="orange" variant="solid" onClick={() => form.setFieldValue("analysis_id", undefined)}>Copy</Button>
                            </Popconfirm>
                        }
                    </Space>

                </Flex>
                {/* <Form.Item name={"anno1"}>
                <Input></Input>
            </Form.Item>
        <Button onClick={()=>{
                    form.setFieldValue("eggnog", 6491)
                }}> aa</Button> */}
                <Collapse ghost items={[
                    {
                        key: "1",
                        label: "More",
                        children: <>
                            <Form.Item noStyle shouldUpdate>
                                {() => (
                                    <Typography>
                                        <pre>{JSON.stringify(getRequestParams(form.getFieldsValue()), null, 2)}</pre>
                                    </Typography>
                                )}
                            </Form.Item>
                        </>
                    }
                ]} />
            </Form>
        </Spin>


        <ParamsView

            visible={modals.paramsView.visible}
            onClose={() => closeModals("paramsView")}
            params={modals.paramsView.params}></ParamsView>

    </Suspense>
}

export default CreateOrUpdateParsms;