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
import { GraphRender, ComponentsRender } from './components'
import { AssociationModal } from "../entity/components";
// import GraphView from './components/graph-view'
// const  AIChat  = lazy(() => import('@/components/chat'));
const Panel: FC<any> = () => {
    // const [chatOpen, setChatOpen] = useState(false);
    const [sizes, setSizes] = React.useState<(number | string)[]>(['100%', '0%']);
    const [activeView, setActiveView] = useState<string | null>(null);
    const [data, setData] = useState<any>();
    const graphViewRef = useRef<any>(null)
    const compRef = useRef<any>(null)
    const [queryParams, updateQueryParams] = useState({

    });
    const { modal, openModal, closeModal } = useModal();

    const compReload = () => {
        if (compRef.current?.reload) {
            compRef.current?.reload()
        }
    }

    const containerRef = useRef<HTMLDivElement>(null);
    const [innerHeight, setInnerHeight] = useState<any>(null);
    const updateHeight = () => {
        if (containerRef.current) {
            const height = containerRef.current.getBoundingClientRect().top // 包含 padding
            setInnerHeight(window.innerHeight - height);
        }
    }
    useEffect(() => {
        updateHeight(); // 初始化
        window.addEventListener("resize", updateHeight);
        // window.addEventListener("scroll", updateHeight);
        return () => {
            window.removeEventListener("resize", updateHeight);
            //   window.removeEventListener("scroll", updateHeight);
        };
    }, []);
    const loadGraph = () => {
        if (graphViewRef.current) {
            graphViewRef.current.reload()
        }
    }
    const cancelSelectLink = () => {
        if (graphViewRef.current) {
            graphViewRef.current.cancelSelectLink()
        }
    }
    const cancelSelectNode = () => {
        if (graphViewRef.current) {
            graphViewRef.current.cancelSelectNode()
        }
    }
    const updateQueryParam = (key: any, value: any) => {
        if (graphViewRef.current) {
            graphViewRef.current.updateQueryParam(key, value)
        }
    }
    // const openModal = (value: any, params?: any) => {
    //     if (graphViewRef.current) {
    //         graphViewRef.current.openModal(value, params)
    //     }
    // }

    // useEffect(() => {

    // }, []);
 
    const [animatedSizes, setAnimatedSizes] = useState<(number | string)[]>(sizes);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setAnimatedSizes(sizes));
        return () => cancelAnimationFrame(frame);
    }, [sizes]);


    return <div style={{ padding: "1rem 1rem 0 1rem  " }}>
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
                    <Splitter.Panel size={animatedSizes[0]} min={"20%"} style={{ paddingRight: `${activeView ? "0.5rem" : "0"}` }}>
                        <GraphRender
                            ref={graphViewRef}
                            height={innerHeight}
                            openGlobalModal={openModal}
                            updateQueryParams={updateQueryParams}
                            openView={(view: string, data?: any) => {
                                setActiveView(view)
                                setSizes(['70%', '30%'])
                                if (data) {
                                    setData(data)
                                }
                            }} activeView={activeView} />

                    </Splitter.Panel>

                    {activeView && (

                        <Splitter.Panel size={animatedSizes[1]} min={"20%"} style={{
                            paddingLeft: `${activeView ? "0.5rem" : "0"}`,
                            // flexBasis: sizes[1],
                            // transition: "flex-basis 0.5s ease",
                            // transition: "flex-basis 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                            // transition: "width 5s cubic-bezier(0.4,0,0.2,1)",
                            overflow: "hidden", // 防止内容溢出闪烁
                        }}>
                            {/* <ChatView closeChat={() => {
                            setChatOpen(false)
                            setSizes(['100%', '0%'])
                        }} /> */}
                            <ComponentsRender
                                ref={compRef}
                                graphOpt={{
                                    loadGraph: loadGraph,
                                    openModal: openModal,
                                    updateQueryParam: updateQueryParam,
                                    cancelSelectLink: cancelSelectLink,
                                    cancelSelectNode: cancelSelectNode
                                }}
                                queryParams={queryParams}
                                // loadGraph={loadGraph}
                                height={innerHeight} data={data} view={activeView}
                                close={() => {
                                    setActiveView(null)
                                    setData(null)
                                    setSizes(['100%', '0%'])
                                    cancelSelectLink()
                                    cancelSelectNode()
                                }}></ComponentsRender>
                        </Splitter.Panel>
                    )}
                </Splitter>
            </ConfigProvider>

            <AssociationModal
                callback={() => { compReload(); loadGraph() }}
                visible={modal.key == "optModal" && modal.visible}
                params={modal.params}
                onClose={closeModal}
            ></AssociationModal>

        </div>

        {/* {chatOpen?"aaa":"bbb"} */}
        {/* {JSON.stringify(sizes)} */}
        {/* {height} */}


    </div>

}
export default Panel;




