import { Button, Input, Popover, Spin, Table, Image, Typography, Collapse, Flex, Card, Skeleton, Tag, Tabs, Row, Col, Popconfirm, Drawer, Form, Tooltip } from "antd";
import TextArea from "antd/es/input/TextArea";
import { FC, forwardRef, lazy, Suspense, useEffect, useImperativeHandle, useRef, useState } from "react";
import Markdown from '../markdown'
import axios from "axios";
import LogFile from "../log-file";
import { DeleteColumnOutlined, DeleteOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { MonacoEditor } from "../react-monaco-editor";
import { useNavigate, useOutletContext } from "react-router";
import { useSSEContext } from "@/context/sse/useSSEContext";
import { findAnalysisById, runAnalysisApi, stopAnalysisApi } from "@/api/analysis";
import { useModal, useModals } from "@/hooks/useModal";
// import FormJsonComp from "../form-components";
import ParamsView from "../params-view";
import Project from "@/pages/project";
import BioDatabaseForm from "../bio-database-form";
import BioDatabases from "../bio-databases";
const FormJsonComp = lazy(() => import("../form-components"));

const EditParams: FC<any> = ({ visible, params, onClose, callback }) => {
    const [form] = Form.useForm()
    const { messageApi, project } = useOutletContext<any>()
    // const addedProject = Form.useWatch((values: any) => values?.addedProject, form);

    useEffect(() => {
        if (visible) {
            loadData()
        }
    }, [params])
    // form.()
    const [data, setData] = useState<any>()
    const [resultData, setResultData] = useState<any>()
    const onSubmit = () => {
        onClose()
        if (callback) {
            callback()
        }
    }
    // const navigate = useNavigate()
    const [loading, setLoading] = useState<any>()


    // const loadAnalysisResult = async (componentIdList: any) => {
    //     let resp: any = await axios.post(`/analysis-result/list-analysis-result-grouped`, {
    //         project: project,
    //         component_ids: componentIdList,
    //     })
    //     setResultData(resp.data)
    // }
    const loadData = async () => {
        setLoading(true)
        const resp = await axios.post(`/analysis/edit-params/${params}`)

        setData(resp.data)
        // await loadAnalysisResult(JSON.parse(resp.data.request_param.data_component_ids))
        setResultData(resp.data.analysis_result)
        form.resetFields()
        // console.log(resp.data.request_param)
        form.setFieldsValue(resp.data.request_param)
        form.setFieldValue("anno", 6491)
        // console.log([...resp.data.content?.formJson || [],...resp.data?.inputFormJson || []])
        // console.log(resp.data.content?.formJson)
        // console.log(resp.data?.inputFormJson)
        // setTimeout(() => {
        //     form.setFieldsValue(resp.data.request_param)

        // }, 50);
        setLoading(false)



    }
    const getFirstKey = (resultTableList: any) => {
        if (resultTableList && Object.keys(resultTableList).length > 0) {
            return Object.keys(resultTableList)[0]
        } else {
            return undefined
        }
    }

    const buildFormJson = () => {
        if (data?.content?.reInputFile) {
            return [ ...data?.content?.reInputFile || [],...data.content?.formJson || [], ...data.content?.upstreamFormJson || [],
            data?.component_type == "software" ? {
                "name": "group_field",
                "label": "Group Field",
                "rules": [
                    {
                        "required": true,
                        "message": "该字段不能为空!"
                    }
                ],
                "type": "GroupFieldSelect"
            } : {}
            ]
        } else {
            return [ ...data?.inputFormJson || [],...data.content?.formJson || [], ...data.content?.upstreamFormJson || [],
            data?.component_type == "software" ? {
                "name": "group_field",
                "label": "Group Field",
                "rules": [
                    {
                        "required": true,
                        "message": "该字段不能为空!"
                    }
                ],
                "type": "GroupFieldSelect"
            } : {}
            ]
        }

    }

    // useEffect(() => {
    //     if (data?.request_param) {
    //         form.setFieldsValue(data.request_param)

    //     }
    // }, [form])
    return <>

        <Drawer
            extra={<>

            </>}

            size="default" loading={loading} title={
                <>

                    {data && <>
                        <Tag>{data?.component_name}</Tag>
                        <Tag color="success">{data?.analysis_name}</Tag>
                        <Tooltip title={data?.analysis_id}>
                            <Tag>{String(data?.analysis_id).slice(0, 8)}</Tag>
                        </Tooltip>
                    </>}

                </>
            } width={"50%"} open={visible} onClose={onClose} >
            {/* {JSON.stringify(addedProject)} */}

            {data && <>

                <CreateOrUpdateParsms
                    showCreate={true}
                    form={form}
                    requestParam={{ ...data.request_param, analysis_id: data?.analysis_id }}
                    dataMap={{ ...resultData, first_data_key: getFirstKey(resultData) }}
                    formJson={buildFormJson()}
                    databases={data.content?.databases}
                    // inputFormJson={data?.inputFormJson}
                    // onChangeAddProject={(value:any)=>{
                    //     // loadData(value)
                    //     // console.log(value)

                    // }}
                    upstreamFormJson={data?.upstreamFormJson}
                    callback={onSubmit} ></CreateOrUpdateParsms>

            </>}
        </Drawer>


    </>
}

export default EditParams

export const CreateOrUpdateParsms: FC<any> = ({ form, showCreate = false,
    requestParam, dataMap, formJson: formJson_,
    databases, callback, analysisResultId, showCancal = false }) => {
    const { modals, openModals, closeModals } = useModals(["paramsView", "bioDatabases"]);
    const [dbFormJson, setDbFormJson] = useState<any>([])
    const [formJson, setFormJson] = useState<any>([])
    const { messageApi } = useOutletContext<any>()
    // useEffect(()=>{

    // },[project])
    useEffect(() => {
        initForm()
    }, [JSON.stringify(formJson_)])

    const initForm = () => {
        if (Array.isArray(formJson_)) {
            const formJson = formJson_.filter((item: any) => !item?.required && !item?.db && !item.component_id)
            const dbFormJson = formJson_.filter((item: any) => item?.required || item?.db || item.component_id)
            setDbFormJson(dbFormJson)
            setFormJson(formJson)
        }
    }


    const getRequestParams = (values: any) => {
        const requestParams = {
            ...requestParam,
            ...values
        }
        return requestParams
    }
    const createAnalysis = async () => {
        const values = await form.validateFields()
        const requestParams = getRequestParams(values)
        delete requestParams.analysis_id
        console.log(requestParams)
        try {
            const resp: any = await axios.post(`/fast-api/analysis-controller?save=true&is_submit=true&is_report=true`, requestParams)
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

        try {
            const resp: any = await axios.post(`/fast-api/analysis-controller?save=${save}&is_submit=${is_submit}`, requestParams)
            // setFilePlot(resp.data)
            // setAnalysisParams(resp.data)
            console.log(resp)

            if (save) {
                messageApi.success("执行成功!")
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

    }

    return <Suspense fallback={<Skeleton active></Skeleton>}>
        <Form form={form} onValuesChange={(changedValues, allValues) => {
            // onChange(allFields);
            // console.log(_)
            // if(changedValues?.addedProject){
            //     // console.log(onChangeAddProject)


            // }

        }}>
            {/* {JSON.stringify(formJson_)} */}
            <Tabs
                // ={true}

                items={[
                    {
                        key: "1",
                        label: "Required Parameters",
                        forceRender: true,
                        children: <>

                            <FormJsonComp analysisResultId={analysisResultId} formJson={[...dbFormJson]} dataMap={dataMap} ></FormJsonComp>
                            {databases && <BioDatabaseForm openModal={() => {
                                openModals("bioDatabases", databases)
                            }} formJson={databases}></BioDatabaseForm>}
                        </>
                    }, {
                        key: "2",
                        label: "Optional parameters",
                        forceRender: true,
                        children: <>
                            {/* {data.request_param.data_component_ids} */}
                            <FormJsonComp formJson={[
                                // {
                                //     "name": "addedProject",
                                //     "label": "项目",
                                //     "required": true,
                                //     "mode": "multiple",
                                //     "type": "BaseSelect",
                                //     "data": projectList
                                // },
                                ...formJson
                            ]} dataMap={{}} ></FormJsonComp>

                            {/* {JSON.stringify(dbFormJson)} */}
                        </>
                    }
                ]}></Tabs>
            <Form.Item label="Analysyis Name" name={"analysis_name"} style={{ maxWidth: 600 }} rules={[{ required: true, message: 'This field cannot be empty!' }]}>
                <Input></Input>
            </Form.Item>
            <Flex gap={"small"}>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    saveUpstreamAnalysis(false)
                }}>View Parameters</Button>

                <Button size="small" color="cyan" variant="solid" onClick={() => saveUpstreamAnalysis(true)}>
                    {requestParam?.analysis_id ? <>Update Analysis({requestParam.analysis_name})({String(requestParam.analysis_id).slice(0, 8)})</> : <>Create Analysis</>}</Button>
                {(requestParam?.analysis_id && showCancal) && <Button size="small" color="cyan" onClick={() => form.setFieldValue("analysis_id", undefined)}>Cancel Analysis</Button>}
                {/* <Button size="small" color="cyan" variant="solid" onClick={() => saveUpstreamAnalysis(true)}>更新分析</Button> */}

                {showCreate &&
                    <Popconfirm title="Are you sure to create a new analysis?"
                        onConfirm={createAnalysis}
                    >
                        <Button size="small" color="orange" variant="solid" onClick={() => form.setFieldValue("analysis_id", undefined)}>Create Analysis</Button>
                    </Popconfirm>
                }

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

        <ParamsView

            visible={modals.paramsView.visible}
            onClose={() => closeModals("paramsView")}
            params={modals.paramsView.params}></ParamsView>
        <BioDatabases
            visible={modals.bioDatabases.visible}
            onClose={() => closeModals("bioDatabases")}
            params={modals.bioDatabases.params}></BioDatabases>
    </Suspense>
}