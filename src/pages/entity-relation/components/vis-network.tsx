import React, { FC, useEffect } from "react";
import ReactDOM from "react-dom";
import Graph from "react-graph-vis-ts";

// import "./styles.css";
// // need to import the vis network css in order to show tooltip
// import "./network.css";

const App: FC<any> = ({ setGraphReady,
    graphReady,
    width,
    height,
    graphData: graphData_,
    openView,
}) => {

    useEffect(() => {
        if (!graphReady) {
            setGraphReady(true)
        }

    }, [graphReady])


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
                title: `${node.label}: ${node.entity_name}`
            };
        });

        const edges: any = [];
        graphData.links.forEach((link: any) => {
            const from = idMap[link.source];
            const to = idMap[link.target];
        
            // 把多个 relations 拼成字符串
            const titles: string[] = [];
            const labels: string[] = [];
        
            link.relations.forEach((rel: any) => {
                titles.push(`${rel.type || ""}${rel.effect ? " (" + rel.effect + ")" : ""}`);
                labels.push(`${rel.study_name || ""}${rel.effect ? " (" + rel.effect + ")" : ""}`);
            });
        
            edges.push({
                from,
                to,
                title: titles.join(", "), // 鼠标悬停提示
                label: labels.join(", "), // 直接显示在边上
            });
        });

        return { nodes, edges };
    }
    // useEffect(()=>{

    // },[])
    const graphData = transformToVis(graphData_)
    console.log(graphData)
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

    const options = {
        layout: {
            hierarchical: false
        },
        edges: {
            color: "#000000"
        },
        height: `${height}px`,
        width: `${width}px`
    };

    const events = {
        select: function (event: any) {
            var { nodes, edges } = event;
            // console.log(event)
        }, selectNode: (node:any) => {
            console.log(node)
            openView("details", { id: node.nodes[0]})

        }
    };
    return (
        <>
            {/* {JSON.stringify()} */}
            <Graph
                graph={graphData}
                options={options}
                events={events}
                getNetwork={(network: any) => {
                    //  if you want access to vis.js network api you can set the state in a parent component using this property
                }}
            />
        </>

    );
}

export default App