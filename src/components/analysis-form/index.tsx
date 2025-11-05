import { Button, Collapse, Flex, Form, Input, message, Select, Switch, Typography, Watermark } from "antd";
import axios from "axios";
import { FC, useEffect, useState } from "react";
import FormJsonComp from "../form-components";
import { listAnalysisFiles } from '@/api/analysis-software'
import { useOutletContext } from "react-router";
import BioDatabaseForm from "../bio-database-form";
import { CreateOrUpdateParsms } from "../edit-params";

export const AnalysisForm: FC<any> = ({
    pipeline,
    form,
    resultTableList,
    operatePipeline,
    // activeTabKey,
    formJson,
    formDom,
    params,
    sampleGroupApI,
    setPlotLoading,
    inputAnalysisMethod,
    saveAnalysisMethod,
    project,
    setFilePlot,
    plotReloadTable,
    callback,
    dataComponentIds,
    name,
    analysisResultId,
    ...rest
}) => {
    const formId = Form.useWatch((values: any) => values?.analysis_id, form);
    const formValues = Form.useWatch((values: any) => values, form);
    const [sampleGroup, setSampleGroup] = useState<any>([])
    const [tableType, setTableType] = useState<any>("xlsx")
    const [imgType, setImgType] = useState<any>("pdf")

    const [messageApi, contextHolder] = message.useMessage();

    const getSampleGroup = async () => {
        try {
            const resp: any = await axios.post(`/fast-api/find-sample`, {
                "project": "hexiaoyan",
                "sequencing_target": "DNA",
                "sequencing_technique": "NGS",
                "sample_composition": "meta_genome"
            })
            const data = resp.data.map((it: any) => {
                return {
                    label: it.sample_key,
                    value: it.sample_key,
                    sample_group: it.sample_group,
                    sample_source: it.sample_source,
                    host_disease: it.host_disease,
                }
            })
            setSampleGroup(data)
        } catch (error: any) {
            console.log(error)
        }
    }

    useEffect(() => {
        form.resetFields()
    }, [project])

    // const getData = async (inputAnalysisMethod:any)=>{
    // }


    // const group_field = [
    //     {
    //         label: "样本分组",
    //         value: "sample_group"
    //     }, {
    //         label: "样本分组名称",
    //         value: "sample_group_name"
    //     }, {
    //         label: "样本来源",
    //         value: "sample_source"
    //     }, {
    //         label: "宿主疾病",
    //         value: "host_disease"
    //     }
    // ]
    const dataMap_ = {
        // "sample_group_list": sampleGroup,
        "first_data_key": undefined,

    }
    const [dataMap, setDataMap] = useState<any>(dataMap_)



    useEffect(() => {
        if (name) {
            form.setFieldValue("analysis_name", name)
        }
    }, [name])
    const getFirstKey = (resultTableList: any) => {
        if (resultTableList && Object.keys(resultTableList).length > 0) {
            return Object.keys(resultTableList)[0]
        } else {
            return undefined
        }
    }
    const loadData = async (analysisMetnodNames: any) => {

        const data = await listAnalysisFiles({ project: project, analysisFileNames: analysisMetnodNames })
        const groupedData = data.reduce((acc: any, item: any) => {
            const key = item.analysis_method;
            // const key = keyMap[item.analysis_method]
            if (!acc[key]) {
                acc[key] = [];
            }
            const { sample_key, id, sample_group, ...rest } = item
            // debugger
            acc[key].push({
                label: sample_key,
                value: id,
                sample_group: sample_group ? sample_group : "no_group",
                sample_key: sample_key,
                id: id,
                // "aaa":"1111",
                ...rest
            });
            return acc;
        }, {});
        // console.log(groupedData)
        const result = { ...dataMap_, ...resultTableList, ...groupedData, first_data_key: getFirstKey(resultTableList) }
        // console.log(result)
        // console.log(resultTableList)
        setDataMap(result)

    }
    useEffect(() => {

        if (sampleGroupApI) {
            getSampleGroup()
        } else {
            // if (resultTableList && activeTabKey) {

            //     const resultTable = resultTableList[activeTabKey]
            //     if (resultTable) {
            //         setSampleGroup(resultTable)
            //     }
            // } else {
            //     // setSampleGroup(resultTableList)
            //     setDataMap({...dataMap_,...resultTableList})
            // }  
            let analysisMetnodNames = []
            if (formJson) {
                analysisMetnodNames = formJson.filter((item: any) => item.inputAnalysisMethod !== undefined).map((item: any) => item.inputAnalysisMethod);
            }
            // console.log(formJson)
            // console.log(analysisMetnodNames)
            if (analysisMetnodNames.length != 0) {
                loadData(analysisMetnodNames)
            } else {
                const data = { ...dataMap_, ...resultTableList, first_data_key: getFirstKey(resultTableList) }
                console.log(data)
                // console.log(resultTableList)
                setDataMap(data)

            }
            // console.log(analysisMetnodNames)


        }

    }, [JSON.stringify(resultTableList)])

    const requestParsms = {

        ...params,
        project: project,
        // analysis_result_id: analysisResultId,
        // analysis_method: saveAnalysisMethod,
        // table_type: tableType,
        // imgType: imgType,
        // software: "python",
        component_id: rest.component_id,
        data_component_ids: JSON.stringify(dataComponentIds)

    }

    // const saveUpstreamAnalysis = async (save: any, is_submit: any = false) => {
    //     const values = await form.validateFields()
    //     const requestParams = {
    //         ...requestParsms,
    //         ...values,

    //     }
    //     const scriptType = rest.script_type || "script"
    //     console.log(scriptType)
    //     try {
    //         const resp: any = await axios.post(`/fast-api/analysis-controller?save=${save}&type=${scriptType}&is_submit=${is_submit}`, requestParams)
    //         // setFilePlot(resp.data)
    //         // setAnalysisParams(resp.data)
    //         console.log(resp)

    //         if (save) {
    //             messageApi.success("执行成功!")
    //             if (callback) {
    //                 callback()
    //             }
    //             // if (tableRef.current) {
    //             //     tableRef.current.reload()
    //             // }
    //         } else {
    //             operatePipeline.openModal("modalF", resp.data)
    //         }
    //     } catch (error: any) {
    //         console.log(error)
    //         if (error.response?.data) {
    //             messageApi.error(error.response.data.detail)
    //         }
    //     }
    //     // setLoading(false)
    //     // /fast-api/save-analysis
    // }
    return <>
        {contextHolder}
        {/* {JSON.stringify(rest)} */}
        <Watermark content={formId && `更新分析(${formValues.analysis_name})(${String(formValues.analysis_id).slice(0, 8)})`}>
            {/* {JSON.stringify(resultTableList)} */}
            <CreateOrUpdateParsms
                analysisResultId={analysisResultId}
                form={form}
                requestParam={requestParsms}
                dataMap={dataMap}
                formJson={formJson}
                databases={rest.databases}
                callback={callback} ></CreateOrUpdateParsms>

            {/* <Form form={form}   >
                <Form.Item name={"analysis_id"} label="分析ID" >
                    <Input disabled></Input>
                </Form.Item>
                
                {formJson &&
                    <FormJsonComp project={project} formJson={formJson} dataMap={dataMap}></FormJsonComp>
                }
                {rest.databases &&
                    <BioDatabaseForm openModal={() => operatePipeline.openModal("modalE", rest.databases)} formJson={rest.databases}></BioDatabaseForm>
                }


                {formDom &&
                    <>
                        {formDom}
                    </>
                }
                <Form.Item label="分析名称" name={"analysis_name"} style={{ maxWidth: 600 }} rules={[{ required: true, message: '该字段不能为空!' }]}>
                    <Input></Input>
                </Form.Item>
                <Form.Item initialValue={false} label={"是否报告"} name={"is_report"} rules={[{ required: true, message: '该字段不能为空!' }]}>
                    <Switch />
                </Form.Item>

                {(formDom || sampleGroup || formJson) && <Flex gap={"small"}>
                 


                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        saveUpstreamAnalysis(false)
                    }}>查看参数</Button>


                    <Button size="small" color="cyan" variant="solid" onClick={() => saveUpstreamAnalysis(true)}>
                        {formId ? <>更新分析({formValues.analysis_name})({String(formValues.analysis_id).slice(0, 8)})</> : <>保存分析</>}</Button>
                    {formId && <Button size="small" color="cyan" onClick={() => form.setFieldValue("analysis_id", undefined)}>取消更新</Button>}

                </Flex>
                }

                <Collapse ghost items={[
                    {
                        key: "1",
                        label: "更多",
                        children: <>
                            <Form.Item noStyle shouldUpdate>
                                {() => (
                                    <Typography>
                                        <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
                                    </Typography>
                                )}
                            </Form.Item>
                        </>
                    }
                ]} />
            </Form> */}
        </Watermark>

    </>
}

export default AnalysisForm