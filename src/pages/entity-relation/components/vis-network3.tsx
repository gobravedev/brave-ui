import React, { useEffect, useRef } from "react";
import { Network, Options, Edge, Node } from "vis-network";

interface GraphData {
    nodes: Node[];
    edges: Edge[];
}

type Events = {
    [eventName: string]: (params: any) => void;
};

interface NetworkGraphProps {
    graph: GraphData;
    options?: Options;
    events?: Events;
    getNetwork?: (network: Network) => void;
    width?: string;
    height?: string;
    onReady?:any,
    setGraphReady:any,
    networkRef:any
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
    graph,
    options = {},
    events = {},
    getNetwork,
    setGraphReady,
    networkRef
    //   width = "600px",
    //   height = "400px",
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        console.log("render NetworkGraph",graph)
        setGraphReady(false)
        const nodes = graph.nodes
        const edges = graph.edges

        const data = { nodes, edges };
        const network = new Network(containerRef.current, data, options);
        networkRef.current = network;

        // 绑定事件
        Object.keys(events).forEach((eventName: any) => {
            network.on(eventName, events[eventName]);
        });

        // 暴露 network 实例
        if (getNetwork) getNetwork(network);
        console.log("onReady")
        setGraphReady(true)
        // if(onReady){
        //     console.log("onReady")
        //     onReady()
        // }
        return () => {
            network.destroy();
        };
    }, [JSON.stringify(graph)]);
    //   style={{ width, height, border: "1px solid lightgray" }}
    return <div ref={containerRef} />;
};


// const App: React.FC = () => {
//     const graph = {
//         nodes: [
//             { id: 1, label: "Node 1" },
//             { id: 2, label: "Node 2" },
//             { id: 3, label: "Node 3" },
//         ] as Node[],
//         edges: [
//             { from: 1, to: 2 },
//             { from: 1, to: 3 },
//         ] as Edge[],
//     };

//     const options = {
//         physics: { enabled: true },
//         edges: { arrows: "to" },
//     };

//     const events = {
//         click: (params: any) => {
//             console.log("点击节点或边:", params);
//         },
//         doubleClick: (params: any) => {
//             console.log("双击:", params);
//         },
//     };

//     return (
//         <div>
//             <h2>React + TS 封装 Vis-Network</h2>
//             <NetworkGraph
//                 graph={graph}
//                 options={options}
//                 events={events}
//                 getNetwork={(network) => {
//                     console.log("Network 实例:", network);
//                 }}
//                 width="800px"
//                 height="500px"
//             />
//         </div>
//     );
// };

// export default App;

