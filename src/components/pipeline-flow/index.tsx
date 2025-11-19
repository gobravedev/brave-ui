import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Popover } from 'antd';

import { memo } from 'react';
import { savePipelineComponentsEdgesApi } from '@/api/pipeline';

const DEFAULT_HANDLE_STYLE = {
  width: 10,
  height: 10,
  bottom: -5,
};
export const CustomNode2 = memo(({ data, isConnectable }: any) => {
  return (
    <>
      <div style={{ padding: 25 }}>
        <div>Node</div>
        <Handle
          type="source"
          id="red"
          position={Position.Bottom}
          style={{ ...DEFAULT_HANDLE_STYLE, left: '15%', background: 'red' }}
          onConnect={(params) => console.log('handle onConnect', params)}
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="blue"
          style={{ ...DEFAULT_HANDLE_STYLE, left: '50%', background: 'blue' }}
          isConnectable={isConnectable}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          id="orange"
          style={{ ...DEFAULT_HANDLE_STYLE, left: '85%', background: 'orange' }}
          isConnectable={isConnectable}
        />
      </div>
    </>
  );
});

const initialNodes = [
  {
    id: '1',
    type: 'custom',
    position: { x: 0, y: 100 },
    data: {
      label: 'Join with Store details',
      color: '#2E7D32',
      inputs: [],
      outputs: ['out1', 'out2'],
    },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 250, y: 60 },
    data: {
      label: 'Filter for selected store',
      color: '#7B1FA2',
      inputs: ['in1', 'in2'],
      outputs: ['out1', 'out2'],
    },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 500, y: 120 },
    data: {
      label: 'Calculate variance',
      color: '#512DA8',
      inputs: ['in1'],
      outputs: ['out1', 'out2'],
    },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    sourceHandle: 'out1',
    target: '2',
    targetHandle: 'in1',
    type: 'smoothstep',
  },
  {
    id: 'e2-3',
    source: '2',
    sourceHandle: 'out1',
    target: '3',
    targetHandle: 'in1',
    type: 'smoothstep',
  },
];
const nodeTypes = { custom: CustomNode };

export default function App({ initialNodes,initialEdges,component }: { initialNodes: any[],initialEdges:any[],component:any }) {

  const {messageApi} = useOutletContext<any>()
  const [nodes, setNodes] = useState<any[]>(initialNodes);
  const [edges, setEdges] = useState<any[]>(initialEdges);
  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes])
  // useEffect(() => {
  //   console.log(nodes)
  // }, [nodes])

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot: any) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot: any) => addEdge(params, edgesSnapshot)),
    [],
  );

  // const loadData = async () => {
  //   const res = await axios.get(`/get-pipeline-dag/59bead89-13af-4956-951a-1dcef1b3b7a3`)
  //   console.log(res)
  //   const initialNodes = res.data.nodes.map((c: any, index: number) => ({
  //     id: c.component_id,
  //     // position: c.position,
  //     position: c.position || { x: 0, y: index * 100 },

  //     data: { label: c.component_id },
  //   }));
  //   setNodes(initialNodes)
  //   const initialEdges = res.data.edges.map((e: any) => ({
  //     id: `${e.source}-${e.target}`,
  //     source: e.source,
  //     target: e.target,
  //   }));
  //   setEdges(initialEdges)
  //   console.log(initialNodes)
  //   console.log(initialEdges)
  // }
  // useEffect(() => {
  //     loadData()
  // }, [])
  const save = async () => {
    const position = nodes.map((node: any) => ({
      component_id: node.id,
      position: node.position,
   
      
    }))
    const params = { 
      position:JSON.stringify(position),
      edges:JSON.stringify(edges),
      component_id: component.component_id,
    }
    const resp = await savePipelineComponentsEdgesApi(params)
    console.log(resp)
    messageApi.success('保存成功')
  }

  return (
    <Card size='small' title="Workflow" extra={<Button size="small" color="cyan" variant="solid" onClick={save}>保存</Button>} bodyStyle={{ padding: 0 }}>
      <div style={{ height: '60vh' }}>
        {/* <Button onClick={loadData}>loadData</Button> */}
        {/* {JSON.stringify(edges)} */}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}

          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
        {/* {JSON.stringify(initialNodes,null,2)} */}

      </div>
    </Card>
  );
}


// CustomNode.tsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useOutletContext } from 'react-router';

export function CustomNode({ data }: any) {
  const inputs = data.inputs || [];
  const outputs = data.outputs || [];

  return (
    <div
      style={{
        background: data.color || '#1976d2',
        color: 'white',
        padding: 10,
        borderRadius: 12,
        minWidth: 150,
        position: 'relative',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{data.label}</div>

      {/* 输入口 */}
      {inputs.map((input: any, index: number) => (
        <Popover key={index} content={<div>{input.component_name} ({input.component_id})</div>}>
          <Handle
            key={input.component_id}
            type="target"
            position={Position.Left}
            id={input.component_id}
            style={{ top: 30 + index * 20, background: '#555' }}
          /></Popover>
      ))}

      {/* 输出口 */}
      {outputs.map((output: any, index: number) => (
        <Popover key={index} content={<div>{output.component_name} ({output.component_id})</div>}>
          <Handle
            key={output.component_id}
            type="source"
            position={Position.Right}
            id={output.component_id}
            style={{ top: 30 + index * 20, background: '#888' }}
          />
        </Popover>

      ))}
    </div>
  );
}
