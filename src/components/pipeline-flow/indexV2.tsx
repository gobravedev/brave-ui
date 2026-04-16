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
import { CodeOutlined, EditOutlined } from '@ant-design/icons';

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

// const initialNodes = [
//   {
//     id: '1',
//     type: 'custom',
//     position: { x: 0, y: 100 },
//     data: {
//       label: 'Join with Store details',
//       color: '#2E7D32',
//       inputs: [],
//       outputs: ['out1', 'out2'],
//     },
//   },
//   {
//     id: '2',
//     type: 'custom',
//     position: { x: 250, y: 60 },
//     data: {
//       label: 'Filter for selected store',
//       color: '#7B1FA2',
//       inputs: ['in1', 'in2'],
//       outputs: ['out1', 'out2'],
//     },
//   },
//   {
//     id: '3',
//     type: 'custom',
//     position: { x: 500, y: 120 },
//     data: {
//       label: 'Calculate variance',
//       color: '#512DA8',
//       inputs: ['in1'],
//       outputs: ['out1', 'out2'],
//     },
//   },
// ];

// const initialEdges = [
//   {
//     id: 'e1-2',
//     source: '1',
//     sourceHandle: 'out1',
//     target: '2',
//     targetHandle: 'in1',
//     type: 'smoothstep',
//   },
//   {
//     id: 'e2-3',
//     source: '2',
//     sourceHandle: 'out1',
//     target: '3',
//     targetHandle: 'in1',
//     type: 'smoothstep',
//   },
// ];
const nodeTypes = { custom: CustomNode };

export default function App({ nodes, edges, setNodes, setEdges }: { nodes: any[], edges: any[], setNodes: any, setEdges: any }) {

  const { messageApi } = useOutletContext<any>()

  // useEffect(() => {
  //   setNodes(nodes)
  // }, [nodes])
  // useEffect(() => {
  //   console.log(nodes)
  // }, [nodes])

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot: any) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot: any) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot: any) => addEdge(params, edgesSnapshot)),
    [],
  );

  const deleteSelectedElements = useCallback(() => {
    const selectedNodeIds = new Set(
      nodes.filter((node: any) => node.selected).map((node: any) => node.id),
    );
    const selectedEdgeIds = new Set(
      edges.filter((edge: any) => edge.selected).map((edge: any) => edge.id),
    );

    if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) {
      return;
    }

    setNodes((nodesSnapshot: any[]) =>
      nodesSnapshot.filter((node: any) => !selectedNodeIds.has(node.id)),
    );
    setEdges((edgesSnapshot: any[]) =>
      edgesSnapshot.filter(
        (edge: any) =>
          !selectedEdgeIds.has(edge.id)
          && !selectedNodeIds.has(edge.source)
          && !selectedNodeIds.has(edge.target),
      ),
    );

    messageApi.success('删除成功');
  }, [nodes, edges, setNodes, setEdges, messageApi]);

  useEffect(() => {
    const handleDeleteKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTyping =
        tagName === 'input'
        || tagName === 'textarea'
        || target?.isContentEditable;

      if (isTyping) {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelectedElements();
      }
    };

    window.addEventListener('keydown', handleDeleteKey);
    return () => window.removeEventListener('keydown', handleDeleteKey);
  }, [deleteSelectedElements]);

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

  return (
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
        deleteKeyCode={null}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
      {/* {JSON.stringify(initialNodes,null,2)} */}

    </div>
  );
}


// CustomNode.tsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useOutletContext } from 'react-router';
import { invoke } from '@/core/ui-system/invokeV2';

export function CustomNode({ data }: any) {
  const inputs = data.inputs || [];
  const outputs = data.outputs || [];
  const onEditDetail = data?.onEditDetail;
  const onCodeDetail = data?.onCodeDetail;

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
        <Popover key={index} content={<div>{input.id} ({input.id})</div>}>
          <Handle
            key={input.id}
            type="target"
            position={Position.Left}
            id={input.id}
            style={{ top: 30 + index * 20, background: '#555' }}
          /></Popover>
      ))}

      {/* 输出口 */}
      {outputs.map((output: any, index: number) => (
        <Popover key={index} content={<div>{output.id} ({output.id})</div>}>
          <Handle
            key={output.id}
            type="source"
            position={Position.Right}
            id={output.id}
            style={{ top: 30 + index * 20, background: '#888' }}
          />
        </Popover>

      ))}
      <div
        style={{
          position: 'absolute',
          right: 4,
          bottom: 4,
          display: 'flex',
          gap: 4,
        }}
      >
        <Button
          type="text"
          size="small"
          icon={<CodeOutlined style={{ fontSize: 11 }} />}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            invoke.scriptCodeEdit.drawer(
              { component_id: data.script_id },
              {
                width: 960,
                title: `Code - ${data.label}`,
              }
            );
          }}
          style={{
            color: '#fff',
            background: 'rgba(255, 255, 255, 0.18)',
            borderRadius: 4,
            width: 16,
            height: 16,
            minWidth: 16,
            padding: 0,
            lineHeight: 1,
          }}
        />
        <Button
          type="text"
          size="small"
          icon={<EditOutlined style={{ fontSize: 11 }} />}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // console.log("Edit details for node", data.script_id);
            invoke.createOrUpdateComponent.openDrawerAsync(
              {
                component_id: data.script_id,
                structure: {
                  component_type: "script",
                },
              },
              {
                width: 960,
                title: `Edit - ${data.label}`,
              }
            );
          }}
          style={{
            color: '#fff',
            background: 'rgba(255, 255, 255, 0.18)',
            borderRadius: 4,
            width: 16,
            height: 16,
            minWidth: 16,
            padding: 0,
            lineHeight: 1,
          }}
        />
      </div>
    </div>
  );
}
