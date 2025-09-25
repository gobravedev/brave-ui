
import React, { FC, forwardRef, lazy, memo, Suspense, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Form, Select, Button, Card, Input, message, Collapse, Typography, Flex, Modal, Splitter, ConfigProvider, Drawer, Popover, Skeleton, Spin, Dropdown, Space, Checkbox, Tag, Tooltip, Radio } from "antd";
import axios from "axios";

const { Option } = Select;
const { Search } = Input;
import debounce from "lodash.debounce";
import { useModal } from "@/hooks/useModal";
import { useOutletContext } from "react-router";
import { useResizeDetector } from 'react-resize-detector';
import { DownOutlined, FilterOutlined, InfoCircleOutlined, LoadingOutlined, NodeIndexOutlined, PlusCircleOutlined, RadarChartOutlined, RedoOutlined, RobotOutlined, TableOutlined } from "@ant-design/icons"
// import * as THREE from "three";

import { useDispatch, useSelector } from "react-redux";
import { setDisplayNode } from '@/store/graphSlice'
import { useI18n } from "@/hooks/useI18n";
import { AssociationModal } from "@/pages/entity/components";
// import TextSprite from 'three-spritetext';

const nodeLabelOptions = [
    { label: "Disease", value: "disease" },
    { label: "Taxonomy", value: "taxonomy" },
    { label: "Diet_and_food", value: "diet_and_food" },
    { label: "Study", value: "study" },
];


const ForceGraphView = lazy(() => import('./force-graph'))
const VisNetwork = lazy(() => import('./vis-network'))

export const graphViewMapping: {
    key: string;
    label: string;
    component: React.ComponentType<any>;
}[] = [
        { key: "forceGraphView", label: "ai chat", component: ForceGraphView },
        { key: "visNetwork", label: "details", component: VisNetwork },
    ];


export const GraphRender: FC<any> = ({ view, ...rest }) => {
    if (!view) return <div onClick={close}>未知类型</div>;
    const item = graphViewMapping.find((v) => v.key === view);
    if (!item) return <div>未知类型</div>;
    const { component: Component, key, ...crest } = item
    // const Component = item.component;

    return <Suspense fallback={<Skeleton active></Skeleton>}>
        <Component  {...crest}  {...rest} />
    </Suspense>
};

const GraphView0 = ({ openView, height, activeView, updateQueryParams, entity_id,openGlobalModal, ...rest }: any, ref: any) => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [selectedLink, setSelectedLink] = useState<any>();
    const [view, setView] = useState<any>("visNetwork")
    // const spriteCache = new Map<string, any>();
    const spriteCacheRef = useRef<Map<string, any>>(new Map());
    console.log('GraphView mounted')
    // const [searchText, setSearchText] = useState<any>();
    const fgRef = useRef<any>(null);
    const { locale } = useI18n()

    // const [labelFilter, setLabelFilter] = useState("");
    const { modal, openModal, closeModal } = useModal();
    const { width, ref: divRef } = useResizeDetector<HTMLDivElement>();
    const [is3D, setIs3D] = useState<any>(null); // 2D/3D 切换
    const [hoverNode, setHoverNode] = useState(null);
    const [loading, setLoading] = useState<any>(false)
    // const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [contextNode, setContextNode] = useState<any>(null);
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
    const [openRightMenu, setOpenRightMenu] = useState(false);
    const { messageApi } = useOutletContext<any>()
    const [webglInfo, setWebglInfo] = useState<any>(null);
    const [modalApi, contextHolder] = Modal.useModal();
    // const [entityId, setEntityId] = useState<any>(entity_id)
    const dispatch = useDispatch()

    const { displayNode } = useSelector((state: any) => state.graph)

    const [graphReady, setGraphReady] = useState(true);


    // const [selectedLabels, setSelectedLabels] = useState<string[]>(displayNode);


    const updateWebglInfo = () => {
        if (fgRef.current?.renderer) {
            const renderer = fgRef.current.renderer();
            console.log(renderer.info)
            setWebglInfo({
                geometries: renderer.info.memory.geometries,
                textures: renderer.info.memory.textures,
                programs: renderer.info.programs?.length || 0,
                renderCalls: renderer.info.render.calls,
            });
        }
    };
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         updateWebglInfo();
    //     }, 1000); // 每秒更新一次

    //     return () => clearInterval(interval);
    // }, []);
    // const [selectedNode, setSelectedNode] = useState<null>(null);

    useImperativeHandle(ref, () => ({
        reload: fetchGraph,
        cancelSelectLink: () => setSelectedLink(null),
        cancelSelectNode: () => setContextNode(null),
        updateQueryParam: updateQueryParam,
        queryParams
    }))

    const menuItems = [{
        key: "details",
        label: "details"
    }];



    const handleMenuClick = (action: any) => {
        // alert(`Action "${action}" on node "${contextNode.name}"`);
        if (action.key == "details") {
            console.log(action)
            console.log(contextNode)
            updateQueryParam("entity_id", contextNode.id)
            // openModal("nodeView", { id: contextNode.id, label: contextNode.label, entity_name: contextNode.entity_name })
        }
        setOpenRightMenu(false)// close menu
    };
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenRightMenu(false);
        };

        if (openRightMenu) {
            window.addEventListener('click', handleClickOutside);
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [contextNode]);
    const isWebGLAvailable = () => {
        console.log("isWebGLAvailable")
        try {
            const canvas = document.createElement("canvas");
            return !!window.WebGLRenderingContext && !!canvas.getContext("webgl");
        } catch {
            return false;
        }
    }

    // const [dimensions, setDimensions] = useState({
    //     width: window.innerWidth, // 最大宽度 1200px
    //     height: window.innerHeight * 0.8,
    // });

    // useEffect(() => {
    //     const handleResize = () => {
    //         setDimensions({
    //             width: window.innerWidth,
    //             height: window.innerHeight * 0.8,
    //         });
    //     };
    //     window.addEventListener("resize", handleResize);
    //     return () => window.removeEventListener("resize", handleResize);
    // }, []);
    // 获取图数据
    // const fetchGraph = async () => {
    //     setLoading(true)
    //     // disposeGraph3D(); 
    //     console.log(selectedLabels)
    //     const res = await axios.post("/entity-relation/graph", {
    //         label: labelFilter || undefined,
    //         keyword: searchText || undefined,
    //         entity_id: entityId || undefined,
    //         nodes: selectedLabels
    //     });
    //     setGraphData(res.data);
    //     setLoading(false)
    //     // fgRef.current.refresh()

    // };

    // 通用查询参数 state
    const [queryParams, setQueryParams] = useState({
        label: "" as string | undefined,
        keyword: undefined as string | undefined,
        entity_id: entity_id as string | undefined,
        nodes: displayNode as string[],
        nodes_dict: undefined as any[] | undefined,
        nodes_dict_condition: "OR" as string,

    });

    // 通用更新函数
    const updateQueryParam = <K extends keyof typeof queryParams>(
        key: K,
        value: (typeof queryParams)[K]
    ) => {
        // console.log("aaaaaaaaaaaaaaaa",key,value)
        setQueryParams(prev => ({
            ...prev,
            [key]: value || undefined, // 统一处理空值 → undefined
        }));
    };

    // 调用接口
    const fetchGraph = async () => {
        // console.log(fgRef.current)
        disposeGraph3D()
        // fgRef.current?.refresh()
        setLoading(true);
        
        console.log("请求参数:", queryParams);

        const res = await axios.post("/entity-relation/graph", {
            ...queryParams,
            locale: locale
        });

        setGraphData(res.data);
        setLoading(false);

    };




    const removeQueryParam = (key: Exclude<keyof typeof queryParams, "nodes">) => {
        setQueryParams(prev => ({
            ...prev,
            [key]: undefined,
        }));
    };
    // const disposeGraph3D = () => {
    //     if (!fgRef.current) return;
    //     // 释放 renderer
    //     const renderer = fgRef.current.renderer?.();
    //     if (renderer) renderer.dispose();

    //     // 释放 scene 中的 geometry / material / spriteText
    //     const scene = fgRef.current.scene?.();
    //     if (scene) {
    //         scene.traverse((obj: any) => {
    //             if (obj.geometry) obj.geometry.dispose();
    //             if (obj.material) {
    //                 if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
    //                 else obj.material.dispose();
    //             }
    //             // SpriteText 会生成 THREE 对象
    //             if (obj.text) obj.text = null;
    //         });
    //     }

    //     fgRef.current = null;
    // };
    // const getWebGLInfo = () => {
    //     // console.log(fgRef.current)
    //     if (fgRef.current?.renderer) {
    //         const renderer = fgRef.current.renderer();
    //         console.log('Info:', renderer.info);
    //         return renderer.info
    //         // renderer.info.memory.geometries, .textures, .programs
    //     }
    //     return null
    // }
    // const disposeGraph3D = () => {
    //     if (!fgRef.current) return;
    //     // if (fgRef.current?.renderer) {
    //     //     const renderer = fgRef.current.renderer();
    //     //     console.log('Info:', renderer.info);
    //     //     // renderer.info.memory.geometries, .textures, .programs
    //     // }
    //     // 释放 renderer
    //     const renderer = fgRef.current.renderer?.();
    //     if (renderer) renderer.dispose();

    //     // 遍历场景释放几何体和材质
    //     const scene = fgRef.current.scene?.();
    //     if (scene) {
    //         scene.traverse((obj: any) => {
    //             if (obj.geometry) obj.geometry.dispose();
    //             if (obj.material) {
    //                 if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
    //                 else obj.material.dispose();
    //             }
    //         });
    //     }

    //     // fgRef.current = null;
    // };
    const disposeGraph3D2 = () => {
        const fg = fgRef.current;
        if (!fg) return;

        // 清理 SpriteText 缓存
        spriteCacheRef.current.forEach(sprite => {
            if (sprite && sprite.dispose) sprite.dispose();
        });
        spriteCacheRef.current.clear();

        // 遍历场景释放几何体和材质
        const scene = fg.scene?.();
        if (scene) {
            scene.traverse((obj: any) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
                    else obj.material.dispose();
                }
                // if (obj.text) obj.text = null; // SpriteText
            });
        }

        // 清理渲染器内存（不 dispose 渲染器）
        const renderer = fg.renderer?.();
        if (renderer) {
            renderer.renderLists?.dispose();
        }
    };

    const disposeGraph3D = () => {
        if (!fgRef.current) return;

        const fg = fgRef.current;

        // 停止动画循环
        if (fg.pauseAnimation) fg.pauseAnimation();

        // 释放 renderer
        const renderer = fg.renderer?.();
        if (renderer) renderer.dispose();

        // 释放场景中的几何体和材质
        const scene = fg.scene?.();
        if (scene) {
            scene.traverse((obj: any) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
                    else obj.material.dispose();
                }
                // if (obj.text) obj.text = null; // SpriteText
            });
        }

        // 清空缓存
        spriteCacheRef.current.clear();

        // fgRef.current = null; // 一定要清掉
    };

    useEffect(() => {
        if (!isWebGLAvailable()) {
            setIs3D(false)
        } else {
            setIs3D(true)
        }
        return () => {
            disposeGraph3D();
        };
    }, []);
    // useEffect(() => {
    //     getWebGLInfo()
    //     if (fgRef.current) {

    //         // 清理旧资源
    //         disposeGraph3D();
    //     }
    // }, [width, height]); // 每次 resize 前清理

    const toggle3D = () => {
        if (is3D) disposeGraph3D(); // 释放旧 3D 资源
        // console.log(is3D)
        if (isWebGLAvailable()) setIs3D(!is3D);
        else {
            setIs3D(false);
            messageApi.error("WebGL not available!");
        }
    };

    useEffect(() => {
        fetchGraph();
        if (updateQueryParams) {
            updateQueryParams(queryParams)
        }
    }, [queryParams, locale]); // labelFilter 改变时刷新数据

    // 搜索节点，高亮 & 缩放
    const handleSearchNode = (keyword: string) => {
        if (!keyword) return;

        const node: any = graphData.nodes.find(
            (n: any) =>
                (n.entity_name && n.entity_name.includes(keyword)) ||
                n.id.includes(keyword)
        );
        if (node && fgRef.current) {
            const distance = 100;
            const distRatio = 1 + distance / Math.hypot(node.x!, node.y!);
            fgRef.current.centerAt(node.x! * distRatio, node.y! * distRatio, 1000);
            fgRef.current.zoom(2, 1000);
        }
    };

    // 防抖搜索
    // const debouncedSearch = useMemo(() => {
    //     return debounce((value: string) => {
    //         fetchGraph();         // 拉取后端数据
    //         handleSearchNode(value);   // 高亮节点
    //     }, 500); // 500ms 防抖
    // }, [graphData, labelFilter,searchText]);
    // const labelColorMap: Record<string, string> = {
    //     "study": "#1f77b4",
    //     "disease": "#ff7f0e",
    //     "taxonomy": "#2ca02c",
    //     "association": "blue"
    // };
    const labelColorMap: Record<string, string> = {
        study: "#6a5acd",        // SlateBlue，文献
        disease: "#ff6347",      // Tomato，疾病
        taxonomy: "#3cb371",     // MediumSeaGreen，菌
        association: "#ffa500",   // Orange，Association 证据
        diet_and_food: "#20b2aa"
    };


    // useEffect(() => {
    //     if (!fgRef.current) return;

    //     const fg = fgRef.current;

    //     // 设置节点之间距离
    //     fg.d3Force("link")!.distance(50);   // 连接线长度
    //     fg.d3Force("charge")!.strength(-50); // 节点斥力，越负节点越远
    // }, [graphData]);


    const params = {
        loading,
        is3D,
        fgRef,
        graphData,
        width,
        height,
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
    }

    return (
        <>
            {contextHolder}
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    // padding: "20px 0",

                }}
            >
                {/* {JSON.stringify(displayNode)} */}

                {/* <div style={{ marginBottom: "1rem" }}> </div> */}
                <Card
                    title={<div >
                        {/* 遍历普通参数 */}
                        {Object.entries(queryParams)
                            .filter(
                                ([key, value]) =>
                                    key !== "nodes" && key !== "label" && key !== "nodes_dict" && key != "nodes_dict_condition" && value !== undefined
                            )
                            .map(([key, value]) => (
                                <Tag
                                    key={key}
                                    closable
                                    color="blue"
                                    onClose={() => removeQueryParam(key as any)}
                                    style={{ marginBottom: 8 }}
                                >
                                    {key}: {String(value)}
                                </Tag>
                            ))}

                        {/* nodes_dict 支持 */}
                        {queryParams.nodes_dict &&
                            Object.entries(queryParams.nodes_dict)
                                .filter(([nodeLabel, ids]: [string, any[]]) => ids && ids.length > 0)
                                .map(([nodeLabel, ids]: [string, any[]]) => (
                                    <Tag
                                        key={nodeLabel}
                                        onClick={() => openView("dataFilter")}
                                        color="green"
                                        style={{ marginBottom: "0.5rem", cursor: "pointer" }}
                                    >
                                        {nodeLabel}: {ids.length}
                                    </Tag>
                                ))}
                    </div>}
                    styles={{ body: { padding: 0 } }}
                    size="small"
                    extra={<>
                        <Flex justify="flex-end" gap="small">
                            {view == "forceGraphView" &&
                                <span
                                    style={{ cursor: "pointer" }}
                                    onClick={toggle3D}
                                >
                                    {is3D ? "2D" : "3D"}
                                </span>
                            }
                            <RadioDropdown options={[
                                {
                                    label: "VisNetwork",
                                    value: "visNetwork"
                                }, {
                                    label: "ForceGraphView",
                                    value: "forceGraphView"
                                }
                            ]}
                                onChange={() => { }}
                                selectedLabel={view}
                                setSelectedLabel={setView}
                                loading={loading}></RadioDropdown>

                            <NodeFilterDropdown
                                loading={loading}
                                options={nodeLabelOptions}
                                selectedLabels={queryParams.nodes}
                                setSelectedLabels={(val: any) => updateQueryParam("nodes", val)}
                                onChange={(labels: any) => {
                                    // setSelectedLabels(labels);
                                    updateQueryParam("nodes", labels)
                                    dispatch(setDisplayNode(labels))

                                }}
                            />

                            <Tooltip title="association page" >
                                <TableOutlined onClick={() => {
                                    openView("associationPage")
                                }} />
                            </Tooltip>
                            {/* <Button onClick={() => { getWebGLInfo() }}>aa</Button> */}
                            {/* <Button size="small" color="cyan" variant="solid" >AI</Button> */}
                            <Tooltip title="data screening" >
                                <FilterOutlined onClick={() => {
                                    openView("dataFilter")
                                }} />
                            </Tooltip>
                            <Tooltip title="AI">
                                <RobotOutlined onClick={() => {
                                    openView("chat")
                                }} />
                            </Tooltip>

                            {/* <Button size="small" color="cyan" variant="solid" >新增</Button> */}
                            <Tooltip title="create">
                                <PlusCircleOutlined onClick={() => {
                                    openGlobalModal("optModal", { entityType: "association" })
                                }} />
                            </Tooltip>

                            <Tooltip title="refresh">
                                <RedoOutlined onClick={() => fetchGraph()} />
                            </Tooltip>
                            {/* <Button size="small" color="cyan" variant="solid" >刷新</Button> */}
                            <InfoCircleOutlined onClick={() => {
                                updateWebglInfo()
                                openModal("webGLInfo")
                            }} />
                        </Flex>
                    </>}
                    style={{
                        // width: dimensions.width,
                        borderRadius: "12px",
                        height: height, //window.innerHeight * 0.8 ,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        padding: "0.5rem",
                        overflow: "hidden",
                        width: "100%"
                    }}
                >
                    {/* {graphReady && <>aaaaaaaaaaaaaa</>} */}
                    {/* {JSON.stringify(queryParams)} */}
                    {/* 下拉框 + 搜索框 */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                        {/* <Select
                            value={queryParams.label}
                            onChange={(value) => updateQueryParam("label", value)}
                            style={{ width: 200 }}
                        >
                            <Option value="">全部节点类型</Option>
                            <Option value="Study">Study</Option>
                            <Option value="Disease">Disease</Option>
                            <Option value="Taxonomy">Taxonomy</Option>
                        </Select> */}

                        <Search
                            placeholder="搜索..."
                            allowClear
                            // value={searchText}
                            // onChange={(e) => {
                            //     const val = e.target.value;
                            //     setSearchText(val);
                            //     // debouncedSearch(val); // 输入即触发防抖搜索
                            // }}
                            onSearch={(val) => {
                                // setSearchText(val);
                                updateQueryParam("keyword", val)
                                // debouncedSearch(val); // 输入即触发防抖搜索
                            }}
                            style={{ flex: 1 }}
                        />
                    </div>  
                    {/* 关系图 */} 
                    <Spin indicator={<LoadingOutlined spin />}
                        spinning={loading || is3D == null || !graphReady  }>
                        {/* */}
                        <div ref={divRef} style={{ height: `${height}px` }}  //,background:"#111111"
                        // onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                        >

                            {/* !loading &&  */}
                            {/* <ForceGraphView {...params}></ForceGraphView> */}

                            <GraphRender {...params} {...rest} view={view}></GraphRender>

                            {/* {width}-{height} */}
                            {/* {JSON.stringify(contextNode)} */}

                            {(openRightMenu && contextNode) && (
                                <div
                                    style={{
                                        position: 'fixed',
                                        top: menuPos.y,
                                        left: menuPos.x,
                                        background: '#222',
                                        border: '1px solid #444',
                                        borderRadius: '8px',
                                        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                                        zIndex: 100,
                                        padding: '4px 0',
                                        minWidth: '160px',
                                        color: 'white',
                                    }}
                                >
                                    {menuItems.map((item) => (
                                        <div
                                            key={item.key}
                                            onClick={() => handleMenuClick(item)}
                                            style={{
                                                padding: '8px 16px',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s, color 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#555';
                                                e.currentTarget.style.color = '#fff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                        >
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* {hoverNode && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: mousePos.y + 10,
                                    left: mousePos.x + 10,
                                    background: 'rgba(255,255,255,0.9)',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                    pointerEvents: 'none',
                                    zIndex: 10,
                                }}
                            >
                                
                                <div>Additional info...</div>
                            </div>
                        )} */}
                        </div>
                    </Spin>
                    {/* {JSON.stringify(hoverNode)} */}
                </Card>
            </div>

            {/* <EntityRelationForm
                callback={() => fetchGraph()}
                visible={modal.key == "entityRelationForm" && modal.visible}
                params={modal.params}
                onClose={closeModal}
            ></EntityRelationForm> */}
     
            <NodeView
                callback={() => fetchGraph()}
                visible={modal.key == "nodeView" && modal.visible}
                params={modal.params}
                onClose={() => {
                    setContextNode(null)
                    closeModal()
                }}
            ></NodeView>
            <WebGLInfo
                webglInfo={webglInfo}
                visible={modal.key == "webGLInfo" && modal.visible}
                onClose={closeModal}
            ></WebGLInfo>
        </>
    );
};
//  nodeThreeObject={(node: any) => {
//    // 普通节点
//    const sphere = new THREE.Mesh(
//      new THREE.SphereGeometry(6, 16, 16),
//      new THREE.MeshBasicMaterial({ color: node.color || "#888" })
//    );

//    // 搜索高亮
//    const label = node.entity_name || node.id;
//    if (searchText && label.includes(searchText)) {
//      sphere.material = new THREE.MeshBasicMaterial({
//        color: 0xff0000, // 红色高亮
//      });
//      sphere.scale.set(1.5, 1.5, 1.5); // 放大
//    }

//    return sphere;
//  }}
const WebGLInfo: FC<any> = ({ webglInfo, visible, onClose }) => {

    return <Modal title={"webGL"} footer={null} open={visible} onCancel={onClose} onClose={onClose}>
        {webglInfo && <ul>
            <li>geometries: {webglInfo.geometries}</li>
            <li>textures: {webglInfo.textures}</li>
            <li>programs: {webglInfo.programs}</li>
            <li>renderCalls: {webglInfo.renderCalls}</li>

        </ul>}
    </Modal>
}

const NodeView: FC<any> = ({ visible, params, onClose, callback }) => {

    return <Drawer title={`${params?.entity_name ? params.entity_name : ""}`} open={visible} onClose={onClose} width={"50%"} placement={"right"}>
        {JSON.stringify(params)}
    </Drawer>

}


// const EntityRelationForm: React.FC<any> = ({ visible, params, onClose, callback }) => {
//     const [form] = Form.useForm();
//     const { messageApi } = useOutletContext<any>()

//     const [fromLabel, setFromLabel] = useState<string>("study");
//     const [toLabel, setToLabel] = useState<string>("disease");

//     const [fromOptions, setFromOptions] = useState<any[]>([]);
//     const [toOptions, setToOptions] = useState<any[]>([]);

//     // 实时搜索实体
//     const handleSearch = async (label: string, keywords: string, setOptions: any) => {
//         if (!keywords) return;
//         try {
//             const res = await axios.get(`/entity/find-by-name/${label}/${keywords}`);
//             setOptions(res.data || []);
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const getRequest = (values: any) => {
//         const fromEntity = fromOptions.find((e) => e.entity_id === values.from_entity);
//         const toEntity = toOptions.find((e) => e.entity_id === values.to_entity);

//         const payload = {
//             from_entity: {
//                 label: fromLabel,// .charAt(0).toUpperCase() + fromLabel.slice(1), // Study/Disease/Taxonomy
//                 entity_id: fromEntity.entity_id,
//                 properties: fromEntity,
//             },
//             to_entity: {
//                 label: toLabel,//.charAt(0).toUpperCase() + toLabel.slice(1),
//                 entity_id: toEntity.entity_id,
//                 properties: toEntity,
//             },
//             relation_type: values.relation_type,
//         };
//         return payload
//     }
//     const onSubmit = async () => {
//         const values = await form.validateFields()
//         const payload = getRequest(values)
//         // console.log("生成的 JSON:", payload);
//         // message.success("生成 JSON 已打印在控制台");
//         await axios.post("/entity-relation/relationships", payload)
//         messageApi.success("关系创建成功");
//         onClose()
//         if (callback) {
//             callback()

//         }
//     };

//     return (
//         <Modal open={visible} onCancel={onClose} onClose={onClose} onOk={onSubmit}>
//             {/* <Card title="创建实体关系" className="w-[600px] mx-auto mt-10"> */}
//             <Form form={form} layout="vertical" >
//                 {/* From 实体 */}
//                 <Form.Item label="From 实体类型">
//                     <Select value={fromLabel} onChange={setFromLabel}>
//                         <Option value="study">Study</Option>
//                         <Option value="disease">Disease</Option>
//                         <Option value="taxonomy">Taxonomy</Option>
//                     </Select>
//                 </Form.Item>

//                 <Form.Item name="from_entity" label="选择 From 实体" rules={[{ required: true }]}>
//                     <Select
//                         showSearch
//                         placeholder="输入关键词搜索实体"
//                         filterOption={false}
//                         onSearch={(val) => handleSearch(fromLabel, val, setFromOptions)}
//                     >
//                         {fromOptions.map((e) => (
//                             <Option key={e.entity_id} value={e.entity_id}>
//                                 {e.entity_name || e.title || e.rank || e.entity_id}
//                             </Option>
//                         ))}
//                     </Select>
//                 </Form.Item>

//                 {/* To 实体 */}
//                 <Form.Item label="To 实体类型">
//                     <Select value={toLabel} onChange={setToLabel}>
//                         <Option value="study">Study</Option>
//                         <Option value="disease">Disease</Option>
//                         <Option value="taxonomy">Taxonomy</Option>
//                     </Select>
//                 </Form.Item>

//                 <Form.Item name="to_entity" label="选择 To 实体" rules={[{ required: true }]}>
//                     <Select
//                         showSearch
//                         placeholder="输入关键词搜索实体"
//                         filterOption={false}
//                         onSearch={(val) => handleSearch(toLabel, val, setToOptions)}
//                     >
//                         {toOptions.map((e) => (
//                             <Option key={e.entity_id} value={e.entity_id}>
//                                 {e.entity_name || e.title || e.rank || e.entity_id}
//                             </Option>
//                         ))}
//                     </Select>
//                 </Form.Item>

//                 {/* 关系类型 */}
//                 <Form.Item
//                     name="relation_type"
//                     label="关系类型"
//                     rules={[{ required: true, message: "请输入关系类型" }]}
//                 >
//                     {/* <Input placeholder="例如: ASSOCIATED_WITH" /> */}
//                     <Select options={[
//                         { value: "ASSOCIATED_WITH", label: "ASSOCIATED_WITH" }
//                     ]}></Select>
//                 </Form.Item>

//                 {/* <Form.Item>
//                         <Button type="primary" htmlType="submit">
//                             创建关系
//                         </Button>
//                     </Form.Item> */}
//                 <Collapse ghost items={[
//                     {
//                         key: "1",
//                         label: "更多",
//                         children: <>
//                             <Form.Item noStyle shouldUpdate>
//                                 {() => (
//                                     <Typography>
//                                         <pre>{JSON.stringify(getRequest(form.getFieldsValue()), null, 2)}</pre>
//                                     </Typography>
//                                 )}
//                             </Form.Item>
//                         </>
//                     }
//                 ]} />
//             </Form>


//             {/* </Card> */}
//             {/* <GraphView></GraphView> */}
//         </Modal>
//     );
// };
// export default memo(forwardRef(GraphView), (prevProps, nextProps) => {return true});

const GraphView = forwardRef<any, any>(GraphView0)

// const ForceGraphView: FC<any> = ({graphViewRef, }) => {

//     return <>
//         <GraphView
//             ref={graphViewRef}
//             height={innerHeight}
//             updateQueryParams={updateQueryParams}
//             openView={(view: string, data?: any) => {
//                 setActiveView(view)
//                 setSizes(['70%', '30%'])
//                 if (data) {
//                     setData(data)
//                 }
//             }} activeView={activeView} />
//     </>
// }
export default GraphView

const NodeFilterDropdown: FC<any> = ({ options, onChange, selectedLabels, setSelectedLabels, loading }) => {

    return (
        <Dropdown
            trigger={["hover"]}
            dropdownRender={() => (
                <div
                    style={{
                        padding: 12,
                        backgroundColor: "#1f1f1f", // 深色背景
                        borderRadius: 8,           // 圆角
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)", // 阴影
                        // width: 200,
                        color: "#fff",             // 文字白色
                    }}
                >
                    <Spin spinning={loading}>
                        <Checkbox.Group
                            style={{ display: "flex", flexDirection: "column", gap: 8 }}
                            options={options.map((opt: any) => ({
                                label: opt.label,
                                value: opt.value,
                                style: { color: "#fff" } // checkbox文字白色
                            }))}
                            value={selectedLabels}
                            onChange={(checkedValues) => {
                                setSelectedLabels(checkedValues as string[]);
                                onChange(checkedValues as string[]);
                            }}
                        /></Spin>
                    <div style={{ marginTop: 12, textAlign: "center" }}>
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => {
                                if (selectedLabels.length === nodeLabelOptions.length) {
                                    setSelectedLabels([]);
                                    onChange([]);
                                } else {
                                    const all = nodeLabelOptions.map(o => o.value);
                                    setSelectedLabels(all);
                                    onChange(all);
                                }
                            }}
                        >
                            {selectedLabels.length === nodeLabelOptions.length ? " Unselect All" : "Select All"}
                        </Button>
                    </div>
                </div>
            )}
        >
            <NodeIndexOutlined />
        </Dropdown>
    );
}



const RadioDropdown: FC<any> = ({
    options,
    onChange,
    selectedLabel,
    setSelectedLabel,
    loading = false,
}) => {
    return (
        <Dropdown
            trigger={["hover"]}
            dropdownRender={() => (
                <div
                    style={{
                        padding: 12,
                        backgroundColor: "#1f1f1f", // 深色背景
                        borderRadius: 8,           // 圆角
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)", // 阴影
                        color: "#fff",             // 文字白色
                    }}
                >
                    <Spin spinning={loading}>
                        <Radio.Group
                            style={{ display: "flex", flexDirection: "column", gap: 8 }}
                            options={options.map((opt: any) => ({
                                label: opt.label,
                                value: opt.value,
                                style: { color: "#fff" }, // radio文字白色
                            }))}
                            value={selectedLabel}
                            onChange={(e) => {
                                setSelectedLabel(e.target.value);
                                onChange(e.target.value);
                            }}
                        />
                    </Spin>
                </div>
            )}
        >
          <RadarChartOutlined />
        </Dropdown>
    );
};