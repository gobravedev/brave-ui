import { Button, Card, Drawer, Flex, message, Modal, Popconfirm, Skeleton, Spin, Table, Tabs, Tag, Tooltip, Typography } from "antd"
import axios from "axios";
import { FC, memo, useEffect, useRef, useState } from "react"
import { useOutletContext } from "react-router";
import FileBrowser from "../file-browser";
import { CreateORUpdatePipelineCompnentRelation } from "../create-pipeline";
import { CreateOrUpdatePipelineComponent } from "../create-pipeline";
import { useModal } from "@/hooks/useModal";
import { AnalysisResultModal } from "../result-list";
export const parseAnalysisResultAPi = (id: any, save: boolean) => axios.post(`/fast-api/parse-analysis-result/${id}?save=${save}`)
import BigTable from "../big-table";
import BigList from "../big-table/list";
import LogFile from "../log-file";
import { useSelector } from "react-redux";


const ResultParse: FC<any> = memo(({ analysis_id: analysisId, callback, onClose }) => {
    // if (!visible) return null;
    const [data, setData] = useState<any>()
    const [loading, setLoading] = useState<any>(false)
    const { messageApi } = useOutletContext<any>()
    const { modal, openModal, closeModal } = useModal()
    const analysisIdRef = useRef<any>(null)

    const [tabState, setTabState] = useState<{
        tabKey?: string;
        tabList: { key: string; label: string }[];
        dataList: any[];
        dataListInfo: { nrow: number; ncol: number };
    }>({
        tabList: [],
        dataList: [],
        dataListInfo: { nrow: 0, ncol: 0 },
    });
    const [fileTabState, setFileTabState] = useState<{
        tabKey?: string;
        tabList: { key: string; label: string }[];
        dataList: any[];
    }>({
        tabList: [],
        dataList: [],
    });

    useEffect(() => {
        const resultDict = data?.result_dict;
        if (!resultDict) return;

        const tabs = Object.keys(resultDict).map((key) => ({ key, label: key }));

        if (tabs.length === 0) return;

        const currentTab = tabs[0].key;
        const currentData = resultDict[currentTab];

        setTabState({
            tabKey: currentTab,
            tabList: tabs,
            dataList: currentData?.tables ?? [],
            dataListInfo: {
                nrow: currentData?.nrow ?? 0,
                ncol: currentData?.ncol ?? 0,
            },
        });

    }, [data?.result_dict]);

    useEffect(() => {
        const fileDict = data?.file_dict;
        if (!fileDict) return;

        const tabs = Object.keys(fileDict).map((key) => ({ key, label: key }));

        if (tabs.length === 0) return;

        const currentTab = tabs[0].key;
        const currentData = fileDict[currentTab];

        setFileTabState({
            tabKey: currentTab,
            tabList: tabs,
            dataList: currentData,
        });

    }, [data?.file_dict])



    const sseData = useSelector((state: any) => state.global.sseData)
    useEffect(() => {
        // console.log("sseData in result list:", data.msgType)
        const data = sseData
        // sseAnalysisIdRef.current = data
        if (analysisIdRef.current == data.analysis_id) {

            if (data.event == "analysis_complete" || data.event == "analysis_failed" || data.event == "analysis_started") {
                loadData()
            }
        }
    }, [sseData])
    const loadData = async (save: boolean = false) => {
        setLoading(true)
        try {
            const resp = await parseAnalysisResultAPi(analysisId, save)
            setData(resp.data)
            analysisIdRef.current = resp.data.analysis_id
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
        {/* <Card size="small" title={`输出结果 ${analysisId}`}
            extra={

            }>

        </Card> */}
        <Card size="small"
            variant="borderless"
            style={{ boxShadow: "none" }}
            title={`Analysis Result Parse (${analysisId})`}
            extra={<Flex gap={"small"} >

                {data?.file_format_list && <>
                    {data?.file_format_list.map((item: any) => {
                        return <Tag>{item.name}</Tag>

                    })}
                </>}
                <Tag>{data?.job_status}</Tag>
                <Popconfirm title="Are you sure about the parsing?" onConfirm={() => {
                    loadData(true)
                    messageApi.success("parsing success!")
                }}>
                    <Button size="small" color="cyan" variant="solid" >
                        Parse
                    </Button>
                </Popconfirm>
                <Button size="small" color="primary" variant="solid" onClick={() => loadData(false)}>
                    Refresh
                </Button>
                {onClose && <Button onClick={onClose} size="small" color="red" variant="solid" >Close</Button>}

            </Flex>}
        >

            <Spin spinning={loading}>
                {data?.job_status == "failed" ? <div style={{ textAlign: "center" }}>
                    <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
                        <LogFile file_path={data?.command_log_path}  ></LogFile>

                    </div>
                </div> : <>
                    {/* {((data?.job_status == "running")) ? <Skeleton active></Skeleton> : <>




                    </>
                    } */}
                    <Spin spinning={data?.job_status == "running"} tip="Analysis is running, please wait...">
                        {data && <>


                            {data?.error ? <Typography>
                                <pre>{data?.error}</pre>
                            </Typography> :
                                <>
                                    <Table
                                        // virtual
                                        size="small"
                                        pagination={false}
                                        rowKey={"component_id"}
                                        columns={[{
                                            title: "Name",
                                            dataIndex: "name",
                                            key: "name",
                                        }, {
                                            title: "Dir",
                                            dataIndex: "dir",
                                            key: "dir",
                                        }, {
                                            title: "File Component Id",
                                            dataIndex: "component_id",
                                            key: "component_id",
                                        }, {
                                            title: "File Format",
                                            dataIndex: "fileFormat",
                                            key: "fileFormat",
                                            render: (_, record: any) => {
                                                return <div style={{ overflowWrap: "break-word", wordBreak: "break-all" }}>
                                                    {JSON.stringify(record.fileFormat)}
                                                </div>
                                            }
                                        }, {
                                            title: "Action",
                                            dataIndex: "action",
                                            key: "action",
                                            render: (_, record: any) => {
                                                return <>
                                                    <Button color="cyan" variant="solid" size="small" onClick={() => {
                                                        openModal("modalC", {
                                                            data: { component_id: record.component_id }, structure: {
                                                                component_type: "file",
                                                                files: data?.file_dict[record.dir]
                                                            }
                                                        })
                                                    }}>Edit</Button>
                                                </>
                                            }
                                        }]}
                                        dataSource={data?.file_format_list} />



                                    <Tabs
                                        activeKey={tabState.tabKey}
                                        onChange={(key) => {
                                            const currentData = data?.result_dict[key];
                                            if (!currentData) return;

                                            setTabState((prev) => ({
                                                ...prev,
                                                tabKey: key,
                                                dataList: currentData.tables ?? [],
                                                dataListInfo: {
                                                    nrow: currentData.nrow ?? 0,
                                                    ncol: currentData.ncol ?? 0,
                                                },
                                            }));
                                        }}
                                        items={tabState.tabList}
                                    />

                                    <div style={{ height: '30vh' }}>
                                        <BigTable rows={tabState.dataList} shape={tabState.dataListInfo} />
                                    </div>



                                    <Tabs
                                        activeKey={fileTabState.tabKey}
                                        onChange={(key) => {
                                            const currentData = data?.result_dict[key];
                                            if (!currentData) return;

                                            setFileTabState((prev) => ({
                                                ...prev,
                                                tabKey: key,
                                                dataList: currentData.tables ?? [],
                                                dataListInfo: {
                                                    nrow: currentData.nrow ?? 0,
                                                    ncol: currentData.ncol ?? 0,
                                                },
                                            }));
                                        }}
                                        items={fileTabState.tabList}
                                    />
                                    {/* {JSON.stringify(fileTabState.dataList)} */}
                                    <div style={{ height: '30vh' }}>
                                        <BigList rows={fileTabState.dataList} />
                                    </div>

                                    {/* {JSON.stringify(dataList)} */}
                                    {/* <Card style={{ maxHeight: "20rem", overflow: "auto" }} >
                                <Typography>

                                    <pre>{JSON.stringify(data, null, 2)}</pre>
                                </Typography>
                            </Card> */}

                                </>
                            }
                        </>}

                    </Spin>
                </>}
            </Spin>

        </Card>


        <CreateOrUpdatePipelineComponent
            callback={loadData}
            visible={modal.key == "modalC" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdatePipelineComponent>

    </>
})

export default ResultParse
