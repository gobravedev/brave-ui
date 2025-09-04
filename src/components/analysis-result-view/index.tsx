import { Button, Input, Popover, Spin, Table, Image, Typography, Collapse, Flex, Card, Skeleton, Tag, Tabs, Row, Col, Popconfirm } from "antd";
import TextArea from "antd/es/input/TextArea";
import { FC, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Markdown from '../markdown'
import axios from "axios";
import LogFile from "../log-file";
import { QuestionCircleOutlined } from "@ant-design/icons"
import { MonacoEditor } from "../react-monaco-editor";
import { useNavigate, useOutletContext } from "react-router";
import { useSSEContext } from "@/context/sse/useSSEContext";
import { runAnalysisApi, stopAnalysisApi } from "@/api/analysis";

export const TableView: FC<any> = ({ data, url, filename }) => {
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

                    {url && <Popover title={`${window.location.origin}${url}`}><Button size="small" onClick={() => {
                        window.open(`${url}?t=${Date.now()}`, "_blank")
                    }} type="primary">下载</Button></Popover>}

                    <span>{filename}</span>
                </Flex>}
                // showHeader={()=>{}}
                scroll={{ x: 'max-content', y: 55 * 5 }}
                dataSource={tableData}
                pagination={false}
                virtual
                columns={getColumns(data[0])}
                footer={() => `一共${data.length}条记录`}
            ></Table>


        </>}

    </>
}

const ImgView: FC<any> = ({ data, url, filename }) => {
    return <div >
        <div style={{ textAlign: "center" }}>
            { }
            <Image src={filename?.endsWith("pdf") ? data : `${data}?t=${Date.now()}`} style={{ maxWidth: "20rem", marginRight: "0.5rem" }}></Image>

            {url && <div>
                <Popover title={`${window.location.origin}${url}`}>
                    <Button size="small" onClick={() => { window.open(`${url}?t=${Date.now()}`, "_blank") }} type="primary">下载</Button>
                </Popover>
                {filename}
            </div>}

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
const HtmlView: FC<any> = ({ data }) => {

    return <>
        {data && data.startsWith("/brave") ? <>
            <iframe src={data} width={"100%"} style={{ height: "80vh", border: "none" }}>
            </iframe>
        </> : <>{data}</>}

    </>
}
const componentMap: any = {
    table: TableView,
    string: StringView,
    html: HtmlView,
    json: JSONView,
    text: TextView
};

export const ComponentsRender = ({ type, ...rest }: any) => {
    const Component = componentMap[type] || (() => <div>未知类型 {type}</div>)
    return <Component {...rest} />;
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

export const AnalysisResultViewComp: FC<any> = ({ analysis_id, onClose }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [analsyisResult, setAnalsyisResult] = useState<any>(null)
    const navigate = useNavigate()
    const { eventSourceRef, status, reconnect } = useSSEContext();
    const analysisIdRef = useRef<any>(null)
    const sseAnalysisIdRef = useRef<any>(null)
    const { messageApi } = useOutletContext<any>()

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
            title={<>
                {analsyisResult ? <>
                    <Tag style={{ cursor: "pointer" }} onClick={() => {
                        navigate(`/component/${analsyisResult?.component_type}/${analsyisResult?.component_id}`)
                    }}>{analsyisResult?.component_name}</Tag>
                    <Tag>{analsyisResult?.analysis_name}</Tag>
                    <Tag>{String(analsyisResult?.analysis_id).slice(0, 8)}</Tag>
                    <Tag>{analsyisResult?.analysis_status}</Tag>
                    {analysisIdRef.current == sseAnalysisIdRef.current?.analysis_id && <Tag> <>{sseAnalysisIdRef.current?.event}</>
                    </Tag>}
                </> : <>
                    <Spin spinning>

                    </Spin>
                </>}



            </>}
            extra={
                <Flex gap={"small"}>
                    {onClose && <Button size="small" color="cyan" variant="solid" onClick={() => onClose()}>关闭</Button>}
                    {analsyisResult && <>
                        {analsyisResult?.analysis_status == "running" ?
                            <>
                                <Popconfirm title={"是否停止!"} onConfirm={async () => {
                                    await stopAnalysisApi(analsyisResult.analysis_id)
                                    messageApi.success("停止成功")

                                }}>
                                    <Button size="small" color="cyan" variant="solid">
                                        停止
                                    </Button>
                                </Popconfirm>

                            </> : <>
                                <Popconfirm title={"是否运行!"} onConfirm={async () => {
                                    await runAnalysisApi(analsyisResult.analysis_id, "job")
                                    messageApi.success("运行成功")

                                }}>
                                    <Button size="small" color="cyan" variant="solid">
                                        {analsyisResult.analysis_status == "created" ? "运行" : "重新运行"}
                                    </Button>
                                </Popconfirm>

                            </>
                        }
                    </>}


                    <Button size="small" color="cyan" variant="solid" onClick={()=>loadData(analysis_id)}>刷新</Button>

                </Flex>
            }>



            {analsyisResult?.analysis_status == "failed" ? <div style={{ textAlign: "center" }}>

                <LogFile file_path={analsyisResult?.command_log_path}  ></LogFile>
            </div> : <>
                {((analsyisResult?.analysis_status == "running" && analsyisResult?.run_type != "server")) ? <Skeleton active></Skeleton> : <>


                    {analysis_id && <AnalysisResultDisplay analsyisResult={analsyisResult} loading={loading}></AnalysisResultDisplay>}

                </>
                }

            </>}



        </Card>

    </>

}

const AnalysisResultDisplay: FC<any> = ({ analsyisResult, loading }) => {
    return <Spin spinning={loading}>
        {analsyisResult && <>

            {analsyisResult.images && <div>


                {
                    //  
                    Array.isArray(analsyisResult.images) ? <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                        {analsyisResult.images.map((it: any, index: any) => (<Col key={index} span={4}>
                            <ImgView {...it} ></ImgView>
                        </Col>))}
                    </Row> :
                        <>
                            <ImgView {...analsyisResult.images}></ImgView>

                        </>
                }
            </div>}
            {analsyisResult.tables && Array.isArray(analsyisResult.tables) && <>
                {analsyisResult.tables.map((item: any, index: any) => (
                    <ComponentsRender key={index} {...item}></ComponentsRender>


                ))}
            </>}

        </>}
        <Markdown data={analsyisResult?.description}></Markdown>
    </Spin>
}
export default AnalysisResultView

