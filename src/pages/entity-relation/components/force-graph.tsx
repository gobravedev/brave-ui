import { FC, useCallback } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";

import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
const ForceGraph: FC<any> = ({ loading,
        is3D,
       fgRef,
       graphData, 
       width, height, 
       queryParams, 
       contextNode, 
       labelColorMap,
       spriteCacheRef,
       graphReady,
       openView,
       setContextNode,
       setSelectedLink,
       setOpenRightMenu,
       setMenuPos,
       selectedLink,
       setGraphReady
     }) => {

    const nodeTreeObject = useCallback((node: any) => {
        const key = String(node.id ?? node.node_id ?? node.entity_id ?? node.entity_name);
        const cache = spriteCacheRef.current;
        // console.log(cache.has(key))
        if (!cache.has(key)) {
            const color = labelColorMap[node.label] || "#888888";
            const sprite: any = new SpriteText(node.entity_name ?? node.id ?? key);
            sprite.color = color;
            sprite.textHeight = 8;
            if (sprite.center) sprite.center.y = -0.6;
            cache.set(key, sprite);
        }
        return cache.get(key);
    }, [])
    const handleRightClick = (node: any, event: any) => {
        event.preventDefault(); // prevent default browser menu
        setContextNode(node)
        // console.log(node)
        setOpenRightMenu(true)
        setMenuPos({ x: event.clientX, y: event.clientY });
    };
    const nodeOperation = {
        onNodeClick: (node: any) => {
            openView("details", { id: node.id, label: node.label, entity_name: node.entity_name, node_id: node.node_id })
            setContextNode(node)
            setSelectedLink(null)
            // openModal("nodeView", { id: node.id, label: node.label, entity_name: node.entity_name })
        },
        // onNodeHover={(node) => setHoverNode(node)}
        onNodeRightClick: handleRightClick,
        onLinkClick: (link: any) => {
            // console.log(link)
            setContextNode(null)
            console.log(link)
            // openView("relation", link)
            // setSelectedLink(link); //
        },
        linkColor: (link: any) => {
            console.log(link)
            if (selectedLink) {
                return link.relation_id === selectedLink.relation_id ? "red" : "rgba(200,200,200,0.5)"
            }
            return "rgba(200,200,200,0.5)"
        },
        onNodeDragEnd: (node: any) => {
            node.fx = node.x;
            node.fy = node.y;
            node.fz = node.z;
        },
        onEngineTick: () => {
            if (!graphReady) {
                setGraphReady(true);
                console.log("graphReady")
            }
        },
        linkLabel: (link: any) => {
            const label = link.relations.map((item: any) => `${item.study_name}(${item.effect})`).join(", ")
            return label
        }
        // (link: any) =>{
        //     selectedLink && link.relation_id === selectedLink.relation_id ? "red" : "rgba(200,200,200,0.5)"
        // }


    }

 
    return <>

        {(!loading && is3D != null) &&
            <>
                {(is3D) ? (
                    <ForceGraph3D

                        ref={fgRef}
                        graphData={graphData}
                        nodeAutoColorBy="label"
                        nodeLabel={(node: any) => `${node.label}: ${node.entity_name || node.id}`}

                        width={width}
                        height={height}
                        // backgroundColor="#111111" // 黑色背景
                        // linkColor={() => "rgba(200,200,200,0.5)"} // 浅灰色连线
                        linkWidth={2}
                        nodeThreeObjectExtend={true}
                        linkAutoColorBy={"type"}
                        nodeColor={(node: any) => {

                            const searchText = queryParams.keyword
                            if (searchText && (node.entity_name?.includes(searchText) || node.id.includes(searchText))) {
                                return "red";
                            }
                            if (node.id.includes(contextNode?.id)) {
                                return "red";
                            }
                            if (node.label === "taxonomy") {
                                const maxLinks = 50; // 假设最大链接数为50，用于归一化
                                const count = node.taxonomy_links || 1;
                                const intensity = Math.min(count / maxLinks, 1); // 0~1
                                // 绿色渐变：亮 -> 深
                                return `rgb(${56 * (1 - intensity)}, ${205 * (1 - intensity)}, ${113 * (1 - intensity)})`;
                            }

                            return node.label && labelColorMap[node.label] ? labelColorMap[node.label] : "#888888";
                        }
                        }
                        nodeVal={(node: any) => {
                            const searchText = queryParams.keyword

                            // debugger
                            if (node.label == "association") {
                                return 1
                            }
                            // else if (node.label === "taxonomy") {
                            //     // 最小 4，最大 20，可根据实际数据调整
                            //     return Math.min(Math.max(node.taxonomy_links || 1, 4), 20);
                            // }
                            if (searchText && (node.entity_name?.includes(searchText) || node.id.includes(searchText))) {
                                return 10; // 放大球体半径
                            }
                            return 4; // 普通大小
                        }}
                        linkThreeObjectExtend={true}
                        // linkThreeObject={linkTreeObject}
                        nodeThreeObject={nodeTreeObject}
                        // nodeThreeObject={(node: any) => {
                        //     const color = node.label && labelColorMap[node.label] ? labelColorMap[node.label] : "#888888"; // 获取节点颜色
                        //     const sprite: any = new SpriteText(node.entity_name || node.id);
                        //     sprite.color = color; // 白色文字
                        //     sprite.textHeight = 8;
                        //     sprite.center.y = -0.6; // 放在球体上方
                        //     return sprite;
                        // }}
                        {...nodeOperation}

                    />
                ) : (
                    <ForceGraph2D
                        ref={fgRef}
                        graphData={graphData}
                        nodeAutoColorBy="label"
                        nodeLabel={(node: any) => `${node.label}: ${node.entity_name || node.id}`}
                        // linkLabel={(link: any) => link.type}
                        width={width}
                        // nodeObjectExtend={true}
                        height={height}
                        backgroundColor="#111111" // 黑色背景
                        // linkColor={() => "rgba(200,200,200,0.5)"} // 浅灰色连线
                        linkWidth={2}
                        nodeRelSize={8}


                        nodeCanvasObject={(node, ctx, globalScale) => {
                            const searchText = queryParams.keyword

                            const label = node.entity_name || node.id;
                            const color = node.label && labelColorMap[node.label] ? labelColorMap[node.label] : "#888888" // 节点和文字同色
                            const fontSize = 12 / globalScale;

                            ctx.fillStyle = color;
                            ctx.beginPath();
                            ctx.arc(node.x!, node.y!, 6, 0, 2 * Math.PI);
                            ctx.fill();

                            // 搜索高亮描边
                            if (searchText && label.includes(searchText)) {
                                ctx.strokeStyle = "#ff0000";
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                ctx.arc(node.x!, node.y!, 8, 0, 2 * Math.PI);
                                ctx.stroke();
                            }

                            ctx.fillStyle = color; // 文字同节点颜色
                            ctx.font = `${fontSize}px Sans-Serif`;
                            ctx.fillText(label, node.x! + 8, node.y! + 4);
                        }}
                        {...nodeOperation}
                    // onNodeHover={(node) => setHoverNode(node)}
                    // onNodeRightClick={handleRightClick}
                    />
                )}
            </>
        }
    </>

}
export default   ForceGraph



