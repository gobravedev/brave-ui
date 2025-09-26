import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
// import Graph from "react-graph-vis-ts";

import { NetworkGraph as Graph } from './vis-network3'
import { DownOutlined, RightOutlined } from "@ant-design/icons"; // 引入 Ant Icon
import { Network } from "vis-network";

// import "./styles.css";
// // need to import the vis network css in order to show tooltip
// import "./network.css";
const edgeColorMap: any = {
    CORRELATED_WITH: "#1f77b4", // 蓝
    PRODUCES: "#ff7f0e",         // 橙
    MODULATES: "#2ca02c",        // 绿
    ACTIVATES: "#d62728",        // 红
    INHIBITS: "#9467bd",         // 紫
};
const nodeGroups = [
    { label: "Disease", color: "#FF9900", shape: "triangle" },
    { label: "Microbe", color: "#2B7CE9", shape: "dot" },
    { label: "Compound", color: "#5A1E5C", shape: "square" },
    { label: "Pathway", color: "#C5000B", shape: "square" },
];

const edgeTypes = [
    { label: "CORRELATED_WITH", color: "#1f77b4" },
    { label: "PRODUCES", color: "#ff7f0e" },
    { label: "MODULATES", color: "#2ca02c" },
    { label: "ACTIVATES", color: "#d62728" },
    { label: "INHIBITS", color: "#9467bd" },
];
const App: FC<any> = ({
    setGraphReady,
    graphReady,
    width,
    height,
    graphData: graphData_,
    openView,
}) => {

    // useEffect(() => {
    //     if (!graphReady) {
    //         setGraphReady(true)
    //     }

    // }, [graphReady])   
    const [legendOpen, setLegendOpen] = useState(true); // 控制折叠展开
    const [networkInstance, setNetworkInstance] = useState<any>(null);
    const networkRef = useRef<Network | null>(null);


    // const graphData = {
    //     "nodes": [
    //         { "id": "D000544", "label": "Disease", "entity_name": "Alzheimer Disease" },
    //         { "id": "D000086102", "label": "Microbe", "entity_name": "Akkermansia" },
    //         { "id": "2FRCnSHVLVqQEHYuKhiGb6", "label": "Pathway", "entity_name": "Lipid metabolism" }
    //     ],
    //     "links": [
    //         {
    //             "source": "D000544",
    //             "target": "D000086102",
    //             "relations": [
    //                 { "effect": "Down", "predicate": null, "study_name": "Posteraro B 2018", "type": "CORRELATED_WITH" },
    //                 { "effect": "Up", "predicate": null, "study_name": "Posteraro B 2018", "type": "CORRELATED_WITH" }
    //             ]
    //         },
    //         {
    //             "source": "D000086102",
    //             "target": "2FRCnSHVLVqQEHYuKhiGb6",
    //             "relations": [
    //                 { "effect": null, "predicate": null, "study_name": "Agarwala S 2021", "type": "MODULATES" }
    //             ]
    //         }
    //     ]
    // };

    // 转换函数
    function transformToVis(graphData: any) {
        // Map 原 id 到数字 id
        const idMap: any = {};
        let counter = 1;
        const nodes = graphData.nodes.map((node: any) => {
            // const newId = counter++;
            idMap[node.id] = node.id;
            return {
                id: node.id,
                label: node.entity_name,
                title: `${node.label}: ${node.entity_name}`,
                group: node.label
            };
        });

        const edges: any = [];
        graphData.links.forEach((link: any) => {
            const newId = counter++;
            const from = idMap[link.source];
            const to = idMap[link.target];

            // 把多个 relations 拼成字符串
            const titles: string[] = [];
            const labels: string[] = [];
            const relationIds: string[] = [];
            let color;

            link.relations.forEach((rel: any) => {
                titles.push(`${rel.type || ""}${rel.effect ? " (" + rel.effect + ")" : ""}`);
                labels.push(`${rel.study_name || ""}${rel.effect ? " (" + rel.effect + ")" : ""}`);
                relationIds.push(rel.association_id)
                color = edgeColorMap[rel.type]
                const edgeType = edgeTypes.find(item => item.label == rel.type)
                if (edgeType) {
                    color = edgeType.color;
                }

            });

            edges.push({
                // id: relationIds.join(","),
                from,
                to,
                color: color,
                length: 150,
                fontColor: color,
                width: link.relations.length * 2,
                title: titles.join(", "), // 鼠标悬停提示
                label: labels.join(", "), // 直接显示在边上
            });
        });

        return { nodes, edges };
    }
    // useEffect(()=>{

    // },[])
    const graphData = useMemo(() => {
        const graphData = transformToVis(graphData_)
        console.log(graphData)
        return graphData
    },[graphData_])


    // const graph = {
    //     nodes: [
    //         { id: 1, label: "Node 1", title: "node 1 tootip text" },
    //         { id: 2, label: "Node 2", title: "node 2 tootip text" },
    //         { id: 3, label: "Node 3", title: "node 3 tootip text" },
    //         { id: 4, label: "Node 4", title: "node 4 tootip text" },
    //         { id: 5, label: "Node 5", title: "node 5 tootip text" }
    //     ],
    //     edges: [
    //         { from: 1, to: 2 },
    //         { from: 1, to: 3 },
    //         { from: 2, to: 4 },
    //         { from: 2, to: 5 }
    //     ]
    // };

    // 方法1：reduce
    const groups = nodeGroups.reduce((acc, g) => {
        acc[g.label] = { shape: g.shape, color: g.color };
        return acc;
    }, {} as Record<string, { shape: string; color: string }>);


    const options = {

        layout: {
            hierarchical: false
        },
        interaction: {
            hover: true,          // 开启 hover
            // tooltipDelay: 100,    // 鼠标悬停 100ms 后显示 title
        }, physics: {
            stabilization: true
        },
        edges: {
            color: "#000000",
            scaling: {
                label: true,
            },
            shadow: true,
            smooth: true,
            arrows: {
                to: { enabled: true, type: 'arrow', scaleFactor: 1 },  // 显示箭头指向目标节点
                from: { enabled: false },                               // 如果需要也可以显示起点箭头
                middle: { enabled: false }                              // 中间箭头
            }
        },
        height: `${height}px`,
        width: `${width}px`,
        groups: groups,
        autoResize:true
        //  {
        //         Disease: {
        //             shape: "triangle",
        //             color: "#FF9900", // orange
        //         },
        //         Microbe: {
        //             shape: "dot",
        //             color: "#2B7CE9", // blue
        //         },
        //         Compound: {
        //             shape: "square",
        //             color: "#5A1E5C", // purple
        //         },
        //         Pathway: {
        //             shape: "square",
        //             color: "#C5000B", // red
        //         },
        //         // internet: {
        //         //     shape: "square",
        //         //     color: "#109618", // green
        //         // },
        //     },
    };
    // useEffect(()=>{
    //     if(networkRef.current){
    //         const networkInstance: any = networkRef.current
    //         networkInstance.setSize(width,height)
    //         console.log("redraw")
    //     }

    // },[width])

    const events = {
        click: (event: any) => {
            // console.log(event)
            // console.log(networkInstance)
            if (event.nodes.length > 0) {
                // 点击节点
                const nodeId = event.nodes[0];
                console.log("clicked node:", nodeId);
                openView("details", { id: nodeId });
            } else if (event.edges.length > 0 && networkRef.current) {
                const networkInstance: any = networkRef.current
                // console.log(networkInstance)
                // 点击边
                const edgeId = event.edges[0];
                // 获取边的两端节点
                const connectedNodes = networkInstance.getConnectedNodes(edgeId);
                console.log("clicked edge:", edgeId, "connected nodes:", connectedNodes);
                const fromNode = networkInstance.body.data.nodes.get(connectedNodes[0]);
                const toNode = networkInstance.body.data.nodes.get(connectedNodes[1]);
                // const edge = networkInstance.body.data.edges.get(edgeId);
                // console.log(edge)
                openView("relation", { fromNode: fromNode, toNode: toNode });
            }
        },
        // click: (event: any) => {
        //     if (event.nodes.length == 0) {
        //         console.log("edge", event)
        //         openView("relation", )
        //     } else {
        //         console.log("node", event)
        //         openView("details", { id: event.nodes[0] })
        //     }
        //     // console.log("click", event)
        // },
        select: function (event: any) {
            var { nodes, edges } = event;
            // console.log(event)
        }, selectNode: (node: any) => {

        }, selectEdge: (edge: any) => {

        }, initRedraw: () => {
            // console.log("initRedraw")
        }
    };
    return (
        <div style={{ position: "relative", width: width, height: height }}>
            {/* , width: width, height: height  */}
            {/* Floating Legend */}
            <div
                style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    padding: 12,
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    zIndex: 10,
                    maxWidth: 220,
                    fontFamily: "Arial, sans-serif",
                    fontSize: 13,
                    userSelect: "none",
                    width: "13rem"
                }}
            >
                {/* Toggle Button */}
                <div
                    onClick={() => setLegendOpen(!legendOpen)}
                    style={{
                        cursor: "pointer",
                        fontWeight: 600,
                        marginBottom: `${legendOpen ? "1rem" : 0}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <span>Legend</span>
                    {legendOpen ? <DownOutlined /> : <RightOutlined />}
                </div>


                {legendOpen && (
                    <>
                        <div style={{ marginBottom: 8 }}>
                            <strong>Node Types</strong>
                            {nodeGroups.map((g) => (
                                <div
                                    key={g.label}
                                    style={{ display: "flex", alignItems: "center", margin: "4px 0" }}
                                >
                                    <div
                                        style={{
                                            width: 18,
                                            height: 18,
                                            backgroundColor: g.color,
                                            clipPath:
                                                g.shape === "triangle"
                                                    ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                                                    : "none",
                                            borderRadius: g.shape === "dot" ? "50%" : "0",
                                            marginRight: 6,
                                        }}
                                    />
                                    <span>{g.label}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <strong>Edge Types</strong>
                            {edgeTypes.map((e) => (
                                <div
                                    key={e.label}
                                    style={{ display: "flex", alignItems: "center", margin: "4px 0" }}
                                >
                                    <div
                                        style={{
                                            width: 30,
                                            height: 4,
                                            backgroundColor: e.color,
                                            marginRight: 6,
                                            borderRadius: 2,
                                        }}
                                    />
                                    <span>{e.label}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* {JSON.stringify()} */}
            <Graph
                width={ `${width}px`}
                height={ `${height}px`}
                networkRef={networkRef}
                setGraphReady={setGraphReady}
                graph={graphData}
                options={options}
                events={events}
                getNetwork={(network: any) => {
                    // debugger
                    setNetworkInstance(network)
                    //  if you want access to vis.js network api you can set the state in a parent component using this property
                }}
            />
        </div>

    );
}

export default App