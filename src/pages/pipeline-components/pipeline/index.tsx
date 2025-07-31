import { Breadcrumb, Button, Card, Empty, Flex, message, Modal, Skeleton, Tabs, Tag, Tooltip } from "antd"
import { FC, useEffect, useRef, useState } from "react"
import AnalysisPanel, { UpstreamAnalysisInput, UpstreamAnalysisOutput } from '../../../components/analysis-sotware-panel'
import Meta from "antd/es/card/Meta"
import { colors } from '@/utils/utils'

import axios from "axios"
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router"
import { deletePipelineRelationApi, listPipeline } from "@/api/pipeline"
import { CreateORUpdatePipelineCompnentRelation, CreateOrUpdatePipelineComponent } from "../../../components/create-pipeline"
import ModuleEdit from "../../../components/module-edit"
import { useModal, useModals } from '@/hooks/useModal'
import ImportData from '@/components/import-data'
import BioDatabases from '@/components/bio-databases'
import ParamsView from "../../../components/params-view"
// import InstallNamespace from "@/components/namespace-operature"
import DependComponent from "@/components/depend-component"
import MonacoEditorModal from "@/components/react-monaco-editor"
import React from "react"
import { BindSample, MetadataModal } from "@/pages/sample"
import MetadataForm from "@/components/metadata-form"
import AnalysisResultEdit from "@/components/analysis-result-edit"
import OpenFile from "@/components/open-file"
import PipelineFlow from "@/components/pipeline-flow"
import SortSoftwareModal from "@/components/sort-software"
const Pipeline: FC<any> = ({ }) => {
    console.log("Pipeline")
    const { component_type, component_id: name } = useParams()
    // console.log(pipelineId)
    const [pipeline, setPipeline] = useState<any>()
    const navigate = useNavigate();

    const [test, setTest] = useState<any>(true)
    const [messageApi, contextHolder] = message.useMessage();
    const tableRef = {
        inputFile: useRef<HTMLInputElement>(null),
        outputFile: useRef<HTMLInputElement>(null)
    };
    // const [editor, setEditor] = useState<any>({
    //     open: false,
    // })
    // const updateEditor = (key: string, value: any) => {
    //     setEditor((prev: any) => ({
    //         ...prev,
    //         [key]: value
    //     }));
    // };
    const { modal, openModal, closeModal } = useModal();
    const { modals, openModals, closeModals } = useModals(["modalD", "metadataModal", "bindSample"])

    // const [createOpen, setCreateOpen] = useState<any>(false)
    // const [record, setRecord] = useState<any>()
    // const [pipelineStructure, setPipelineStructure] = useState<any>()



    const loadFunction: any = (data: any[]) => {
        if (!data) return undefined
        return data.map((item: any) => {
            if ("paramsFun" in item) {
                item.paramsFun = eval(item.paramsFun)
            }
            if ("formJson" in item) {
                item['formJson'].map((it2: any) => {
                    if ("filter" in it2) {
                        it2['filter'].map((it3: any) => {
                            it3.method = eval(it3.method)
                            return it3
                        })
                    }

                    it2.field = eval(it2.field)
                    return it2
                })

            }
            return item
        })
    }
    const loadColumnRender: any = (data: any[]) => {
        if (!data) return []
        return data.map((item: any) => {
            if ("render" in item) {
                const render = eval(item.render)
                item.render = (_: any, record: any) => <>
                    {render(record)}
                </>
            }
            return item
        })
    }


    // [
    //     {
    //         name: "查看比对日志",
    //         analysisType: "one", // multiple or one
    //         sampleGroupJSON: false,
    //         paramsFun: (record: any) => {
    //             return {
    //                 "text": record.content.log,
    //             }
    //         },
    //         sampleGroupApI: false,
    //         saveAnalysisMethod: "text",
    //         moduleName: "text",
    //         sampleSelectComp: false,
    //         tableDesc: ` `,

    //     }
    // ]
    const loadData = async () => {
        let api = `/get-pipeline-v2/${name}?component_type=${component_type}`
        if (component_type == "script") {
            api = `/get-component-parent/${name}?component_type=${component_type}`
        }
        const resp = await axios.get(api)
        // console.log(resp.data)
        let pipeline = resp.data
        if ("content" in pipeline) {
            const content = JSON.parse(pipeline['content'])
            pipeline = { ...content, ...pipeline }
        }

        setPipeline(pipeline)
        console.log(pipeline)
        // console.log(content)，
        // const items = getPipline(data)
        // setItems(items)
        // if (resp.data.items && Array.isArray(resp.data.items) && resp.data.items.length > 1) {
        //     const item = data.items[0]
        //     const upstreamFormList = data.items
        //         .filter((item: any) => item.upstreamFormJson && Array.isArray(item.upstreamFormJson))       // 确保 upstreamFormJson 存在并是数组
        //         .flatMap((item: any) => item.upstreamFormJson);
        //     const parseAnalysisResultModule = data.items
        //         .filter((item: any) => item.parseAnalysisResultModule && Array.isArray(item.parseAnalysisResultModule))       // 确保 upstreamFormJson 存在并是数组
        //         .flatMap((item: any) => item.parseAnalysisResultModule);
        //     const wrapPipeline = {
        //         key: 0,
        //         label: "总流程",
        //         children: <>
        //             <AnalysisPanel
        //                 wrapAnalysisPipeline={data.analysisPipline}
        //                 inputAnalysisMethod={item.inputAnalysisMethod}
        //                 analysisPipline={data.analysisPipline}
        //                 upstreamFormJson={upstreamFormList}
        //                 appendSampleColumns={loadColumnRender(item.appendSampleColumns)}
        //                 parseAnalysisParams={{
        //                     parse_analysis_module: data.parseAnalysisModule,
        //                     parse_analysis_result_module: parseAnalysisResultModule
        //                 }}
        //                 analysisType={item.analysisType ? item.analysisType : "sample"}>
        //             </AnalysisPanel>
        //             {/* {data.analysisPipline} */}
        //         </>
        //     }
        //     setItems([wrapPipeline, ...items])
        // } else {
        //     setItems(items)
        // }



    }



    const deletePipelineRelation = async (realtionId: any) => {
        try {
            const resp = await deletePipelineRelationApi(realtionId)
            messageApi.success("删除成功!")
            loadData()
        } catch (error: any) {
            console.log(error)
            messageApi.error(`删除失败!${error.response.data.detail}`)
        }
    }
    const datelePipeline = async (pipelineId: any) => {
        try {
            const resp = await axios.delete(`/delete-pipeline/${pipelineId}`)
            messageApi.success("删除成功!")
            loadData()
        } catch (error: any) {
            console.log(error)
            messageApi.error(`删除失败!${error.response.data.detail}`)
        }
    }
    const operatePipeline = {
        deletePipelineRelation: deletePipelineRelation,
        openModal: openModal,
        openModals: openModals
    }

    useEffect(() => {
        loadData()
    }, [])
    return <div style={{ maxWidth: "1500px", margin: "0 auto" }}>
        {contextHolder}
        {/* {JSON.stringify(pipeline)} */}
        <Flex style={{ marginBottom: "1rem" }} justify={"space-between"} align={"center"} gap="small">
            <div >
                {pipeline ? <>
                    <h2 style={{ margin: 0 }}>
                        {pipeline?.component_name}
                        <Tooltip title={pipeline?.namespace}>
                            <span style={{ margin: "0", color: "rgba(0, 0, 0, 0.45)", fontSize: "1rem" }}> {pipeline?.namespace_name}</span>
                        </Tooltip>
                    </h2>
                    <p style={{ margin: "0", color: "rgba(0, 0, 0, 0.45)" }}>{pipeline?.description}</p>


                    {import.meta.env.MODE == "development" && <>
                        <p style={{ margin: "0", color: "rgba(0, 0, 0, 0.45)" }}>{pipeline?.component_id}</p></>}

                    {pipeline.tags && Array.isArray(pipeline.tags) && pipeline.tags.map((tag: any, index: any) => (
                        <Tag style={{ marginTop: "0.5rem" }} key={index} color={colors[index]}>{tag}</Tag>
                    ))}
                </> : <Skeleton active></Skeleton>}
            </div>
            <Flex gap="small" wrap>
                {component_type == "pipeline" && <>
                    <Button size="small" color="cyan" variant="solid" onClick={() => {
                        openModal("sortSoftware", { software: pipeline.software })
                    }}>更新排序</Button>
                </>}
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                        operatePipeline.openModal("modalG", pipeline)
                    }}>查看依赖</Button>
                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    openModals("metadataModal", { ...pipeline, operatePipeline: operatePipeline })
                }}>metadata</Button>

                <Button size="small" color="cyan" variant="solid" onClick={() => {
                    openModal("modalC", {
                        data: pipeline, structure: {
                            component_type: component_type,
                        }
                    })
                }}>更新{component_type}</Button>

                <Button size="small" color="primary" variant="solid" onClick={loadData}>刷新</Button>
                <Button size="small" color="primary" variant="solid" onClick={() => navigate(`/${component_type}-card`)}>返回</Button>
            </Flex>

        </Flex>
        {/* 111111 */}
        {/* <ComponentsRender component_type={component_type || ""} operatePipeline={{
            deletePipelineRelation: deletePipelineRelation,
            openModal: openModal
        }} component={pipeline} /> */}
        <MemoizedComponentsRender
            component_type={component_type || ""}
            component={pipeline}
            tableRef={tableRef}
            operatePipeline={operatePipeline} />
        {/* <PipelineComponent /> */}
        {/* <Button onClick={() => {
            setTest(!test)
        }}>测试</Button> */}


        {/* {
                pipeline_type: "wrap_pipeline",
                parent_pipeline_id: "0"

            } */}
        <ModuleEdit
            visible={modal.key == "modalB" && modal.visible}
            onClose={closeModal}
            callback={loadData}
            params={modal.params}
        >
        </ModuleEdit>
        <CreateORUpdatePipelineCompnentRelation
            callback={loadData}
            // pipelineStructure={pipelineStructure}
            // data={record}
            visible={modal.key == "modalA" && modal.visible}
            onClose={closeModal}
            params={{ ...modal.params, namespace: pipeline?.namespace }}></CreateORUpdatePipelineCompnentRelation>
        <CreateOrUpdatePipelineComponent
            callback={loadData}
            // pipelineStructure={pipelineStructure}
            // data={record}
            visible={modal.key == "modalC" && modal.visible}
            onClose={closeModal}
            params={modal.params}></CreateOrUpdatePipelineComponent>

        <ImportData
            visible={modals.modalD.visible}
            params={modals.modalD.params}
            onClose={() => closeModals("modalD")}></ImportData>
        <BioDatabases
            visible={modal.key == "modalE" && modal.visible}
            onClose={closeModal}
            params={modal.params}></BioDatabases>
        <ParamsView
            visible={modal.key == "modalF" && modal.visible}
            onClose={closeModal}
            params={modal.params}></ParamsView>
        <DependComponent
            visible={modal.key == "modalG" && modal.visible}
            onClose={closeModal}
            callback={loadData}
            params={modal.params}></DependComponent>
        <MonacoEditorModal
            visible={modal.key == "modalH" && modal.visible}
            onClose={closeModal}
            value={modal.params}></MonacoEditorModal>
        {/* <AnalysisResultEdit
            visible={modal.key == "analysisResultEdit" && modal.visible}
            onClose={closeModal}
            params={modal.params}></AnalysisResultEdit> */}
        <MetadataModal
            visible={modals.metadataModal.visible}
            onClose={() => closeModals("metadataModal")}
            params={modals.metadataModal.params}></MetadataModal>
        <MetadataForm
            visible={modal.key == "metadataForm" && modal.visible}
            onClose={closeModal}
            params={modal.params}></MetadataForm>
        <BindSample
            visible={modals.bindSample.visible}
            onClose={() => closeModals("bindSample")}
            operatePipeline={operatePipeline}
            params={modals.bindSample.params}></BindSample>


        <OpenFile
            visible={modal.key == "openFile" && modal.visible}
            onClose={closeModal}
            params={modal.params}></OpenFile>

        <SortSoftwareModal
            visible={modal.key == "sortSoftware" && modal.visible}
            onClose={closeModal}
            params={modal.params} callback={loadData}></SortSoftwareModal>
    </div>
}


export default Pipeline

interface PipelineComponentProps {
    operatePipeline: any,
    component: any,
    tableRef: any,
}
interface PipelineComponentRenderProps extends PipelineComponentProps {
    component_type: string
}
const ComponentsRender = ({ component_type, operatePipeline, component, ...rest }: PipelineComponentRenderProps) => {
    if (!component_type || !component) return null

    const componentMap = {
        "pipeline": PipelineComponent,
        "software": SoftwareComponent,
        "file": FileComponent,
        "script": ScriptComponent,
        "module": "module-card",
    }
    const Component = componentMap[component_type as keyof typeof componentMap]
    if (!Component) return null
    return <Component operatePipeline={operatePipeline} component={component} {...rest} />
}
const MemoizedComponentsRender = React.memo(ComponentsRender, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps)
});

const SoftwareComponent = ({ operatePipeline, component, ...rest }: PipelineComponentProps) => {


    return <>
        <AnalysisPanel

            // inputAnalysisMethod={item.inputAnalysisMethod}
            // analysisPipline={item.analysisPipline}
            // analysisMethod={item.analysisMethod}
            // upstreamFormJson={item.upstreamFormJson}
            {...component}
            // pipeline={{
            //     component_id: component.component_id

            // }}
            // editor={editor}
            // updateEditor={updateEditor}
            operatePipeline={operatePipeline}

        >
        </AnalysisPanel>
    </>

}

const FileComponent = ({ operatePipeline, component, ...rest }: PipelineComponentProps) => {
    const { project } = useOutletContext<any>()
    return <>
        <UpstreamAnalysisOutput
            {...component}
            analysisMethod={[component]}
            operatePipeline={operatePipeline}
            project={project}
        ></UpstreamAnalysisOutput>


    </>

}

const ScriptComponent = ({ operatePipeline, component, ...rest }: PipelineComponentProps) => {
    const { project } = useOutletContext<any>()

    return <>
        {/* {JSON.stringify(component)} */}
        <UpstreamAnalysisOutput
            script={component.script}
            analysisMethod={component.parent ||[]}
            operatePipeline={operatePipeline}
            project={project}
        ></UpstreamAnalysisOutput>
    </>
}

const PipelineComponent = ({ operatePipeline, component, ...rest }: PipelineComponentProps) => {
    const [softwareList, setSoftwareList] = useState<any>([])
    const { project } = useOutletContext<any>()

    const getPipline: any = (pipeline: any) => {

        // console.log(pipeline)
        const softwareList: any[] = pipeline.software
        if (!softwareList) return []
        return softwareList.map((item, index) => {
            // const { downstreamAnalysis, appendSampleColumns, analysisType, ...rest } = item
            return {
                key: item.component_id,
                label: item.name || item.component_id,
                children: <AnalysisPanel

                    // inputAnalysisMethod={item.inputAnalysisMethod}
                    // analysisPipline={item.analysisPipline}
                    // analysisMethod={item.analysisMethod}
                    // upstreamFormJson={item.upstreamFormJson}
                    {...rest}
                    {...item}
                    hiddenUpstreamAnalysis={true}
                    pipeline={{
                        component_id: pipeline.component_id

                    }}
                    // editor={editor}
                    // updateEditor={updateEditor}
                    operatePipeline={operatePipeline}
                // datelePipeline={datelePipeline}
                // setPipelineStructure={setPipelineStructure}
                // setOperateOpen={setCreateOpen}
                // setPipelineRecord={setRecord}
                // openModal={openModal}
                // wrapAnalysisPipeline={wrapAnalysisPipeline}
                // downstreamAnalysis={loadFunction(downstreamAnalysis)}
                // appendSampleColumns={loadColumnRender(appendSampleColumns)}
                // parseAnalysisParams={{
                //     parse_analysis_module: parseAnalysisModule,
                //     parse_analysis_result_module: parseAnalysisResultModule
                // }}
                >
                </AnalysisPanel>
            }
        })
    }
    const getInitialNodes = (component:any) => {
        const softwareList = component.software
        const position = JSON.parse(component.position) || []
        const positionMap = position.reduce((acc:any,item:any)=>{
            acc[item.component_id] = item.position
            return acc
        },{})
        // console.log(positionMap) 
        const initialNodes = softwareList.map((component:any, index:number) => {
            // const id = `${index + 1}`;
            const label = component.component_name;
            const inputs = (component.inputFile || []).map((input:any) => input);
            const outputs = (component.outputFile || []).map((output:any) => output);

            return {
                id:component.component_id,
                type: 'custom',
                position:  positionMap[component.component_id] || {
                    x: index * 300, // 你可以根据需要布局位置
                    y: 100,
                } ,
                data: {
                    label,
                    color: '#' + ((1 << 24) * Math.random() | 0).toString(16), // 随机颜色
                    inputs,
                    outputs,
                },
            };
        });
        return initialNodes || []
    }
    const getInitialEdges = (component:any) => {
        const edges = JSON.parse(component.edges)
        return edges || []
    }

    useEffect(() => {
        if (component) {
            setSoftwareList(getPipline(component))
        }
    }, [JSON.stringify(component)])

    console.log("--->PipelineComponent渲染")
    return <>
        {/* <AnalysisPanel>
        </AnalysisPanel> */}

        {/* <pre>
            {JSON.stringify(component?.items[0]["inputFile"], null, 2)}
        </pre> */}
        {/* {JSON.stringify(component.software,null,2)} */}
        {/* <AnalysisPanel
            {...component}
            operatePipeline={operatePipeline}

        >
        </AnalysisPanel>
        */}

            {/* {JSON.stringify(getInitialNodes(component.software))} */}
        <PipelineFlow
            initialEdges={getInitialEdges(component)}
            initialNodes={getInitialNodes(component)}
            component={component}
            
        ></PipelineFlow>
        <div style={{marginTop:"1rem"}}></div>
        <UpstreamAnalysisInput
        {...component}
        project={project}
        operatePipeline={operatePipeline}   
        inputAnalysisMethod={component.inputFile}
        >
        </UpstreamAnalysisInput>
        {/* {JSON.stringify(softwareList)} */}
        {component && Array.isArray(component?.software) ?
            <Tabs destroyInactiveTabPane={true} items={softwareList}></Tabs>
            :

            <Empty>
                <Button style={{ marginRight: "0.5rem" }} color="cyan" variant="solid" onClick={() => {
                    operatePipeline.openModal("modalC", {
                        data: undefined, structure: {
                            component_type: "software",
                            relation_type: "pipeline_software",
                            parent_component_id: component.component_id,
                            pipeline_id: component.component_id
                        }
                    })
                }}>新增软件</Button>
                <Button color="cyan" variant="solid" onClick={() => {
                    operatePipeline.openModal("modalA", {
                        data: undefined, pipelineStructure: {
                            relation_type: "pipeline_software",
                            parent_component_id: component.component_id,
                            pipeline_id: component.component_id

                        }
                    })
                }}>添加软件</Button>
            </Empty>}

    </>
}