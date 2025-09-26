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
    onReady?: any,
    setGraphReady: any,
    networkRef: any
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
    graph,
    options = {},
    events = {},
    getNetwork,
    setGraphReady,
    networkRef,
    width,
    height
    //   width = "600px",
    //   height = "400px",
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const lastSize = useRef({ w: 0, h: 0 });

    useEffect(() => {
        if (!containerRef.current) return;
        console.log("render NetworkGraph", graph)
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
        // const resizeObserver = new ResizeObserver(() => {
        //     console.log("network.redraw")
        //     // network.redraw();
        //     network.setSize(width, height)
        //     network.fit({ animation: true }); // 让网络重新适应画布
        // });
        // resizeObserver.observe(containerRef.current);



        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width: w, height: h } = entry.contentRect;
                if (w === 0 || h === 0) continue;

                // 仅当尺寸变化时
                if (
                    Math.floor(w) === Math.floor(lastSize.current.w) &&
                    Math.floor(h) === Math.floor(lastSize.current.h)
                )
                    return;

                lastSize.current = { w, h };

                // 调用 fit 动画
                requestAnimationFrame(() => {
                    try {
                        network.setSize(`${w}px`, `${h}px`);
                        network.fit({
                            animation: {
                                duration: 400, // 动画时长（ms）
                                easingFunction: "easeInOutQuad", // 动画函数
                            },
                        });
                    } catch (e) {
                        console.warn("network resize error", e);
                    }
                });
            }
        });
        const container = containerRef.current;

        ro.observe(container);



        console.log("onReady")
        setGraphReady(true)
        // if(onReady){
        //     console.log("onReady")
        //     onReady()
        // }
        return () => {
            network.destroy();
            ro.disconnect();
            // resizeObserver.disconnect();
        };
    }, [JSON.stringify(graph)]);
    //   style={{ width, height, border: "1px solid lightgray" }}
    return <div ref={containerRef} style={{ width, height }} />;
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

