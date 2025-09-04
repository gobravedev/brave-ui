import { Button, Input, Popover, Spin, Table, Image, Typography, Collapse, Flex, Card, Skeleton, Tag, Tabs, Row, Col, Popconfirm, Drawer, Form } from "antd";
import TextArea from "antd/es/input/TextArea";
import { FC, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Markdown from '../markdown'
import axios from "axios";
import LogFile from "../log-file";
import { QuestionCircleOutlined } from "@ant-design/icons"
import { MonacoEditor } from "../react-monaco-editor";
import { useNavigate, useOutletContext } from "react-router";
import { useSSEContext } from "@/context/sse/useSSEContext";
import { findAnalysisById, runAnalysisApi, stopAnalysisApi } from "@/api/analysis";
import { useModal, useModals } from "@/hooks/useModal";
import FormJsonComp from "../form-components";
import ParamsView from "../params-view";
import Project from "@/pages/project";
import BioDatabaseForm from "../bio-database-form";
import BioDatabases from "../bio-databases";


const EditParams: FC<any> = ({ visible, params, onClose, callback }) => {
    useEffect(() => {
        if (visible) {
            loadData()
        }
    }, [params])

    const [data, setData] = useState<any>()
    const [resultData, setResultData] = useState<any>()

    const navigate = useNavigate()
    const [loading, setLoading] = useState<any>()

    const [form] = Form.useForm()
    const { messageApi, project } = useOutletContext<any>()
    const loadAnalysisResult = async (componentIdList: any) => {
        let resp: any = await axios.post(`/analysis-result/list-analysis-result-grouped`, {
            project: project,
            component_ids: componentIdList,
        })
        setResultData(resp.data)
    }
    const loadData = async () => {
        setLoading(true)
        const resp = await axios.get(`/analysis/edit-params/${params}`)
       
        setData(resp.data)
        // await loadAnalysisResult(JSON.parse(resp.data.request_param.data_component_ids))
        setResultData(resp.data.analysis_result)
        form.setFieldsValue(resp.data.request_param)

        setLoading(false)



    }
    const getFirstKey = (resultTableList: any) => {
        if (resultTableList && Object.keys(resultTableList).length > 0) {
            return Object.keys(resultTableList)[0]
        } else {
            return undefined
        }
    }


    // useEffect(() => {
    //     if (data?.request_param) {
    //         form.setFieldsValue(data.request_param)

    //     }
    // }, [form])
    return <>

        <Drawer size="default" loading={loading} title={
            <>

                {data && <>
                    <Tag>{data?.component_name}</Tag>
                    <Tag>{data?.analysis_name}</Tag>
                    <Tag>{String(data?.analysis_id).slice(0, 8)}</Tag>
                </>}

            </>
        } width={"50%"} open={visible} onClose={onClose} >
            {data && <>


                <CreateOrUpdateParsms
                    form={form}
                    requestParam={{...data.request_param,analysis_id:data?.analysis_id}}
                    dataMap={{ ...resultData, first_data_key: getFirstKey(resultData) }}
                    formJson={data.content.formJson}
                    databases={data.content.databases}
                    callback={callback} ></CreateOrUpdateParsms>

            </>}
        </Drawer>


    </>
}

export default EditParams

export const CreateOrUpdateParsms: FC<any> = ({ form, requestParam, dataMap, formJson: formJson_, databases, callback, showCancal = false }) => {
    const { modals, openModals, closeModals } = useModals(["paramsView", "bioDatabases"]);
    const [dbFormJson, setDbFormJson] = useState<any>([])
    const [formJson, setFormJson] = useState<any>([])
    const { messageApi, project } = useOutletContext<any>()

    const initForm = () => {
        if (Array.isArray(formJson_)) {
            const formJson = formJson_.filter((item: any) => !item?.required && !item?.db)
            const dbFormJson = formJson_.filter((item: any) => item?.required || item?.db )
            setDbFormJson(dbFormJson)
            setFormJson(formJson)
        }
    }

    useEffect(() => {
        initForm()
    }, [])
    const getRequestParams = (values: any) => {
        const requestParams = {
            ...requestParam,
            ...values
        }
        return requestParams
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

    return <>
        <Form form={form}>
            {JSON.stringify(requestParam)}
            <Tabs
                // ={true}
                items={[
                    {
                        key: "1",
                        label: "必填参数",
                        forceRender:true,
                        children: <>
                            <FormJsonComp formJson={[{
                                "name": "group_field",
                                "label": "分组列",
                                "rules": [
                                    {
                                        "required": true,
                                        "message": "该字段不能为空!"
                                    }
                                ],
                                "type": "GroupFieldSelect"
                            }, ...dbFormJson]} dataMap={dataMap} ></FormJsonComp>
                            {databases && <BioDatabaseForm openModal={() => {
                                openModals("bioDatabases", databases)
                            }} formJson={databases}></BioDatabaseForm>}
                        </>
                    }, {
                        key: "2",
                        label: "可选参数",
                        forceRender:true,
                        children: <>
                            {/* {data.request_param.data_component_ids} */}
                            <FormJsonComp formJson={formJson} dataMap={{}} ></FormJsonComp>

                            {/* {JSON.stringify(dbFormJson)} */}
                        </>
                    }
                ]}></Tabs>
            <Form.Item label="分析名称" name={"analysis_name"} style={{ maxWidth: 600 }} rules={[{ required: true, message: '该字段不能为空!' }]}>
                <Input></Input>
            </Form.Item>
            <Flex gap={"small"}>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    saveUpstreamAnalysis(false)
                }}>查看参数</Button>

                <Button size="small" color="cyan" variant="solid" onClick={() => saveUpstreamAnalysis(true)}>
                    {requestParam?.analysis_id ? <>更新分析({requestParam.analysis_name})({String(requestParam.analysis_id).slice(0, 8)})</> : <>保存分析</>}</Button>
                {(requestParam?.analysis_id && showCancal) && <Button size="small" color="cyan" onClick={() => form.setFieldValue("analysis_id", undefined)}>取消更新</Button>}
                {/* <Button size="small" color="cyan" variant="solid" onClick={() => saveUpstreamAnalysis(true)}>更新分析</Button> */}
            </Flex>

            <Collapse ghost items={[
                {
                    key: "1",
                    label: "更多",
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
    </>
}