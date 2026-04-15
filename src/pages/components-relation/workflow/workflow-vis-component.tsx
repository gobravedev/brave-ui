import PipelineFlow from "@/components/pipeline-flow/indexV2"
import { Button, Card, Space, Spin } from "antd"
import axios from "axios"
import { FC, useEffect, useMemo, useState } from "react"
import { ReloadOutlined } from '@ant-design/icons'
import { colors } from "@/utils/utils"
import { useGlobalMessage } from "@/hooks/useGlobalMessage"
import { useComponentStore } from "@/store-zustand/components"
type Prop = {
    relation_id: string
}
const WorkflowVisComponent: FC<Prop> = ({ relation_id }) => {

    // const [data, setData] = useState<any>(null)





    const [nodes, setNodes] = useState<any[]>([]);
    const [edges, setEdges] = useState<any[]>([]);
    const [loading, setLoading] = useState(false)
    const message = useGlobalMessage()
    const loadData = async () => {
        setLoading(true)
        const resp = await axios.get(`/tools/get-workflow-vis/${relation_id}`)
        // setData(resp.data)
        if (resp.data?.nodes) {
            const nodes = getInitialNodesV2(resp.data.nodes)
            setNodes(nodes)
            setEdges(resp.data.edges || [])
        }

        setLoading(false)

    }
    useEffect(() => {
        loadData()
    }, [])

    const formatNode = (node: any, index: number) => {
        const label = node.name;
        const position = node.position || { x: 0, y: index * 100 };
        const color = node.color || '#' + ((1 << 24) * Math.random() | 0).toString(16) // 随机颜色
        const inputs = Object.entries(node.inputs).map(([key, value]: [string, any]) => ({
            id: key, // 将原本的键保存下来
            ...value // 展开原本的值
        }));
        // const inputs = (|| []).map((inputs: any) => inputs);
        const outputs = Object.entries(node.outputs).map(([key, value]: [string, any]) => ({
            id: key, // 将原本的键保存下来
            ...value // 展开原本的值
        }));
        // const outputs = (node.outputs || []).map((outputs: any) => outputs);

        return {
            id: node.id,
            type: 'custom',
            position: position,
            // {
            //     x: index * 300, // 你可以根据需要布局位置
            //     y: 100,
            // },
            data: {
                label,
                color: color, // 随机颜色
                inputs,
                outputs,
            },
        };
    }

    const instance = useMemo(() => {
        return {
            addNode: (args: any) => {
                console.log("Adding node to workflow vis", args);
                const node = formatNode(args, 0)
                setNodes((prevNodes) => [...prevNodes, node]);
            }

        }
    }, [])
    const { register, unregister } = useComponentStore();
    useEffect(() => {
        register("graph", relation_id, instance);
        return () => {
            // debugger
            unregister("graph", relation_id, instance);
        }
    }, []);
    const getInitialNodesV2 = (nodes: any) => {
        // const nodes = data?.nodes
        if (!nodes) return []

        // console.log(positionMap) 
        const initialNodes = nodes.map((node: any, index: number) => {
            return formatNode(node, index)
        });
        return initialNodes || []
    }

    const save = async () => {
        // const edgesParams = edges.map(edge => ({
        //     source: edge.source,
        //     sourceHandle: edge.sourceHandle,
        //     target: edge.target,
        //     targetHandle: edge.targetHandle,
        // }));
        const nodesParams = nodes.map(node => ({
            script_id: node.id,

            position: node.position,
            // color: node.data.color,
        }));

        const params = {
            nodes: nodesParams,
            edges: edges,
        }
        const resp = await axios.post("/save-pipeline-relation", {
            relation_id: relation_id,
            dag_definition: JSON.stringify(params)
        })
        message.success("Structure saved")


    }


    return <Card
        size="small"
        extra={<Space>
            <Button size="small" color="cyan" variant="solid" onClick={save}>保存</Button>
            <Button size="small" color="cyan" variant="solid" onClick={loadData} icon={<ReloadOutlined />}></Button>
        </Space>}
    >
        {/* {JSON.stringify(edges)} */}
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        <Spin spinning={loading}>
            <PipelineFlow
                nodes={nodes}
                edges={edges}
                setNodes={setNodes}
                setEdges={setEdges}
            ></PipelineFlow>
        </Spin>

    </Card>
}

export default WorkflowVisComponent;