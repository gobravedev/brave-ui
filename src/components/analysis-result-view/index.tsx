import { Button, Input, Popover, Spin, Table, Image, Typography, Collapse, Flex, Card, Skeleton, Tag, Tabs, Row, Col } from "antd";
import TextArea from "antd/es/input/TextArea";
import { FC, forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Markdown from '../markdown'
import axios from "axios";
import LogFile from "../log-file";
import { QuestionCircleOutlined } from "@ant-design/icons"
import { MonacoEditor } from "../react-monaco-editor";

export const TableView: FC<any> = ({ data, url }) => {
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
                title={() => <>
                    <Search
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

                    {url && <Popover title={`${window.location.origin}${url}`}><Button onClick={() => {
                        window.open(`${url}?t=${Date.now()}`, "_blank")
                    }} style={{ marginLeft: "1rem" }} type="primary">下载</Button></Popover>}
                </>}
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

const ImgView: FC<any> = ({ data, url }) => {
    return <div >
        <div style={{ textAlign: "center" }}>

            <Image src={`${data}?t=${Date.now()}`} style={{ maxWidth: "20rem", marginRight: "0.5rem" }}></Image>

            {url && <div>
                <Popover title={`${window.location.origin}${url}`}>
                    <Button size="small" onClick={() => { window.open(`${url}?t=${Date.now()}`, "_blank") }} type="primary">下载</Button>
                </Popover>
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
const AnalysisResultView: FC<any> = forwardRef<any, any>(({ params, visible, currentAnalysis, operatePipeline }, ref) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [analsyisResult, setAnalsyisResult] = useState<any>(null)
    const { output_dir, analysis_id } = params || {}

    const loadData = async () => {
        if (visible) {
            setLoading(true)
            // const res = await axios.get(`/file-operation/visualization-results?path=${output_dir}`)
            const res = await axios.get(`/analysis/visualization-results/${analysis_id}`)

            setAnalsyisResult(res.data)
            setLoading(false)
        }

    }

    useEffect(() => {
        if (visible) {
            loadData()
        }
    }, [visible, params?.output_dir])

    useImperativeHandle(ref, () => ({
        relaod: loadData
    }))
    if (!visible) {
        return null
    }




    // if (runningAnalysisId.includes(params.analysis_id)) {
    //     return <Spin spinning={loading} tip="请求中..." ></Spin>
    // }
    return <>
        <Card
            title={<>{params?.analysis_name}({params?.analysis_id})</>}
            size="small"
            extra={
                <Flex gap="small">
                    {currentAnalysis?.analysis_status == "failed" && <Tag color="red">分析失败</Tag>}
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        loadData()
                    }}>刷新</Button>
                    <QuestionCircleOutlined onClick={() => {
                        operatePipeline.openModal("descriptionModal", analsyisResult.description)
                    }} style={{ cursor: "pointer" }} />
                </Flex>

            }
        >


            {currentAnalysis?.analysis_status == "failed" ? <div style={{ textAlign: "center" }}>

                <LogFile file_path={currentAnalysis?.command_log_path}  ></LogFile>
            </div> : <>
                {(currentAnalysis?.analysis_status == "running" || loading) ? <Skeleton active></Skeleton> : <>



                    {analsyisResult && <>

                        {analsyisResult.images && <div style={{ display: "flex", justifyContent: "flex-start" }}>


                            {

                                Array.isArray(analsyisResult.images) ? <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                                    {analsyisResult.images.map((it: any, index: any) => (<Col key={index} span={6}>
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
                </>
                }

            </>}

            {/* <LogFile file_path={currentAnalysis?.command_log_path}  ></LogFile> */}

            {/* <Tabs
                items={[
                    {
                        label: "分析结果",
                        key: "analysis_result",
                        children: <>


                        </>
                    },
                    { label: "分析日志", key: "analysis_log", children:  },

                ]}></Tabs> */}



        </Card>


        {/*         
        {tableDesc &&<Markdown data={tableDesc}></Markdown> }
        {markdown &&<Markdown data={markdown}></Markdown> }
 */}


    </>
})
export default AnalysisResultView

