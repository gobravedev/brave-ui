import { Breadcrumb, Button, Card, message, Empty, Flex, Modal, Popconfirm, Skeleton, Switch, Tabs, Tag, Tooltip, Row, Col, Spin } from "antd"
import { FC, useEffect, useRef, useState } from "react"

import { useOutletContext } from "react-router"
import AnalysisPanel, { UpstreamAnalysisInput, UpstreamAnalysisOutput } from '@/components/analysis-sotware-panel'

import PipelineFlow from "@/components/pipeline-flow"

interface PipelineComponentProps {
    operatePipeline: any,
    component: any,
    tableRef: any,
    componentLayout: string

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
    const getInitialNodes = (component: any) => {
        const softwareList = component.software
        if (!softwareList) return []
        const position = JSON.parse(component.position) || []
        const positionMap = position.reduce((acc: any, item: any) => {
            acc[item.component_id] = item.position
            return acc
        }, {})
        // console.log(positionMap) 
        const initialNodes = softwareList.map((component: any, index: number) => {
            // const id = `${index + 1}`;
            const label = component.component_name;
            const inputs = (component.inputFile || []).map((input: any) => input);
            const outputs = (component.outputFile || []).map((output: any) => output);

            return {
                id: component.component_id,
                type: 'custom',
                position: positionMap[component.component_id] || {
                    x: index * 300, // 你可以根据需要布局位置
                    y: 100,
                },
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
    const getInitialEdges = (component: any) => {
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

const PipelineComponentLayout = () => {
    return (
        <div>
            <h2>Pipeline Component</h2>
        </div>
    );
};

export default PipelineComponent;