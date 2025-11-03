import { Breadcrumb, Button, Card, message, Empty, Flex, Modal, Popconfirm, Skeleton, Switch, Tabs, Tag, Tooltip, Row, Col, Spin } from "antd"
import { FC, lazy, Suspense, useEffect, useRef, useState } from "react"

import { useOutletContext } from "react-router"
import AnalysisPanel, { UpstreamAnalysisInput, UpstreamAnalysisOutput } from '@/components/analysis-sotware-panel'

import PipelineFlow from "@/components/pipeline-flow"

const PipelineComponent = ({ operatePipeline, component, setMenus, ...rest }: any) => {
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
                label: item.component_name || item.component_id,
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
   

    useEffect(() => {
        if (component) {
            setSoftwareList(getPipline(component))
            setMenus([
                {
                    key: 'Navigation_one',
                    label: 'Navigation one',
                },
                {
                    key: 'sub2',
                    label: 'Navigation Two',
                    children: [
                        { key: '5', label: 'Option 5' },
                        { key: '6', label: 'Option 6' },

                    ],
                },

                {
                    key: 'sub4',
                    label: 'Navigation Three',
                    children: [
                        { key: '9', label: 'Option 9' },
                        { key: '10', label: 'Option 10' },
                        { key: '11', label: 'Option 11' },
                        { key: '12', label: 'Option 12' },
                    ],
                }

            ])
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
        {/* <PipelineFlow
            initialEdges={getInitialEdges(component)}
            initialNodes={getInitialNodes(component)}
            component={component}

        ></PipelineFlow> */}
        <div style={{ marginTop: "1rem" }}></div>
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



export default PipelineComponent;