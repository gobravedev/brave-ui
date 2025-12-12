import { Button, Input, Popover, Spin, Table, Image, Typography, Collapse, Flex, Card, Skeleton, Tag, Tabs, Row, Col, Popconfirm, Drawer, Form, Tooltip } from "antd";
import TextArea from "antd/es/input/TextArea";
import { FC, forwardRef, lazy, Suspense, useEffect, useImperativeHandle, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useOutletContext } from "react-router";
import CreateOrUpdateParsms from "./create-or-update-parsms";
import { RedoOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
const RenderFromJson = lazy(() => import("./render-form-json"));

const EditParamsPanel: FC<any> = ({ analysis_id, runBtn, callback }) => {
    const [form] = Form.useForm()
    const { messageApi, project } = useOutletContext<any>()
    // const addedProject = Form.useWatch((values: any) => values?.addedProject, form);

    useEffect(() => {
        if (analysis_id) {
            loadData()
        }
    }, [analysis_id])
    // form.()
    const [data, setData] = useState<any>()
    const [resultData, setResultData] = useState<any>()

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
        const resp = await axios.post(`/analysis/edit-params/${analysis_id}`)

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


    const sseData = useSelector((state: any) => state.global.sseData)
    const analysisIdRef = useRef<any>(analysis_id)

    useEffect(() => {
        // console.log("sseData in result list:", data.msgType)
        const data = sseData
        if (analysisIdRef.current == data.analysis_id) {

            if (data.event == "analysis_complete" || data.event == "analysis_failed" || data.event == "analysis_started") {
                loadData()
            }
        }
    }, [sseData])

    const getFirstKey = (resultTableList: any) => {
        if (resultTableList && Object.keys(resultTableList).length > 0) {
            return Object.keys(resultTableList)[0]
        } else {
            return undefined
        }
    }

    const buildFormJson = () => {
        // if (data?.content?.reInputFile) {
        //     if (data?.component_type == "software") {
        //         formJson.push({
        //             "name": "group_field",
        //             "label": "Group Field",
        //             "rules": [
        //                 {
        //                     "required": true,
        //                     "message": "该字段不能为空!"
        //                 }
        //             ],
        //             "type": "GroupFieldSelect"
        //         })
        //     }
        //     return formJson
        //     // data?.component_type == "software" ? {
        //     //     "name": "group_field",
        //     //     "label": "Group Field",
        //     //     "rules": [
        //     //         {
        //     //             "required": true,
        //     //             "message": "该字段不能为空!"
        //     //         }
        //     //     ],
        //     //     "type": "GroupFieldSelect"
        //     // } : []
        //     // ]
        // } else {
        //     const formJson = [...data?.inputFormJson || [], ...data.content?.formJson || [], ...data.content?.upstreamFormJson || []]
        //     if (data?.component_type == "software") {
        //         formJson.push({
        //             "name": "group_field",
        //             "label": "Group Field",
        //             "rules": [
        //                 {
        //                     "required": true,
        //                     "message": "该字段不能为空!"
        //                 }
        //             ],
        //             "type": "GroupFieldSelect"
        //         })
        //     }
        //     return formJson
        // }

        return [...data.formJson || []]

    }

    // useEffect(() => {
    //     if (data?.request_param) {
    //         form.setFieldsValue(data.request_param)

    //     }
    // }, [form])
    return <>
        {(data && !loading) ? <>
            <div>
                <Tag>{data?.component_name}</Tag>
                <Tag color="success">{data?.analysis_name}</Tag>
                <Tooltip title={data?.analysis_id}>
                    <Tag>{String(data?.analysis_id).slice(0, 8)}</Tag>
                </Tooltip>
                <Tag>{data?.job_status}</Tag>
                <RedoOutlined style={{ cursor: "pointer" }} onClick={loadData} />


            </div>

            <CreateOrUpdateParsms
                showCreate={true}
                form={form}
                requestParam={{ ...data.request_param, analysis_id: data?.analysis_id }}
                dataMap={{ ...resultData, first_data_key: getFirstKey(resultData) }}
                formJson={buildFormJson()}
                databases={data?.databases}
                job_status={data?.job_status}
                // inputFormJson={data?.inputFormJson}
                // onChangeAddProject={(value:any)=>{
                //     // loadData(value)
                //     // console.log(value)

                // }}
                upstreamFormJson={data?.upstreamFormJson}
                callback={() => {
                    // loadData()
                    callback && callback()
                }} ></CreateOrUpdateParsms>

        </>:<Skeleton active></Skeleton>}
    </>
}

export default EditParamsPanel