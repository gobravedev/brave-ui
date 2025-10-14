import { Button, Input, Popover, Spin, Table, Image, Typography, Collapse, Flex, Card, Skeleton, Tag, Tabs, Row, Col, Popconfirm, Drawer, Form, Alert, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import { FC, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Markdown from '../markdown'
import axios from "axios";
import LogFile from "../log-file";
import { DownloadOutlined, QuestionCircleOutlined } from "@ant-design/icons"
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
import EditParams from '../edit-params'
import { KGMLMapSVG } from "../databases/kegg";
import { download } from "@antv/s2";
import { useSelector } from "react-redux";

const UrlComp: FC<any> = ({ url, filename, baseURL }) => {
    return <>
        {url && <Popover title={`${baseURL}${url}`}>
            <Tag color="success" style={{ cursor: "pointer" }} onClick={() => {
                window.open(`${baseURL}${url}?t=${Date.now()}`, "_blank")
            }}>{filename} <DownloadOutlined /></Tag></Popover>}

    </>
}

export const TableView: FC<any> = ({ data, url, filename, columns, baseURL }) => {
    const { Search } = Input;
    const [tableData, setTableData] = useState<any>([])
    const getColumns = (data: any) => {
        if (!data) return []
        return Object.keys(data).map(it => {
            return {
                title: it,
                dataIndex: it,
                key: it,
                ellipsis: true,
                width: 150,
            }
        })
    }

    useEffect(() => {
        // console.log()
        if (data) {
            // console.log(data)
            const dataWithKey = data.map((item: any, index: any) => ({ ...item, key: index }));
            setTableData(dataWithKey)
        }

    }, [data])
    return <>
        {Array.isArray(tableData) && <>

            <Table
                style={{ border: "1px solid #f0f0f0" }}
                size="small"
                title={() => <Flex gap={"small"}>
                    <Search
                        size="small"
                        placeholder="input search text"
                        allowClear
                        onSearch={(value: any) => {
                            // console.log(data?.table)
                            const filterData = data.filter((it: any) => Object.values(it).some(val =>
                                typeof val === "string" && val.includes(value)
                            ))
                            setTableData(filterData)
                        }}
                        style={{ width: 304 }}
                    />
                    <UrlComp url={url} filename={filename} baseURL={baseURL}></UrlComp>

                </Flex>}
                // showHeader={()=>{}}
                scroll={{ x: 'max-content', y: 55 * 5 }}
                dataSource={tableData}
                pagination={false}
                virtual
                columns={columns ? columns : getColumns(data[0])}
                footer={() => `A total of ${data.length} records`}
            ></Table>


        </>}

    </>
}

const ImgView: FC<any> = ({ data, url, filename, baseURL }) => {
    return <div >
        <div style={{ textAlign: "center" }}>

            <Image src={filename?.endsWith("pdf") ? data : `${data}?t=${Date.now()}`} style={{ maxWidth: "20rem", marginRight: "0.5rem" }}></Image>
            <UrlComp url={url} filename={filename} baseURL={baseURL}></UrlComp>

            {/* {url && <Popover title={`${window.location.origin}${url}`}>
                <Tag color="success" style={{ cursor: "pointer" }} onClick={() => {
                    window.open(`${url}?t=${Date.now()}`, "_blank")
                }}>{filename} <DownloadOutlined /></Tag></Popover>} */}

        </div>


    </div>
}
const { Paragraph } = Typography;

const StringView: FC<any> = ({ data }) => {

    return <>
        <MonacoEditor value={data} />
        {/* <Paragraph style={{ background: "#13c2c2", padding: "1rem", border: "1px solid #1677ff" }}>{data}</Paragraph> */}
    </>
}
const InfoView: FC<any> = ({ data }) => {

    return <div >
        <Alert closable message={data} type="info" showIcon />

        {/* <Typography>
            <pre style={{ margin: 0 }}>
                {data}
            </pre>
        </Typography> */}

    </div>
}
const TextView: FC<any> = ({ data }) => {

    return <>
        <Typography>
            <pre style={{ margin: 0 }}>
                {data}
            </pre>
        </Typography>

    </>
}
const JSONView: FC<any> = ({ data }) => {

    return <>
        <MonacoEditor value={data} defaultLanguage={"json"} />
        {/* <Paragraph style={{ background: "#13c2c2", padding: "1rem", border: "1px solid #1677ff" }}>{data}</Paragraph> */}
    </>
}
// const HtmlView: FC<any> = ({ data }) => {

//     return <>
//         {data && data.startsWith("/brave") ? <>
//             <iframe src={data} width={"100%"} style={{ height: "80vh", border: "none" }}>
//             </iframe>
//         </> : <>{data}</>}

//     </>
// }
const HtmlView: FC<any> = ({ data, url }) => {
    const { baseURL } = useSelector((state: any) => state.user)
    const [loading, setLoading] = useState(true);

    return <>

        <div style={{ position: "relative", width: "100%", height: "80vh" }}>
            {/* loading 层 */}
            {loading && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255,255,255,0.8)",
                        zIndex: 1,
                    }}
                >
                    <Spin size="large" tip="Loading..." />
                </div>
            )}

            {/* iframe 本体 */}
            <iframe
                src={`${baseURL}${url}`}
                width="100%"
                style={{ height: "100%", border: "none" }}
                onLoad={() => setLoading(false)} // 加载完成时隐藏 loading
                title="content-frame"
            />
        </div>

        {/* {data && data.startsWith("/brave") ? <>
        </> : <>{data}</>} */}

    </>
}
const Download: FC<any> = ({ url, filename, baseURL }) => {
    return <>
        <UrlComp url={url} filename={filename} baseURL={baseURL}></UrlComp>

        {/* {url && <Popover title={`${window.location.origin}${url}`}>
            <Tag color="success" style={{ cursor: "pointer" }} onClick={() => {
                window.open(`${url}?t=${Date.now()}`, "_blank")
            }}>{filename} <DownloadOutlined /></Tag></Popover>} */}

    </>
}
const KeggMap: FC<any> = ({ data, ...rest }) => {
    const { modal, openModal, closeModal } = useModal()
    // const [record,setRecord] = useState<any>()
    return <>
        <TableView data={data?.list} {...rest} columns={[
            {
                title: "ID",
                dataIndex: "ID",
                key: "ID",
                ellipsis: true,
                width: 150,
            }, {
                title: "Description",
                dataIndex: "Description",
                key: "Description",
                ellipsis: true,
                width: 400,
            }, {
                title: "GeneRatio",
                dataIndex: "GeneRatio",
                key: "GeneRatio",
                ellipsis: true,
                width: 150,
            }, {
                title: "geneID",
                dataIndex: "geneID",
                key: "geneID",
                ellipsis: true,
                width: 150,
            }, {
                title: "Count",
                dataIndex: "Count",
                key: "Count",
                ellipsis: true,
                width: 150,
            }, {
                title: "pvalue",
                dataIndex: "pvalue",
                key: "pvalue",
                ellipsis: true,
                width: 150,
            }, {
                title: "p.adjust",
                dataIndex: "p.adjust",
                key: "p.adjust",
                ellipsis: true,
                width: 150,
            }, {
                title: "qvalue",
                dataIndex: "qvalue",
                key: "qvalue",
                ellipsis: true,
                width: 150,
            }, {
                title: "organism",
                dataIndex: "organism",
                key: "organism",
                ellipsis: true,
                width: 150,
            }, {
                title: "pathwayId",
                dataIndex: "pathwayId",
                key: "pathwayId",
                ellipsis: true,
                width: 150,
            }, {
                title: '操作',
                key: 'action',
                fixed: "right",
                ellipsis: true,
                width: 200,
                render: (_: any, record: any) => (
                    <>
                        <Button
                            onClick={() => {
                                openModal("KGMLMapSVG", record)
                            }}
                            size="small" color="cyan" variant="solid">pathview</Button>
                    </>
                )
            }
        ]}></TableView>

        {modal.visible && <Modal
            width={"80%"}
            title={`${modal.params?.Description}(${modal.params?.ID})`}
            footer={null}
            onCancel={closeModal}
            onClose={closeModal}
            open={modal.visible && modal.key == "KGMLMapSVG"}>
            <KGMLMapSVG
                compound={data?.compound}
                highlightKeys={modal.params?.geneID.split("/")}
                pathwayId={modal.params?.pathwayId} organisms={modal.params?.organism}></KGMLMapSVG>

        </Modal>}

        {/*
        {JSON.stringify(data)} */}
    </>
}
const componentMap: any = {
    table: TableView,
    string: StringView,
    html: HtmlView,
    // htmlDoc: HtmlDoc,
    json: JSONView,
    text: TextView,
    info: InfoView,
    kegg_map: KeggMap,
    download: Download
};

export const ComponentsRender = ({ type, ...rest }: any) => {
    const Component = componentMap[type] || (() => <div>未知类型 {type}</div>)
    return <div style={{ marginBottom: "1rem" }}>
        <Component {...rest} />
    </div>;
}
// const AnalysisResultView2: FC<any> = ({ plotLoading, filePlot, tableDesc,markdown }) => {


//     return <>

//         <Spin spinning={plotLoading} tip="请求中..." >
//             {filePlot ? <>
//                 {/* {filePlot.img} */}


//                 {filePlot.img && <div style={{ display: "flex", justifyContent: "flex-start" }}>
//                     {

//                         Array.isArray(filePlot.img) ? <>
//                             {filePlot.img.map((it: any, index: any) => (<>
//                                 <ImgView {...it} key={index}></ImgView>
//                             </>))}
//                         </> :
//                             <>
//                                 <ImgView {...filePlot.img}></ImgView>
//                                 {/* <Image src={filePlot.img.data} style={{ maxWidth: "20rem" }}></Image> */}

//                             </>
//                     }
//                 </div>}
//                 {filePlot.dataList && Array.isArray(filePlot.dataList) && <>
//                     {filePlot.dataList.map((item: any, index: any) => (
//                       <ComponentsRender key={index} {...item}></ComponentsRender>
//                         // <div key={index}>
//                         //     {typeof item == 'string' ?
//                         //         <TextArea value={item} rows={10}></TextArea>
//                         //         :
//                         //         <TableView data={item}></TableView>
//                         //     }
//                         // </div>

//                     ))}
//                 </>}

//                 {filePlot.data && Array.isArray(filePlot.data) && <>
//                     <TableView data={filePlot.data}></TableView>
//                 </>}
//                 {/* : <Typography >
//                     {typeof filePlot.data == 'string' ? <TextArea value={filePlot.data} rows={10}></TextArea>
//                         :
//                         <pre>{JSON.stringify(filePlot.data, null, 2)}</pre>
//                     }
//                 </Typography> */}

//             </> : <div style={{ height: plotLoading?"100px":"0px" }}></div>}
//         </Spin>

//         {tableDesc &&<Markdown data={tableDesc}></Markdown> }
//         {markdown &&<Markdown data={markdown}></Markdown> }



//     </>
// }
const AnalysisResultView: FC<any> = forwardRef<any, any>(({ params, visible, onClose }, ref) => {

    const { output_dir, analysis_id } = params || {}
    // const loadData = async () => {
    //     if (visible) {
    //         setLoading(true)
    //         // const res = await axios.get(`/file-operation/visualization-results?path=${output_dir}`)
    //         const res = await axios.get(`/analysis/visualization-results/${analysis_id}`)

    //         setAnalsyisResult(res.data)
    //         setLoading(false)
    //     }

    // }

    // useEffect(() => {
    //     if (visible) {
    //         loadData()
    //     }
    // }, [visible, params?.output_dir])

    if (!visible) {
        return null
    }




    // if (runningAnalysisId.includes(params.analysis_id)) {
    //     return <Spin spinning={loading} tip="请求中..." ></Spin>
    // }
    return <>
        {analysis_id && <AnalysisResultViewComp onClose={onClose} analysis_id={analysis_id}></AnalysisResultViewComp>}



    </>
})

export const AnalysisResultViewComp: FC<any> = ({ analysis_id, onClose, cancalReportCallback }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [analsyisResult, setAnalsyisResult] = useState<any>(null)
    const navigate = useNavigate()
    const { eventSourceRef, status, reconnect } = useSSEContext();
    const analysisIdRef = useRef<any>(null)
    const sseAnalysisIdRef = useRef<any>(null)
    const { messageApi } = useOutletContext<any>()
    const { modals, openModals, closeModals } = useModals(["editParams"]);


    const loadData = async (analysis_id: any) => {
        setLoading(true)
        // const res = await axios.get(`/file-operation/visualization-results?path=${output_dir}`)
        const res = await axios.get(`/analysis/visualization-results/${analysis_id}`)

        setAnalsyisResult(res.data)
        analysisIdRef.current = analysis_id
        setLoading(false)
    }
    useEffect(() => {
        loadData(analysis_id)
    }, [analysis_id])
    useEffect(() => {
        if (eventSourceRef) {
            const handler = (event: MessageEvent) => {
                // console.log('event', event)
                const data = JSON.parse(event.data)
                // console.log('analysisId', analysisIdRef.current)
                sseAnalysisIdRef.current = data
                if (analysisIdRef.current == data.analysis_id) {

                    if (data.event == "analysis_complete" || data.event == "analysis_failed" || data.event == "analysis_started") {
                        loadData(analysisIdRef.current)
                    }

                }
            };

            eventSourceRef.current?.addEventListener('message', handler);

            return () => {
                console.log("removeEventListener")
                eventSourceRef.current?.removeEventListener('message', handler);
            };
        }




    }, [eventSourceRef.current]);

    return <>
        <Card size="small"
            bodyStyle={{ padding: 0 }}
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
                <Flex gap={"small"}>
                    {onClose && <Button size="small" color="cyan" variant="solid" onClick={() => onClose()}>Close</Button>}
                    {analsyisResult && <>
                        <Button size="small" color="cyan" variant="solid" onClick={() => {
                            openModals("editParams", analsyisResult.analysis_id)
                        }}>
                            Edit Parameters
                        </Button>
                        

                        {analsyisResult?.job_status == "running" ?
                            <>
                                <Popconfirm title={"Whether or not to stop?"} onConfirm={async () => {
                                    await stopAnalysisApi(analsyisResult.analysis_id,"job")
                                    messageApi.success("Stop Success")

                                }}>
                                    <Button size="small" color="cyan" variant="solid">
                                        Stop
                                    </Button>
                                </Popconfirm>

                            </> : <>
                                <Popconfirm title={"Whether or not to run?"} onConfirm={async () => {
                                    await runAnalysisApi(analsyisResult.analysis_id, "job")
                                    messageApi.success("run successfully")


                                }}>
                                    <Button size="small" color="cyan" variant="solid">
                                        {analsyisResult.job_status == "created" ? "Run" : "Rerun"}
                                    </Button>
                                </Popconfirm>

                            </>
                        }
                    </>}

                    <Popconfirm title={analsyisResult?.is_report ? "Whether to cancel the report?" : "Reported or not?"} onConfirm={async () => {
                        await axios.post(`/analysis/update-report/${analsyisResult?.analysis_id}`)
                        messageApi.success("operate successfully!")
                        setAnalsyisResult(null)
                        if (cancalReportCallback) {
                            cancalReportCallback()
                        }
                        // loadData()
                    }}>
                        <Button size="small" color={"cyan"} variant="solid">{analsyisResult?.is_report ? "Cancel Report" : "Report"}</Button>
                    </Popconfirm>
                    <Button size="small" color="cyan" variant="solid" onClick={() => loadData(analysis_id)}>Refresh</Button>

                </Flex>
            }>


            {/* {analysis_id} */}
            {analsyisResult?.job_status == "failed" ? <div style={{ textAlign: "center" }}>

                <LogFile file_path={analsyisResult?.command_log_path}  ></LogFile>
            </div> : <>
                {((analsyisResult?.job_status == "running" && analsyisResult?.run_type != "server")) ? <Skeleton active></Skeleton> : <>


                    {analysis_id && <AnalysisResultDisplay analsyisResult={analsyisResult} loading={loading}></AnalysisResultDisplay>}

                </>
                }

            </>}

            <EditParams
                callback={() => loadData(analysis_id)}
                visible={modals.editParams.visible}
                params={modals.editParams.params}
                onClose={() => closeModals("editParams")}
            ></EditParams>

        </Card>

    </>

}



const AnalysisResultDisplay: FC<any> = ({ analsyisResult, loading }) => {
    const { baseURL } = useSelector((state: any) => state.user)

    return <Spin spinning={loading}>
        {analsyisResult && <>

            {analsyisResult.images && <div style={{ marginBottom: "1rem", padding: "1rem", borderBottom: "1px solid #f0f0f0" }}>


                {
                    //  
                    Array.isArray(analsyisResult.images) ? <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        {analsyisResult.images.map((it: any, index: any) => (<Col key={index} span={4}>
                            <ImgView {...it} baseURL={baseURL}></ImgView>
                        </Col>))}
                    </Row> :
                        <>
                            <ImgView {...analsyisResult.images} baseURL={baseURL}></ImgView>

                        </>
                }
            </div>}

            <div style={{ padding: "1rem" }}>
                {analsyisResult.tables && Array.isArray(analsyisResult.tables) && <>
                    {analsyisResult.tables.map((item: any, index: any) => (
                        <ComponentsRender key={index} {...item} baseURL={baseURL}></ComponentsRender>


                    ))}
                </>}
            </div>

        </>}
        <Markdown data={analsyisResult?.description}></Markdown>
    </Spin>
}
export default AnalysisResultView

