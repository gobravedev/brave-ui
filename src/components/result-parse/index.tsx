import { Button, Card, Flex, message, Modal, Popconfirm, Spin, Table, Tooltip, Typography } from "antd"
import axios from "axios";
import { FC, memo, useEffect, useState } from "react"
import { useOutletContext } from "react-router";
import FileBrowser from "../file-browser";
import { CreateORUpdatePipelineCompnentRelation } from "../create-pipeline";
import { CreateOrUpdatePipelineComponent } from "../create-pipeline";
import { useModal } from "@/hooks/useModal";
import { AnalysisResultModal } from "../result-list";
export const parseAnalysisResultAPi = (id: any, save: boolean) => axios.post(`/fast-api/parse-analysis-result/${id}?save=${save}`)

const ResultParse: FC<any> = memo(({ analysis_id: analysisId, callback }) => {
    // if (!visible) return null;
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState<any>(false)
    const { messageApi } = useOutletContext<any>()
    const { modal, openModal, closeModal } = useModal()
    const loadData = async (save: boolean = false) => {
        setLoading(true)
        try {
            const resp = await parseAnalysisResultAPi(analysisId, save)
            setData(resp.data)
            setLoading(false)
            if (callback && save) {
                callback()
            }
        } catch (error: any) {
            setLoading(false)
            messageApi.error(error.response.data.detail)
        }
    }

    useEffect(() => {
        loadData(false)
    }, [analysisId])

    return <>
        <Card title={`输出结果 ${analysisId}`} extra={
            <Flex gap={"small"} align={"center"}>

                {data?.file_format_list && <>
                    {data?.file_format_list.map((item: any) => {
                        return <Button size="small" color="cyan" variant="solid"
                            onClick={() => openModal("modalA", {
                                params: {
                                    component_id: item.component_id
                                },
                                title: item.name
                            })}>
                            {item.name}
                        </Button>
                    })}
                </>}
                {/* <Button size="small" color="cyan" variant="solid"
                    onClick={() => openModal("modalA", {
                        component_id: data?.component_id
                    })}>
                    查看结果
                </Button> */}
                <Popconfirm title="确定解析吗？" onConfirm={() => {
                    loadData(true)
                    messageApi.success("解析成功")
                }}>
                    <Button size="small" color="cyan" variant="solid" >
                        解析
                    </Button>
                </Popconfirm>
                <Button size="small" color="primary" variant="solid" onClick={() => loadData(false)}>
                    刷新
                </Button>
            </Flex>
        }>
            <Spin spinning={loading}>
                {data && <>


                    {data?.error ? <Typography>
                        <pre>{data?.error}</pre>
                    </Typography> :
                        <>
                            <Table
                                size="small"
                                pagination={false}
                                rowKey={"component_id"}
                                columns={[{
                                    title: "名称",
                                    dataIndex: "name",
                                    key: "name",
                                }, {
                                    title: "目录",
                                    dataIndex: "dir",
                                    key: "dir",
                                }, {
                                    title: "文件组件ID",
                                    dataIndex: "component_id",
                                    key: "component_id",
                                }, {
                                    title: "文件格式",
                                    dataIndex: "fileFormat",
                                    key: "fileFormat",
                                    render: (_, record: any) => {
                                        return JSON.stringify(record.fileFormat)
                                    }
                                }, {
                                    title: "操作",
                                    dataIndex: "component_id",
                                    key: "component_id",
                                    render: (_, record: any) => {
                                        return <>
                                            <Button color="cyan" variant="solid" size="small" onClick={() => {
                                                openModal("modalC", {
                                                    data: { component_id: record.component_id }, structure: {
                                                        component_type: "file",
                                                        files: data?.file_dict[record.dir]
                                                    }
                                                })
                                            }}>编辑</Button>
                                        </>
                                    }
                                }]}
                                dataSource={data?.file_format_list} />
                            <Typography>

                                <pre>{JSON.stringify(data, null, 2)}</pre>
                            </Typography>
                        </>
                    }
                </>}

            </Spin>
            {/* <FileBrowser dir={params.output_dir} /> */}
        </Card>

        <CreateOrUpdatePipelineComponent
            callback={loadData}
            visible={modal.key == "modalC" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdatePipelineComponent>
        <AnalysisResultModal
            visible={modal.key == "modalA" && modal.visible}
            params={modal.params}
            onClose={closeModal} analysis={data}></AnalysisResultModal>


        {/* <CreateOrUpdatePipelineComponent
            callback={loadData}
            // pipelineStructure={pipelineStructure}
            // data={record}
            visible={modal.key == "modalC" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdatePipelineComponent> */}
        {/* <CreateORUpdatePipelineCompnentRelation
            callback={loadData}
            // pipelineStructure={pipelineStructure}
            // data={record}
            visible={modal.key == "modalA" && modal.visible}
            onClose={closeModal}
            params={{ ...modal.params }}></CreateORUpdatePipelineCompnentRelation>
        <CreateOrUpdatePipelineComponent
            callback={loadData}
            // pipelineStructure={pipelineStructure}
            // data={record}
            visible={modal.key == "modalC" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdatePipelineComponent> */}
        {/* <Modal
            title="结果解析"
            footer={<>
                <Button type="primary" onClick={() => loadData(false)}>刷新</Button>
                <Button type="primary" onClick={() => { loadData(true); onClose() }}>解析</Button>
            </>}
            open={visible}
            onCancel={onClose}
            onClose={onClose}

            width={"70%"}>
            <Spin spinning={loading}>

                <Typography>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </Typography>
            </Spin>

        </Modal> */}
    </>
})

export default ResultParse
