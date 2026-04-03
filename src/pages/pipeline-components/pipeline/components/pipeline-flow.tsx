import PipelineFlow from "@/components/pipeline-flow"
import { FC } from "react"

const PipelineFlowComponent: FC<any> = ({component }) => {

    const getInitialNodes = (component: any) => {
        const softwareList = component.software
        if (!softwareList) return []
        const position = JSON.parse(component.position) || []
        console.log(position)
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
    return <PipelineFlow
        initialEdges={getInitialEdges(component)}
        initialNodes={getInitialNodes(component)}
        component={component}

    ></PipelineFlow>
} 

export default PipelineFlowComponent;