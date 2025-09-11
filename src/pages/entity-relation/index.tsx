import React, { FC, lazy, useEffect, useMemo, useRef, useState } from "react";
import { Form, Select, Button, Card, Input, message, Collapse, Typography, Flex, Modal, Splitter, ConfigProvider, Drawer } from "antd";
import axios from "axios";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
const { Option } = Select;
const { Search } = Input;
import debounce from "lodash.debounce";
import { useModal } from "@/hooks/useModal";
import { useOutletContext } from "react-router";
import ForceGraph3D from "react-force-graph-3d";
import { useResizeDetector } from 'react-resize-detector';
// import * as THREE from "three";
import SpriteText from "three-spritetext";
import { ComponentsRender } from './components'
// const  AIChat  = lazy(() => import('@/components/chat'));
const Panel: FC<any> = () => {
    // const [chatOpen, setChatOpen] = useState(false);
    const [sizes, setSizes] = React.useState<(number | string)[]>(['100%', '0%']);
    const [activeView, setActiveView] = useState<string | null>(null);
    const [data, setData] = useState<any>();

    const containerRef = useRef<HTMLDivElement>(null);
    const [innerHeight, setInnerHeight] = useState<any>(null);
    const updateHeight = () => {
        if (containerRef.current) {
            const height = containerRef.current.getBoundingClientRect().top // 包含 padding
            setInnerHeight(window.innerHeight - height);
        }
    }
    // useEffect(() => {

    // }, []);
    useEffect(() => {
        updateHeight(); // 初始化
        window.addEventListener("resize", updateHeight);
        // window.addEventListener("scroll", updateHeight);
        return () => {
            window.removeEventListener("resize", updateHeight);
            //   window.removeEventListener("scroll", updateHeight);
        };
    }, []);

    return <div style={{ backgroundColor: "#f0f2f5", padding: "1rem 1rem 0 1rem  " }}>
        <div ref={containerRef}>
            {/* {innerHeight} */}
            <ConfigProvider
                theme={{
                    components: {
                        Splitter: {
                            splitBarSize: 5,
                            splitTriggerSize: 30
                        },
                    },
                }}
            >
                <Splitter
                    onResize={setSizes}
                // splitterStyle={{

                // }}
                >
                    <Splitter.Panel size={sizes[0]} min={"20%"} style={{ paddingRight: `${activeView ? "0.5rem" : "0"}` }}>
                        <GraphView
                            height={innerHeight}
                            openView={(view: string, data?: any) => {
                                setActiveView(view)
                                if (view == "details") {
                                    setSizes(['70%', '30%'])

                                } else {
                                    setSizes(['80%', '20%'])

                                }
                                if (data) {
                                    setData(data)
                                }
                            }} activeView={activeView} />
                    </Splitter.Panel>

                    {activeView && (
                        <Splitter.Panel size={sizes[1]} min={"20%"} style={{ paddingLeft: `${activeView ? "0.5rem" : "0"}` }}>
                            {/* <ChatView closeChat={() => {
                            setChatOpen(false)
                            setSizes(['100%', '0%'])
                        }} /> */}
                            <ComponentsRender height={innerHeight} data={data} view={activeView} close={() => {
                                setActiveView(null)
                                setData(null)
                                setSizes(['100%', '0%'])
                            }}></ComponentsRender>
                        </Splitter.Panel>
                    )}
                </Splitter>
            </ConfigProvider>
        </div>

        {/* {chatOpen?"aaa":"bbb"} */}
        {/* {JSON.stringify(sizes)} */}
        {/* {height} */}


    </div>

}
export default Panel;
const GraphView: React.FC<any> = ({ openView, height, activeView }) => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });

    const [searchText, setSearchText] = useState("");
    const fgRef = useRef<any>(null);
    const [labelFilter, setLabelFilter] = useState("");
    const { modal, openModal, closeModal } = useModal();
    const { width, ref } = useResizeDetector<HTMLDivElement>();
    const [is3D, setIs3D] = useState(true); // 2D/3D 切换
    const [hoverNode, setHoverNode] = useState(null);
    // const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [contextNode, setContextNode] = useState<any>(null);
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
    const [openRightMenu, setOpenRightMenu] = useState(false);
    const { messageApi } = useOutletContext<any>()

    // const [selectedNode, setSelectedNode] = useState<null>(null);

    const menuItems = [{
        key: "details",
        label: "详情"
    }];

    const handleRightClick = (node: any, event: any) => {
        event.preventDefault(); // prevent default browser menu
        setContextNode(node)
        // console.log(node)
        setOpenRightMenu(true)
        setMenuPos({ x: event.clientX, y: event.clientY });
    };

    const handleMenuClick = (action: any) => {
        // alert(`Action "${action}" on node "${contextNode.name}"`);
        if (action.key == "details") {
            // console.log(contextNode)
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
    function isWebGLAvailable() {
        try {
            const canvas = document.createElement("canvas");
            const isAvailable = !!(
                window.WebGLRenderingContext 
            );
            if (!isAvailable) {
                setIs3D(false)
            }
            return isAvailable
        } catch (e) {
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
    const fetchGraph = async (keyword?: string) => {
        const res = await axios.get("/entity-relation/graph", {
            params: {
                label: labelFilter || undefined,
                keyword: keyword || undefined,
            },
        });
        setGraphData(res.data);
    };
    useEffect(() => {
        return () => {
            if (fgRef.current?.renderer) {
                fgRef.current.renderer().dispose();
                fgRef.current = null;
            }
        }
    }, []);
    useEffect(() => {
        fetchGraph();
    }, [labelFilter]); // labelFilter 改变时刷新数据

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
    const debouncedSearch = useMemo(() => {
        return debounce((value: string) => {
            fetchGraph(value);         // 拉取后端数据
            handleSearchNode(value);   // 高亮节点
        }, 500); // 500ms 防抖
    }, [graphData, labelFilter]);
    const labelColorMap: Record<string, string> = {
        "Study": "#1f77b4",
        "Disease": "#ff7f0e",
        "Taxonomy": "#2ca02c",
        "taxonomy": "#2ca02c",
    };
    const nodeOperation = {
        onNodeClick: (node: any) => {
            openView("details", { id: node.id, label: node.label, entity_name: node.entity_name })
            setContextNode(node)
            // openModal("nodeView", { id: node.id, label: node.label, entity_name: node.entity_name })
        },
        // onNodeHover={(node) => setHoverNode(node)}
        onNodeRightClick: handleRightClick,

    }

    return (
        <>

            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    // padding: "20px 0",

                }}
            >

                {/* <div style={{ marginBottom: "1rem" }}> </div> */}

                <Card
                    styles={{ body: { padding: 0 } }}
                    size="small"
                    extra={<>
                        <Flex justify="flex-end" gap="small">
                            <Button
                                size="small"
                                color="blue"
                                variant="solid"
                                onClick={() => {

                                    const isAvailable = isWebGLAvailable()
                                    if (isAvailable) {
                                        setIs3D(!is3D)
                                    }else{
                                        setIs3D(false)
                                        messageApi.error("WebGL not available!")
                                    }

                                }}
                            >
                                切换到 {is3D ? "2D" : "3D"}
                            </Button>
                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                openView("chat")
                            }}>打开对话框</Button>

                            <Button size="small" color="cyan" variant="solid" onClick={() => {
                                openModal("entityRelationForm")
                            }}>新增</Button>
                            <Button size="small" color="cyan" variant="solid" onClick={() => fetchGraph()}>刷新</Button>
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
                    {/* 下拉框 + 搜索框 */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                        <Select
                            value={labelFilter}
                            onChange={(value) => setLabelFilter(value)}
                            style={{ width: 200 }}
                        >
                            <Option value="">全部节点类型</Option>
                            <Option value="Study">Study</Option>
                            <Option value="Disease">Disease</Option>
                            <Option value="Taxonomy">Taxonomy</Option>
                        </Select>

                        <Search
                            placeholder="搜索..."
                            value={searchText}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchText(val);
                                debouncedSearch(val); // 输入即触发防抖搜索
                            }}
                            onSearch={(val) => {
                                setSearchText(val);
                                debouncedSearch(val); // 输入即触发防抖搜索
                            }}
                            style={{ flex: 1 }}
                        />
                    </div>
                    {/* 关系图 */}
                    <div ref={ref} style={{}}
                        // onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                        >
                        {/* {width}-{height} */}
                        {/* {JSON.stringify(contextNode)} */}
                        {(is3D && isWebGLAvailable()) ? (
                            <ForceGraph3D
                                ref={fgRef}
                                graphData={graphData}
                                nodeAutoColorBy="label"
                                nodeLabel={(node: any) => `${node.label}: ${node.entity_name || node.id}`}
                                linkLabel={(link: any) => link.type}
                                width={width}
                                height={height}
                                backgroundColor="#111111" // 黑色背景
                                linkColor={() => "rgba(200,200,200,0.5)"} // 浅灰色连线
                                linkWidth={2}
                                nodeThreeObjectExtend={true}
                                nodeColor={(node: any) => {
                                    if (searchText && (node.entity_name?.includes(searchText) || node.id.includes(searchText))) {
                                        return "red";
                                    }
                                    if (node.id.includes(contextNode?.id)) {
                                        return "red";
                                    }

                                    return node.label && labelColorMap[node.label] ? labelColorMap[node.label] : "#888888";
                                }
                                }
                                nodeVal={(node: any) => {
                                    if (searchText && (node.entity_name?.includes(searchText) || node.id.includes(searchText))) {
                                        return 10; // 放大球体半径
                                    }
                                    return 4; // 普通大小
                                }}
                                nodeThreeObject={(node: any) => {
                                    const color = node.label && labelColorMap[node.label] ? labelColorMap[node.label] : "#888888"; // 获取节点颜色
                                    const sprite: any = new SpriteText(node.entity_name || node.id);
                                    sprite.color = color; // 白色文字
                                    sprite.textHeight = 8;
                                    sprite.center.y = -0.6; // 放在球体上方
                                    return sprite;
                                }}
                                {...nodeOperation}

                            />
                        ) : (
                            <ForceGraph2D
                                ref={fgRef}
                                graphData={graphData}
                                nodeAutoColorBy="label"
                                nodeLabel={(node: any) => `${node.label}: ${node.entity_name || node.id}`}
                                linkLabel={(link: any) => link.type}
                                width={width}
                                // nodeObjectExtend={true}
                                height={height}
                                backgroundColor="#111111" // 黑色背景
                                linkColor={() => "rgba(200,200,200,0.5)"} // 浅灰色连线
                                linkWidth={2}
                                nodeRelSize={8}


                                nodeCanvasObject={(node, ctx, globalScale) => {
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
                    {/* {JSON.stringify(hoverNode)} */}
                </Card>
            </div>

            <EntityRelationForm
                callback={() => fetchGraph()}
                visible={modal.key == "entityRelationForm" && modal.visible}
                params={modal.params}
                onClose={closeModal}
            ></EntityRelationForm>
            <NodeView
                callback={() => fetchGraph()}
                visible={modal.key == "nodeView" && modal.visible}
                params={modal.params}
                onClose={() => {
                    setContextNode(null)
                    closeModal()
                }}
            ></NodeView>
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


const NodeView: FC<any> = ({ visible, params, onClose, callback }) => {

    return <Drawer title={`${params?.entity_name ? params.entity_name : ""}`} open={visible} onClose={onClose} width={"50%"} placement={"right"}>
        {JSON.stringify(params)}
    </Drawer>

}


const EntityRelationForm: React.FC<any> = ({ visible, params, onClose, callback }) => {
    const [form] = Form.useForm();
    const { messageApi } = useOutletContext<any>()

    const [fromLabel, setFromLabel] = useState<string>("study");
    const [toLabel, setToLabel] = useState<string>("disease");

    const [fromOptions, setFromOptions] = useState<any[]>([]);
    const [toOptions, setToOptions] = useState<any[]>([]);

    // 实时搜索实体
    const handleSearch = async (label: string, keywords: string, setOptions: any) => {
        if (!keywords) return;
        try {
            const res = await axios.get(`/entity/find-by-name/${label}/${keywords}`);
            setOptions(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const getRequest = (values: any) => {
        const fromEntity = fromOptions.find((e) => e.entity_id === values.from_entity);
        const toEntity = toOptions.find((e) => e.entity_id === values.to_entity);

        const payload = {
            from_entity: {
                label: fromLabel,// .charAt(0).toUpperCase() + fromLabel.slice(1), // Study/Disease/Taxonomy
                entity_id: fromEntity.entity_id,
                properties: fromEntity,
            },
            to_entity: {
                label: toLabel,//.charAt(0).toUpperCase() + toLabel.slice(1),
                entity_id: toEntity.entity_id,
                properties: toEntity,
            },
            relation_type: values.relation_type,
        };
        return payload
    }
    const onSubmit = async () => {
        const values = await form.validateFields()
        const payload = getRequest(values)
        // console.log("生成的 JSON:", payload);
        // message.success("生成 JSON 已打印在控制台");
        await axios.post("/entity-relation/relationships", payload)
        messageApi.success("关系创建成功");
        onClose()
        if (callback) {
            callback()

        }
    };

    return (
        <Modal open={visible} onCancel={onClose} onClose={onClose} onOk={onSubmit}>
            {/* <Card title="创建实体关系" className="w-[600px] mx-auto mt-10"> */}
            <Form form={form} layout="vertical" >
                {/* From 实体 */}
                <Form.Item label="From 实体类型">
                    <Select value={fromLabel} onChange={setFromLabel}>
                        <Option value="study">Study</Option>
                        <Option value="disease">Disease</Option>
                        <Option value="taxonomy">Taxonomy</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="from_entity" label="选择 From 实体" rules={[{ required: true }]}>
                    <Select
                        showSearch
                        placeholder="输入关键词搜索实体"
                        filterOption={false}
                        onSearch={(val) => handleSearch(fromLabel, val, setFromOptions)}
                    >
                        {fromOptions.map((e) => (
                            <Option key={e.entity_id} value={e.entity_id}>
                                {e.entity_name || e.title || e.rank || e.entity_id}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* To 实体 */}
                <Form.Item label="To 实体类型">
                    <Select value={toLabel} onChange={setToLabel}>
                        <Option value="study">Study</Option>
                        <Option value="disease">Disease</Option>
                        <Option value="taxonomy">Taxonomy</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="to_entity" label="选择 To 实体" rules={[{ required: true }]}>
                    <Select
                        showSearch
                        placeholder="输入关键词搜索实体"
                        filterOption={false}
                        onSearch={(val) => handleSearch(toLabel, val, setToOptions)}
                    >
                        {toOptions.map((e) => (
                            <Option key={e.entity_id} value={e.entity_id}>
                                {e.entity_name || e.title || e.rank || e.entity_id}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* 关系类型 */}
                <Form.Item
                    name="relation_type"
                    label="关系类型"
                    rules={[{ required: true, message: "请输入关系类型" }]}
                >
                    {/* <Input placeholder="例如: ASSOCIATED_WITH" /> */}
                    <Select options={[
                        { value: "ASSOCIATED_WITH", label: "ASSOCIATED_WITH" }
                    ]}></Select>
                </Form.Item>

                {/* <Form.Item>
                        <Button type="primary" htmlType="submit">
                            创建关系
                        </Button>
                    </Form.Item> */}
                <Collapse ghost items={[
                    {
                        key: "1",
                        label: "更多",
                        children: <>
                            <Form.Item noStyle shouldUpdate>
                                {() => (
                                    <Typography>
                                        <pre>{JSON.stringify(getRequest(form.getFieldsValue()), null, 2)}</pre>
                                    </Typography>
                                )}
                            </Form.Item>
                        </>
                    }
                ]} />
            </Form>


            {/* </Card> */}
            {/* <GraphView></GraphView> */}
        </Modal>
    );
};


