import { Venn } from "@ant-design/plots"
import { Button, Card, Flex, message, Popconfirm, Popover, Space, Table } from "antd"
import axios from "axios"
import { FC, forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router"
import ResultParse from "../result-parse"
import { useModal } from "@/hooks/useModal"
import PipelineInfo from "../pipeline-monitor"
import { runAnalysisApi } from "@/api/analysis"

export const readHdfsAPi = (contentPath: any) => axios.get(`/api/read-hdfs?path=${contentPath}`)
export const readJsonAPi = (contentPath: any) => axios.get(`/fast-api/read-json?path=${contentPath}`)

const ResultList = forwardRef<any, any>(({
    title,
    form,
    appendSampleColumns = [],
    setResultTableList,
    cleanDom,
    analysisType,
    setRecord: setRecord_,
    setTableLoading,
    setTabletData,
    shouldTrigger,
    // analysisMethod,
    columnsParamsALL,
    project,
    software,
    operatePipeline
}, ref) => {
    useImperativeHandle(ref, () => ({
        reload: loadData
    }))
    const [record, setRecord0] = useState<any>()
    const [messageApi, contextHolder] = message.useMessage();
    const { modal, openModal, closeModal } = useModal();
    const [openMonitor, setOpenMonitor] = useState<any>(false)
    const navigate = useNavigate()
    const location = useLocation()

    const setRecord = (record: any) => {
        if (setRecord_) {
            setRecord_(record)
        }

        setRecord0(record)
    }
    const [data, setData] = useState<any>([])
    // const [content,setContent] = useState<any>()
    const [loading, setLoading] = useState(false)
    const loadData = async () => {
        setLoading(true)
        // ?analysis_method=${analysisMethod}&project=${project}
        let resp: any = await axios.post(`/list-analysis`, {
            // analysisMethod: analysisMethod,
            component_id: software?.component_id,
            project: project
        });
        // if (analysisMethod) {
        //     resp = await axios.get(`/api/analysis-result?project=${project}&analysis_method=${analysisMethod}`)
        // } else {
        //     resp 
        // }
        if (setResultTableList) {
            setResultTableList(resp.data)
        }

        setData(resp.data)
        setLoading(false)
    }
    const deleteById = async (id: any) => {
        const resp: any = await axios.delete(`/fast-api/analysis/${id}`)
        message.success("删除成功!")
        loadData()
    }


    const readJOSN = async (contentPath: any) => {
        setTableLoading(true)
        const resp: any = await readJsonAPi(contentPath)
        setTabletData(resp.data)
        setTableLoading(false)
        // reset()
        // console.log(resp.data)
        // setData(resp.datafv)
    }

    const isSelected = (record: any, key: any) => {
        if (!modal.params) return false
        return record.analysis_id == modal.params.analysis_id && key == modal.key
    }

    let columns: any = [
        {
            title: 'analysis_id',
            dataIndex: 'analysis_id',
            key: 'analysis_id',
            ellipsis: true,

        }, {
            title: 'component_id',
            dataIndex: 'component_id',
            key: 'component_id',
            ellipsis: true,

        }, {
            title: 'process_id',
            dataIndex: 'process_id',
            key: 'process_id',
            ellipsis: true,

        }, {
            title: 'project',
            dataIndex: 'project',
            key: 'project',
            ellipsis: true,

        }, {
            title: 'analysis_method',
            dataIndex: 'analysis_method',
            key: 'analysis_method',
            ellipsis: true,

        }, {
            title: "analysis_name",
            dataIndex: 'analysis_name',
            key: 'analysis_name',
            ellipsis: true,
        }, {
            title: 'params_path',
            dataIndex: 'params_path',
            key: 'params_path',
            ellipsis: true,
        }, {
            title: 'pipeline_script',
            dataIndex: 'pipeline_script',
            key: 'pipeline_script',
            ellipsis: true,
        }, {
            title: 'work_dir',
            dataIndex: 'work_dir',
            key: 'work_dir',
            ellipsis: true,
        }, {
            title: 'output_dir',
            dataIndex: 'output_dir',
            key: 'output_dir',
            ellipsis: true,
        }, {
            title: '操作',
            key: 'action',
            fixed: "right",
            ellipsis: true,
            width: 200,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        navigate(`/software-analysis-editor/${record.analysis_id}`, {
                            state: {
                                location: location.pathname,
                            }
                        })
                    }}>编辑</Button>

                    {isSelected(record, "modalB") ?
                        <Button size="small" color={"cyan"} variant="solid" onClick={() => {
                            closeModal()
                        }}>关闭</Button> :
                        <Button size="small" color={"cyan"} variant="solid" onClick={() => {
                            openModal("modalB", record)
                        }}>查看/运行/结果</Button>}
                    {/* <Button size="small" color="cyan" variant="solid" onClick={() => {
                        openModal("modalB", record)
                    }}>查看/运行</Button> */}

                    {/* <Popconfirm title={"是否运行!"} onConfirm={async () => {
                        await runAnalysisApi(record.analysis_id)
                        setRecord(record)
                        loadData()
                    }}>
                        <Button size="small" color="cyan" variant="solid">运行</Button>
                    </Popconfirm> */}
                    {/* {isSelected(record, "modalA") ?
                        <Button size="small" color={"cyan"} variant="solid" onClick={() => {
                            closeModal()
                        }}>关闭</Button> :
                        <Button size="small" color={"cyan"} variant="solid" onClick={() => {
                            openModal("modalA", record)
                        }}>输出结果</Button>} */}


                    <Popconfirm title={"是否删除!"} onConfirm={async () => {
                        await deleteById(record.id)
                        loadData()
                    }}>
                        <Button size="small" color="danger" variant="solid">删除</Button>
                    </Popconfirm>
                    {/* <Popconfirm title={"是否解析!"} onConfirm={async () => {
                        try {
                            await parseAnalysisResultAPi(record.id, true)
                            messageApi.success("提交成功")
                        } catch (error: any) {
                            console.log(error)
                            messageApi.error(error?.response?.data?.detail)
                        }

                    }}>
                        
                    </Popconfirm> */}
                </Space>
            ),
        },
    ]



    useEffect(() => {
        loadData()
    }, [])
    return <>
        {contextHolder}
        {/* {JSON.stringify(location.pathname)} */}
        <Card title={title} extra={
            <Flex gap={"small"}>
                {/* {software && <>
                    {software.outputFormat && <>
                        {software.outputFormat.map((item: any, index: any) =>
                            <Button key={index} color="cyan" variant="solid" onClick={() => {
                                operatePipeline.openModal("modalB", {
                                    module_type: "py_parse_analysis_result",
                                    module_name: item.module,
                                    component_id: software.component_id,
                                })
                            }}>输出解析模块({item.module})</Button>)}
                    </>}
                </>} */}
                <Button size="small"  type="primary" onClick={loadData}>刷新</Button>
            </Flex>
        } >
            {/* {software && <ul style={{ marginBottom: "0.5rem" }}>
                {software.outputFormat && <>
                    {software.outputFormat.map((item: any, index: any) => <li key={index}>
                            输出文件: {item.outputFile} 输出路径: {item.dir}
                    </li>
                    )}
                </>}
            </ul>} */}

            <Table
                size="small"
                bordered
                pagination={false}
                loading={loading}
                scroll={{ x: 'max-content', y: 55 * 5 }}
                columns={columns}
                footer={() => `一共${data.length}条记录`}
                dataSource={data} />

        </Card>
        <div style={{ marginBottom: "1rem" }}></div>

        <PipelineInfo
            visible={modal.key == "modalB" && modal.visible}
            params={modal.params}
            onClose={closeModal}
            callback={loadData}></PipelineInfo>

        {/* <ResultParse
            visible={modal.key == "modalA" && modal.visible}
            onClose={closeModal}
            // callback={loadData}
            params={modal.params}
        ></ResultParse> */}

    </>
})

export default ResultList

